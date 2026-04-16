'use client';

// Persisted store for the ad-hoc report builder's
// schedule list (spec §3.2).

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReportMetric = 'collections' | 'outstanding' | 'count';
export type ReportDimension = 'ward' | 'channel' | 'class' | 'month';
export type ReportShape = 'bar' | 'line';
export type ReportCadence = 'daily' | 'weekly' | 'monthly';

export interface ReportSchedule {
  id: string;
  name: string;
  metric: ReportMetric;
  dimension: ReportDimension;
  shape: ReportShape;
  recipient: string;
  cadence: ReportCadence;
  createdAt: string;
  lastSentAt?: string;
}

interface ReportsState {
  items: ReportSchedule[];
  schedule: (input: Omit<ReportSchedule, 'id' | 'createdAt'>) => ReportSchedule;
  markSent: (id: string) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      items: [],

      schedule: (input) => {
        const r: ReportSchedule = {
          ...input,
          id: `rs_${Math.random().toString(36).slice(2, 10)}`,
          createdAt: new Date().toISOString(),
        };
        set({ items: [r, ...get().items] });
        return r;
      },

      markSent: (id) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, lastSentAt: new Date().toISOString() } : i,
          ),
        }),

      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      reset: () => set({ items: [] }),
    }),
    { name: 'bikita-reports' },
  ),
);
