'use client';

// ─────────────────────────────────────────────
// CRM counter-desk store
//
// Runtime state for actions a clerk performs at
// the counter on behalf of a customer:
//   • raising a penalty (or waiving one)
//   • submitting a licence application
//   • logging an interaction note
//
// Cash-receipt payments live in useDemoStore
// (`applyPayment`) — that path already decrements
// the property balance and appears in the demo
// "Recent activity" feeds. This store adds the
// CRM-specific runtime records.
//
// Persisted to localStorage so a reviewer can
// refresh mid-session without losing state.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Application, ApplicationType } from '@/mocks/fixtures/applications';
import { APPLICATION_TYPE_LABEL, APPLICATIONS } from '@/mocks/fixtures/applications';
import type { Penalty, PenaltyReason } from '@/mocks/fixtures/penalties';
import { PENALTIES } from '@/mocks/fixtures/penalties';

export interface CustomerNote {
  id: string;
  ownerId: string;
  authorName: string;
  createdAt: string;
  body: string;
  kind: 'call' | 'counter' | 'letter' | 'email' | 'note';
}

interface CrmState {
  runtimePenalties: Penalty[];
  runtimeApplications: Application[];
  runtimeNotes: CustomerNote[];

  raisePenalty: (input: {
    ownerId: string;
    propertyId?: string;
    reason: PenaltyReason;
    amountUsd: number;
    note?: string;
    appliedBy: string;
  }) => Penalty;

  waivePenalty: (id: string, input: { waivedBy: string; waiverReason: string }) => void;

  markPenaltyPaid: (id: string) => void;

  submitApplication: (input: {
    ownerId: string;
    propertyId?: string;
    type: ApplicationType;
    feeUsd: number;
    note?: string;
    submittedBy: string;
  }) => Application;

  addNote: (input: {
    ownerId: string;
    authorName: string;
    body: string;
    kind: CustomerNote['kind'];
  }) => CustomerNote;

  reset: () => void;
}

let seq = 0;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(++seq).toString(36)}`;

const nowIso = () => new Date().toISOString();

export const useCrmStore = create<CrmState>()(
  persist(
    (set, get) => ({
      runtimePenalties: [],
      runtimeApplications: [],
      runtimeNotes: [],

      raisePenalty: (input) => {
        const count = PENALTIES.length + get().runtimePenalties.length + 1;
        const reference = `PEN-2026-${String(count).padStart(4, '0')}`;
        const penalty: Penalty = {
          id: uid('pen'),
          reference,
          ownerId: input.ownerId,
          propertyId: input.propertyId,
          reason: input.reason,
          note: input.note,
          amountUsd: input.amountUsd,
          appliedAt: nowIso(),
          appliedBy: input.appliedBy,
          status: 'active',
        };
        set({ runtimePenalties: [penalty, ...get().runtimePenalties] });
        return penalty;
      },

      waivePenalty: (id, input) => {
        const items = get().runtimePenalties.map((p) =>
          p.id === id
            ? { ...p, status: 'waived' as const, waivedBy: input.waivedBy, waivedAt: nowIso(), waiverReason: input.waiverReason }
            : p,
        );
        // If it's a seed penalty, add an override record instead of mutating PENALTIES.
        const seed = PENALTIES.find((p) => p.id === id);
        if (seed && !get().runtimePenalties.some((p) => p.id === id)) {
          items.unshift({
            ...seed,
            status: 'waived',
            waivedBy: input.waivedBy,
            waivedAt: nowIso(),
            waiverReason: input.waiverReason,
          });
        }
        set({ runtimePenalties: items });
      },

      markPenaltyPaid: (id) => {
        const items = get().runtimePenalties.map((p) =>
          p.id === id ? { ...p, status: 'paid' as const } : p,
        );
        const seed = PENALTIES.find((p) => p.id === id);
        if (seed && !get().runtimePenalties.some((p) => p.id === id)) {
          items.unshift({ ...seed, status: 'paid' });
        }
        set({ runtimePenalties: items });
      },

      submitApplication: (input) => {
        const prefix =
          input.type === 'business-licence' ? 'BL' :
          input.type === 'building-plan'    ? 'BP' :
          input.type === 'market-stall'     ? 'MS' :
          input.type === 'residential-stand' ? 'RS' :
          input.type === 'liquor-licence'   ? 'LL' :
          input.type === 'burial-order'     ? 'BO' :
          input.type === 'hawkers-permit'   ? 'HP' :
                                              'RC';
        const count =
          APPLICATIONS.length + get().runtimeApplications.length + 1;
        const reference = `${prefix}-2026-${String(count).padStart(4, '0')}`;
        const app: Application = {
          id: uid('app'),
          reference,
          type: input.type,
          title: `${APPLICATION_TYPE_LABEL[input.type]} (counter-submitted)`,
          ownerId: input.ownerId,
          propertyId: input.propertyId,
          submittedAt: nowIso(),
          stage: 'submitted',
          feeUsd: input.feeUsd,
          feePaid: true,
          events: [
            {
              at: nowIso(),
              stage: 'submitted',
              note: `Submitted at the counter by ${input.submittedBy}${input.note ? ` — ${input.note}` : ''}.`,
            },
          ],
        };
        set({ runtimeApplications: [app, ...get().runtimeApplications] });
        return app;
      },

      addNote: (input) => {
        const note: CustomerNote = {
          id: uid('note'),
          ownerId: input.ownerId,
          authorName: input.authorName,
          createdAt: nowIso(),
          body: input.body,
          kind: input.kind,
        };
        set({ runtimeNotes: [note, ...get().runtimeNotes] });
        return note;
      },

      reset: () => set({ runtimePenalties: [], runtimeApplications: [], runtimeNotes: [] }),
    }),
    { name: 'bikita-crm' },
  ),
);

// ─── Hook helpers ────────────────────────────

export function usePenaltiesForOwner(ownerId: string) {
  const runtime = useCrmStore((s) => s.runtimePenalties);
  const waived = new Set(
    runtime.filter((p) => p.status !== 'active').map((p) => p.id),
  );
  // Merge runtime-overridden seed penalties first so they take precedence.
  const seed = PENALTIES.filter((p) => p.ownerId === ownerId && !waived.has(p.id));
  const added = runtime.filter((p) => p.ownerId === ownerId);
  return [...added, ...seed].sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));
}

export function useApplicationsForOwner(ownerId: string) {
  const runtime = useCrmStore((s) => s.runtimeApplications);
  const added = runtime.filter((a) => a.ownerId === ownerId);
  const seed = APPLICATIONS.filter((a) => a.ownerId === ownerId);
  return [...added, ...seed].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export function useNotesForOwner(ownerId: string) {
  const runtime = useCrmStore((s) => s.runtimeNotes);
  return runtime.filter((n) => n.ownerId === ownerId);
}

export function usePenaltyCountsForOwner(ownerId: string) {
  const list = usePenaltiesForOwner(ownerId);
  const active = list.filter((p) => p.status === 'active');
  return {
    all: list,
    active,
    outstandingUsd: active.reduce((s, p) => s + p.amountUsd, 0),
  };
}
