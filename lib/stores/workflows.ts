'use client';

// ─────────────────────────────────────────────
// Workflow designer + interest/penalty rules
// (spec §3.2 Phase 2 items consolidated).
//
// Workflows: per application type, the sequence of
// stages with approver role + SLA. Visual only —
// the real kanban stages remain driven by STAGE_ORDER.
//
// Interest rules: monthly compounding rate +
// grace days + cap. Applied when showing projected
// balances on the property statement.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkflowStage {
  id: string;
  label: string;
  approverRole: 'Clerk' | 'Revenue Officer' | 'Works Supervisor' | 'Administrator';
  slaHours: number;
}

export interface Workflow {
  id: string;
  name: string;
  stages: WorkflowStage[];
  updatedAt: string;
}

export interface InterestRules {
  monthlyRatePct: number;
  graceDays: number;
  capPct: number;
  effectiveFrom: string;
}

interface WorkflowsState {
  workflows: Workflow[];
  interest: InterestRules;

  reorder: (id: string, from: number, to: number) => void;
  updateStage: (workflowId: string, stageId: string, patch: Partial<WorkflowStage>) => void;
  addStage: (workflowId: string) => void;
  removeStage: (workflowId: string, stageId: string) => void;
  setInterest: (patch: Partial<InterestRules>) => void;
  reset: () => void;
}

function sid() {
  return `st_${Math.random().toString(36).slice(2, 8)}`;
}

const SEED: Workflow[] = [
  {
    id: 'wf_business_licence',
    name: 'Business licence',
    updatedAt: new Date().toISOString(),
    stages: [
      { id: sid(), label: 'Submitted',             approverRole: 'Clerk',            slaHours: 4 },
      { id: sid(), label: 'Under review',           approverRole: 'Clerk',            slaHours: 24 },
      { id: sid(), label: 'Inspection scheduled',   approverRole: 'Works Supervisor', slaHours: 48 },
      { id: sid(), label: 'Approved',               approverRole: 'Revenue Officer',  slaHours: 24 },
      { id: sid(), label: 'Issued',                 approverRole: 'Administrator',    slaHours:  8 },
    ],
  },
  {
    id: 'wf_building_plan',
    name: 'Building plan',
    updatedAt: new Date().toISOString(),
    stages: [
      { id: sid(), label: 'Submitted',             approverRole: 'Clerk',            slaHours:  4 },
      { id: sid(), label: 'Plans review',           approverRole: 'Works Supervisor', slaHours: 72 },
      { id: sid(), label: 'Site inspection',        approverRole: 'Works Supervisor', slaHours: 48 },
      { id: sid(), label: 'Approved',               approverRole: 'Administrator',    slaHours: 24 },
      { id: sid(), label: 'Issued',                 approverRole: 'Administrator',    slaHours:  8 },
    ],
  },
  {
    id: 'wf_liquor_licence',
    name: 'Liquor licence',
    updatedAt: new Date().toISOString(),
    stages: [
      { id: sid(), label: 'Submitted',             approverRole: 'Clerk',            slaHours:  4 },
      { id: sid(), label: 'Police clearance',       approverRole: 'Administrator',    slaHours: 120 },
      { id: sid(), label: 'Council review',         approverRole: 'Revenue Officer',  slaHours: 72 },
      { id: sid(), label: 'Issued',                 approverRole: 'Administrator',    slaHours: 12 },
    ],
  },
];

const INTEREST_SEED: InterestRules = {
  monthlyRatePct: 1.5,
  graceDays: 10,
  capPct: 25,
  effectiveFrom: '2024-01-01',
};

export const useWorkflowsStore = create<WorkflowsState>()(
  persist(
    (set, get) => ({
      workflows: SEED,
      interest: INTEREST_SEED,

      reorder: (id, from, to) =>
        set({
          workflows: get().workflows.map((w) => {
            if (w.id !== id) return w;
            const stages = [...w.stages];
            const [moved] = stages.splice(from, 1);
            if (moved) stages.splice(to, 0, moved);
            return { ...w, stages, updatedAt: new Date().toISOString() };
          }),
        }),

      updateStage: (workflowId, stageId, patch) =>
        set({
          workflows: get().workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  stages: w.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s)),
                  updatedAt: new Date().toISOString(),
                }
              : w,
          ),
        }),

      addStage: (workflowId) =>
        set({
          workflows: get().workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  stages: [
                    ...w.stages,
                    { id: sid(), label: 'New stage', approverRole: 'Clerk', slaHours: 24 },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : w,
          ),
        }),

      removeStage: (workflowId, stageId) =>
        set({
          workflows: get().workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  stages: w.stages.filter((s) => s.id !== stageId),
                  updatedAt: new Date().toISOString(),
                }
              : w,
          ),
        }),

      setInterest: (patch) => set({ interest: { ...get().interest, ...patch } }),

      reset: () => set({ workflows: SEED, interest: INTEREST_SEED }),
    }),
    { name: 'bikita-workflows' },
  ),
);
