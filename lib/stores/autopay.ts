'use client';

// ─────────────────────────────────────────────
// Scheduled auto-pay (spec §3.1 "Scheduled
// auto-pay" Demo-Visual — setup form only, no
// cron). Persists per-property setups so the
// property card can show an "Auto-pay set" strip.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentChannel } from '@/mocks/fixtures/transactions';

export type AutoPayMode = 'full' | 'fixed';

export interface AutoPaySetup {
  id: string;
  propertyId: string;
  ownerId: string;
  mode: AutoPayMode;
  fixedAmountUsd?: number;
  channel: PaymentChannel;
  phone?: string;
  /** 1–28. Keeps it simple; real impl would handle month-end too. */
  dayOfMonth: number;
  active: boolean;
  createdAt: string;
}

interface AutoPayState {
  items: AutoPaySetup[];
  upsert: (input: Omit<AutoPaySetup, 'id' | 'createdAt'>) => AutoPaySetup;
  toggle: (id: string, active: boolean) => void;
  cancel: (id: string) => void;
  reset: () => void;
}

export const useAutoPayStore = create<AutoPayState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (input) => {
        const existing = get().items.find(
          (i) => i.propertyId === input.propertyId && i.ownerId === input.ownerId,
        );
        const setup: AutoPaySetup = existing
          ? { ...existing, ...input, id: existing.id, createdAt: existing.createdAt }
          : {
              ...input,
              id: `ap_${Math.random().toString(36).slice(2, 10)}`,
              createdAt: new Date().toISOString(),
            };
        set({
          items: [
            setup,
            ...get().items.filter((i) => i.id !== setup.id),
          ],
        });
        return setup;
      },

      toggle: (id, active) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, active } : i)) }),

      cancel: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      reset: () => set({ items: [] }),
    }),
    { name: 'bikita-autopay' },
  ),
);

export function useAutoPayForProperty(propertyId: string | null): AutoPaySetup | undefined {
  return useAutoPayStore((s) =>
    propertyId ? s.items.find((i) => i.propertyId === propertyId) : undefined,
  );
}
