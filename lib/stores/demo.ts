'use client';

// ─────────────────────────────────────────────
// Demo runtime store
//
// Journey A (spec §7.1) requires that after a
// successful payment:
//   • the property's balance drops (ideally to 0)
//   • a new transaction appears in "Recent
//     activity" on the dashboard
//
// We keep these runtime overrides on top of the
// static fixtures so the demo feels real but can
// be reset to seed (spec §10.3 dev toolbar).
//
// Persisted to localStorage so a reviewer can
// refresh after paying and still see the result.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/mocks/fixtures/transactions';

export interface DemoState {
  /** Extra deltas applied on top of the seeded balance (typically negative). */
  balanceDeltas: Record<string, number>;
  /** Transactions added at runtime (newest first). */
  extraTransactions: Transaction[];

  applyPayment: (tx: Transaction) => void;
  reset: () => void;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      balanceDeltas: {},
      extraTransactions: [],

      applyPayment: (tx) => {
        const deltas = { ...get().balanceDeltas };
        const current = deltas[tx.propertyId] ?? 0;
        // A successful payment reduces the balance.
        deltas[tx.propertyId] =
          tx.status === 'succeeded' ? current - tx.amount : current;
        set({
          balanceDeltas: deltas,
          extraTransactions: [tx, ...get().extraTransactions],
        });
      },

      reset: () => set({ balanceDeltas: {}, extraTransactions: [] }),
    }),
    {
      name: 'bikita-demo',
    },
  ),
);

// ─── Helpers ──────────────────────────────────

import { PROPERTIES, type Property, tierOf } from '@/mocks/fixtures/properties';
import { TRANSACTIONS } from '@/mocks/fixtures/transactions';

export function usePropertiesForOwner(ownerId: string | null): Property[] {
  const deltas = useDemoStore((s) => s.balanceDeltas);
  if (!ownerId) return [];
  return PROPERTIES.filter((p) => p.ownerId === ownerId).map((p) => ({
    ...p,
    balanceUsd: Math.max(0, Number((p.balanceUsd + (deltas[p.id] ?? 0)).toFixed(2))),
  }));
}

export function usePropertyWithOverrides(id: string | undefined): Property | undefined {
  const deltas = useDemoStore((s) => s.balanceDeltas);
  if (!id) return undefined;
  const base = PROPERTIES.find((p) => p.id === id);
  if (!base) return undefined;
  return {
    ...base,
    balanceUsd: Math.max(0, Number((base.balanceUsd + (deltas[id] ?? 0)).toFixed(2))),
  };
}

export function useTransactionsForOwner(ownerId: string | null): Transaction[] {
  const extras = useDemoStore((s) => s.extraTransactions);
  if (!ownerId) return [];
  const all = [...extras, ...TRANSACTIONS].filter((t) => t.ownerId === ownerId);
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function useTransactionsForProperty(propertyId: string): Transaction[] {
  const extras = useDemoStore((s) => s.extraTransactions);
  const all = [...extras, ...TRANSACTIONS].filter((t) => t.propertyId === propertyId);
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export { tierOf };
