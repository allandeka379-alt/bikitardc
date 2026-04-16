'use client';

// ─────────────────────────────────────────────
// Adjustments & write-offs (spec §3.2).
//
// Staff raise a credit (e.g. goodwill) or debit
// (e.g. dispute outcome) on a resident's property
// balance. A second approver clears it, at which
// point the delta is applied to the demo balance
// and a notification + audit entry are written.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDemoStore } from './demo';
import { useNotificationsStore } from './notifications';

export type AdjustmentKind = 'credit' | 'debit';
export type AdjustmentStatus = 'pending' | 'approved' | 'rejected';

export interface Adjustment {
  id: string;
  reference: string;
  propertyId: string;
  propertyLabel: string;
  ownerId: string;
  ownerName: string;
  kind: AdjustmentKind;
  amountUsd: number;
  reason: string;
  status: AdjustmentStatus;
  raisedBy: string;
  raisedAt: string;
  decidedBy?: string;
  decidedAt?: string;
  staffNote?: string;
}

interface AdjustmentsState {
  items: Adjustment[];
  raise: (input: Omit<Adjustment, 'id' | 'reference' | 'status' | 'raisedAt'>) => Adjustment;
  approve: (id: string, actor: string, note?: string) => void;
  reject: (id: string, actor: string, note?: string) => void;
  reset: () => void;
}

function uid() {
  return `adj_${Math.random().toString(36).slice(2, 10)}`;
}

function ref() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `AJ-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`;
}

export const useAdjustmentsStore = create<AdjustmentsState>()(
  persist(
    (set, get) => ({
      items: [],

      raise: (input) => {
        const adj: Adjustment = {
          ...input,
          id: uid(),
          reference: ref(),
          status: 'pending',
          raisedAt: new Date().toISOString(),
        };
        set({ items: [adj, ...get().items] });
        return adj;
      },

      approve: (id, actor, note) => {
        const target = get().items.find((a) => a.id === id);
        if (!target || target.status !== 'pending') return;

        // Apply to demo balance. Credits subtract, debits add.
        const deltas = { ...useDemoStore.getState().balanceDeltas };
        const current = deltas[target.propertyId] ?? 0;
        const signed = target.kind === 'credit' ? -target.amountUsd : target.amountUsd;
        deltas[target.propertyId] = current + signed;
        useDemoStore.setState({ balanceDeltas: deltas });

        set({
          items: get().items.map((a) =>
            a.id === id
              ? { ...a, status: 'approved', decidedBy: actor, decidedAt: new Date().toISOString(), staffNote: note }
              : a,
          ),
        });

        useNotificationsStore.getState().push({
          ownerId: target.ownerId,
          event: 'application-stage',
          tone: target.kind === 'credit' ? 'success' : 'warning',
          title:
            target.kind === 'credit'
              ? `Credit adjustment of $${target.amountUsd.toFixed(2)} on ${target.propertyLabel}`
              : `Debit adjustment of $${target.amountUsd.toFixed(2)} on ${target.propertyLabel}`,
          body: target.reason,
          href: `/portal/property/${target.propertyId}`,
          channels: ['app', 'sms'],
        });
      },

      reject: (id, actor, note) => {
        set({
          items: get().items.map((a) =>
            a.id === id
              ? { ...a, status: 'rejected', decidedBy: actor, decidedAt: new Date().toISOString(), staffNote: note }
              : a,
          ),
        });
      },

      reset: () => set({ items: [] }),
    }),
    { name: 'bikita-adjustments' },
  ),
);

export function usePendingAdjustments(): Adjustment[] {
  // Filter OUTSIDE the Zustand selector — filtering inside returns a fresh
  // array each render and triggers an infinite re-render loop.
  const items = useAdjustmentsStore((s) => s.items);
  return items.filter((a) => a.status === 'pending');
}
