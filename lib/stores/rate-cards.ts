'use client';

// Runtime overrides for the rate card + fee
// schedule. Admin edits live here so they feel
// real in the demo; reset returns to the seeded
// amounts.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FEE_SCHEDULE,
  RATE_CARD,
  type FeeScheduleItem,
  type PropertyClass,
  type RateCardLine,
} from '@/mocks/fixtures/rate-cards';

interface RateCardState {
  /** Per rate-card line → per-class amount override. */
  rateOverrides: Record<string, Partial<Record<PropertyClass, number>>>;
  feeOverrides: Record<string, number>;

  setRate: (kind: RateCardLine['kind'], cls: PropertyClass, value: number) => void;
  setFee: (id: string, value: number) => void;
  reset: () => void;
}

export const useRateCardStore = create<RateCardState>()(
  persist(
    (set, get) => ({
      rateOverrides: {},
      feeOverrides: {},

      setRate: (kind, cls, value) => {
        const existing = get().rateOverrides[kind] ?? {};
        set({
          rateOverrides: { ...get().rateOverrides, [kind]: { ...existing, [cls]: value } },
        });
      },

      setFee: (id, value) => set({ feeOverrides: { ...get().feeOverrides, [id]: value } }),

      reset: () => set({ rateOverrides: {}, feeOverrides: {} }),
    }),
    { name: 'bikita-rate-cards' },
  ),
);

export function useRateCard(): RateCardLine[] {
  const overrides = useRateCardStore((s) => s.rateOverrides);
  return RATE_CARD.map((line) => {
    const o = overrides[line.kind];
    if (!o) return line;
    return {
      ...line,
      residential: o.residential ?? line.residential,
      commercial: o.commercial ?? line.commercial,
      agricultural: o.agricultural ?? line.agricultural,
    };
  });
}

export function useFeeSchedule(): FeeScheduleItem[] {
  const overrides = useRateCardStore((s) => s.feeOverrides);
  return FEE_SCHEDULE.map((f) => ({ ...f, amountUsd: overrides[f.id] ?? f.amountUsd }));
}
