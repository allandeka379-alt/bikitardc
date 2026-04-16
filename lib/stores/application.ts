'use client';

// ─────────────────────────────────────────────
// Application store
//
// Keeps:
//   • drafts  — partial form data saved between
//     wizard steps so a reviewer can leave and
//     come back (spec §3.1 "Draft save & resume")
//   • runtimeApps — new applications submitted
//     by the citizen in the current demo session
//   • feePaid — override for applications whose
//     fees were paid after initial seeding
//
// Read alongside the static APPLICATIONS fixture
// and the ERP store's `applicationStage` overrides
// through the helper hooks exported at the bottom.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  APPLICATIONS,
  type Application,
  type ApplicationStage,
  type ApplicationType,
} from '@/mocks/fixtures/applications';
import { useErpStore } from './erp';

export interface ApplicationDraft {
  slug: ApplicationType;
  step: number;
  data: Record<string, unknown>;
  updatedAt: string;
}

interface ApplicationState {
  drafts: Record<string, ApplicationDraft>;
  runtimeApps: Application[];
  feePaid: Record<string, boolean>;

  saveDraft: (slug: ApplicationType, step: number, data: Record<string, unknown>) => void;
  discardDraft: (slug: ApplicationType) => void;
  loadDraft: (slug: ApplicationType) => ApplicationDraft | undefined;

  createApplication: (app: Application) => void;
  markFeePaid: (id: string) => void;
  reset: () => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      drafts: {},
      runtimeApps: [],
      feePaid: {},

      saveDraft: (slug, step, data) =>
        set({
          drafts: {
            ...get().drafts,
            [slug]: { slug, step, data, updatedAt: new Date().toISOString() },
          },
        }),

      discardDraft: (slug) => {
        const { [slug]: _removed, ...rest } = get().drafts;
        void _removed;
        set({ drafts: rest });
      },

      loadDraft: (slug) => get().drafts[slug],

      createApplication: (app) => {
        // Avoid duplicates on re-submit (e.g. React strict-mode double-render)
        if (get().runtimeApps.some((a) => a.id === app.id)) return;
        set({ runtimeApps: [app, ...get().runtimeApps] });
      },

      markFeePaid: (id) => set({ feePaid: { ...get().feePaid, [id]: true } }),

      reset: () => set({ drafts: {}, runtimeApps: [], feePaid: {} }),
    }),
    { name: 'bikita-applications' },
  ),
);

// ─── Helper hooks ────────────────────────────

/**
 * Returns the merged list of applications — fixtures + runtime submissions —
 * with the ERP store's stage overrides applied and the citizen-side feePaid
 * override folded in.
 */
export function useAllApplications(): Application[] {
  const runtime = useApplicationStore((s) => s.runtimeApps);
  const feePaid = useApplicationStore((s) => s.feePaid);
  const stageOverrides = useErpStore((s) => s.applicationStage);

  const merged = [...runtime, ...APPLICATIONS];
  return merged.map((a) => ({
    ...a,
    stage: stageOverrides[a.id] ?? a.stage,
    feePaid: feePaid[a.id] ?? a.feePaid,
  }));
}

export function useApplicationsForOwner(ownerId: string | null): Application[] {
  const all = useAllApplications();
  if (!ownerId) return [];
  return all.filter((a) => a.ownerId === ownerId);
}

export function useApplicationByReference(reference: string): Application | undefined {
  const all = useAllApplications();
  return all.find((a) => a.reference === reference);
}
