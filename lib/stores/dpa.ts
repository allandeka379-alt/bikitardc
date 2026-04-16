'use client';

// ─────────────────────────────────────────────
// Zimbabwe Data Protection Act rights workflow
// (spec §3.3). Residents can lodge access,
// correction or deletion requests; staff process
// them from /erp/dpa with a 30-day SLA.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotificationsStore } from './notifications';

export type DpaRightKind = 'access' | 'correction' | 'deletion' | 'objection';
export type DpaStatus = 'pending' | 'in-progress' | 'fulfilled' | 'rejected';

export interface DpaRequest {
  id: string;
  reference: string;
  kind: DpaRightKind;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  scope: string;
  reason: string;
  status: DpaStatus;
  submittedAt: string;
  dueBy: string;
  decidedAt?: string;
  decidedBy?: string;
  staffNote?: string;
  /** Data export path when the request is fulfilled with a download. */
  artifactLabel?: string;
}

export const DPA_LABEL: Record<DpaRightKind, string> = {
  access:     'Access my data',
  correction: 'Correct my data',
  deletion:   'Delete my data',
  objection:  'Object to processing',
};

export const DPA_DESCRIPTION: Record<DpaRightKind, string> = {
  access:     'Receive a machine-readable copy of every field the council holds about you.',
  correction: 'Fix anything the council has wrong — name, address, phone, property link.',
  deletion:   'Erase your personal data, subject to statutory retention rules.',
  objection:  'Stop a specific processing activity (e.g. direct marketing).',
};

interface DpaState {
  items: DpaRequest[];
  submit: (input: Omit<DpaRequest, 'id' | 'reference' | 'status' | 'submittedAt' | 'dueBy'>) => DpaRequest;
  advance: (id: string, actor: string) => void;
  fulfill: (id: string, actor: string, note?: string) => void;
  reject: (id: string, actor: string, note?: string) => void;
  reset: () => void;
}

function uid() {
  return `dpa_${Math.random().toString(36).slice(2, 10)}`;
}

function ref() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `DPA-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const useDpaStore = create<DpaState>()(
  persist(
    (set, get) => ({
      items: [],

      submit: (input) => {
        const submittedAt = new Date().toISOString();
        const r: DpaRequest = {
          ...input,
          id: uid(),
          reference: ref(),
          status: 'pending',
          submittedAt,
          dueBy: addDays(submittedAt, 30),
        };
        set({ items: [r, ...get().items] });
        useNotificationsStore.getState().push({
          ownerId: input.applicantId,
          event: 'application-stage',
          tone: 'info',
          title: `Data-rights request ${r.reference} received`,
          body: 'The council has 30 days under the Data Protection Act to respond.',
          href: '/portal/data-rights',
          channels: ['app', 'email'],
        });
        return r;
      },

      advance: (id, actor) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, status: 'in-progress', decidedBy: actor } : i,
          ),
        });
      },

      fulfill: (id, actor, note) => {
        const target = get().items.find((i) => i.id === id);
        if (!target) return;
        set({
          items: get().items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'fulfilled',
                  decidedAt: new Date().toISOString(),
                  decidedBy: actor,
                  staffNote: note,
                  artifactLabel:
                    i.kind === 'access' ? `bikita-data-export-${i.reference}.zip` : undefined,
                }
              : i,
          ),
        });
        useNotificationsStore.getState().push({
          ownerId: target.applicantId,
          event: 'application-stage',
          tone: 'success',
          title: `${target.reference} fulfilled`,
          body:
            target.kind === 'access'
              ? 'Your data export is ready to download.'
              : `Your ${DPA_LABEL[target.kind].toLowerCase()} request has been actioned.`,
          href: '/portal/data-rights',
          channels: ['app', 'email'],
        });
      },

      reject: (id, actor, note) => {
        const target = get().items.find((i) => i.id === id);
        if (!target) return;
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, status: 'rejected', decidedAt: new Date().toISOString(), decidedBy: actor, staffNote: note }
              : i,
          ),
        });
        useNotificationsStore.getState().push({
          ownerId: target.applicantId,
          event: 'application-stage',
          tone: 'danger',
          title: `${target.reference} declined`,
          body: note ?? 'Please contact the Data Protection Officer for details.',
          href: '/portal/data-rights',
          channels: ['app', 'email'],
        });
      },

      reset: () => set({ items: [] }),
    }),
    { name: 'bikita-dpa' },
  ),
);

export function useDpaForOwner(ownerId: string | null): DpaRequest[] {
  // Filter OUTSIDE the Zustand selector — filtering inside returns a fresh
  // array each render and triggers an infinite re-render loop.
  const items = useDpaStore((s) => s.items);
  if (!ownerId) return [];
  return items.filter((i) => i.applicantId === ownerId);
}
