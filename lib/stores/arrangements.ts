'use client';

// ─────────────────────────────────────────────
// Payment arrangement store (spec §3.1).
// Citizens propose an installment plan for arrears;
// staff approve or reject. Runtime only — seeded
// empty. Persisted so a reviewer can submit one,
// switch roles and process it.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotificationsStore } from './notifications';

export type ArrangementStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ArrangementInstallment {
  dueDate: string; // ISO
  amountUsd: number;
}

export interface PaymentArrangement {
  id: string;
  reference: string;
  propertyId: string;
  propertyLabel: string;
  ownerId: string;
  ownerName: string;
  totalUsd: number;
  installments: ArrangementInstallment[];
  reason: string;
  status: ArrangementStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  staffNote?: string;
}

interface ArrangementsState {
  items: PaymentArrangement[];
  propose: (input: Omit<PaymentArrangement, 'id' | 'reference' | 'status' | 'requestedAt'>) => PaymentArrangement;
  approve: (id: string, actor: string, note?: string) => void;
  reject: (id: string, actor: string, note?: string) => void;
  reset: () => void;
}

function uid() {
  return `arr_${Math.random().toString(36).slice(2, 10)}`;
}

function ref() {
  const d = new Date();
  const pad = (n: number, l = 2) => n.toString().padStart(l, '0');
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `PA-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`;
}

export const useArrangementsStore = create<ArrangementsState>()(
  persist(
    (set, get) => ({
      items: [],

      propose: (input) => {
        const arr: PaymentArrangement = {
          ...input,
          id: uid(),
          reference: ref(),
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };
        set({ items: [arr, ...get().items] });
        return arr;
      },

      approve: (id, actor, note) => {
        const target = get().items.find((a) => a.id === id);
        if (!target) return;
        set({
          items: get().items.map((a) =>
            a.id === id
              ? { ...a, status: 'approved', decidedAt: new Date().toISOString(), decidedBy: actor, staffNote: note }
              : a,
          ),
        });
        useNotificationsStore.getState().push({
          ownerId: target.ownerId,
          event: 'application-stage',
          tone: 'success',
          title: `Payment plan ${target.reference} approved`,
          body: `${target.installments.length} installments scheduled for ${target.propertyLabel}.`,
          href: `/portal/property/${target.propertyId}`,
          channels: ['app', 'sms', 'whatsapp'],
        });
      },

      reject: (id, actor, note) => {
        const target = get().items.find((a) => a.id === id);
        if (!target) return;
        set({
          items: get().items.map((a) =>
            a.id === id
              ? { ...a, status: 'rejected', decidedAt: new Date().toISOString(), decidedBy: actor, staffNote: note }
              : a,
          ),
        });
        useNotificationsStore.getState().push({
          ownerId: target.ownerId,
          event: 'application-stage',
          tone: 'danger',
          title: `Payment plan ${target.reference} not approved`,
          body: note ?? 'Please contact the council to discuss alternatives.',
          href: `/portal/property/${target.propertyId}`,
          channels: ['app', 'sms'],
        });
      },

      reset: () => set({ items: [] }),
    }),
    { name: 'bikita-arrangements' },
  ),
);

// NOTE: filter/map/sort are done OUTSIDE the Zustand selector because a
// selector that returns a freshly-constructed array on every render defeats
// the default Object.is comparison and causes an infinite re-render loop.

export function useArrangementsForOwner(ownerId: string | null): PaymentArrangement[] {
  const items = useArrangementsStore((s) => s.items);
  if (!ownerId) return [];
  return items.filter((i) => i.ownerId === ownerId);
}

export function usePendingArrangements(): PaymentArrangement[] {
  const items = useArrangementsStore((s) => s.items);
  return items.filter((i) => i.status === 'pending');
}

export function useArrangementForProperty(propertyId: string | null): PaymentArrangement | undefined {
  const items = useArrangementsStore((s) => s.items);
  if (!propertyId) return undefined;
  return items
    .filter((i) => i.propertyId === propertyId)
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1))[0];
}
