'use client';

// ─────────────────────────────────────────────
// Bulk outbound messaging (spec §3.2).
// Segments are derived client-side from the
// existing fixtures so previewing size is accurate.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CampaignChannel = 'sms' | 'whatsapp' | 'email';
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';
export type SegmentId =
  | 'all-residents'
  | 'overdue'
  | 'paid-up'
  | 'ward-nyika'
  | 'ward-mupani'
  | 'commercial'
  | 'residential';

export interface Campaign {
  id: string;
  name: string;
  channels: CampaignChannel[];
  segment: SegmentId;
  subject?: string;
  body: string;
  status: CampaignStatus;
  createdAt: string;
  createdBy: string;
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  /** Delivery breakdown once sent. */
  delivered?: number;
  failed?: number;
}

interface CampaignsState {
  items: Campaign[];
  create: (input: Omit<Campaign, 'id' | 'createdAt' | 'status'>) => Campaign;
  schedule: (id: string, at: string) => void;
  send: (id: string) => void;
  cancel: (id: string) => void;
  remove: (id: string) => void;
  reset: () => void;
}

function uid() {
  return `cmp_${Math.random().toString(36).slice(2, 10)}`;
}

const SEED: Campaign[] = [
  {
    id: 'cmp_apr_bill',
    name: 'April billing reminder',
    channels: ['sms', 'whatsapp'],
    segment: 'overdue',
    body: 'Your April rates are due by 30 April. Log in at bikita.demo to pay in under 2 minutes.',
    status: 'sent',
    createdAt: '2026-04-10T08:00:00Z',
    createdBy: 'Chipo Ndlovu',
    sentAt: '2026-04-10T09:15:00Z',
    recipients: 194,
    delivered: 186,
    failed: 8,
  },
];

export const useCampaignsStore = create<CampaignsState>()(
  persist(
    (set, get) => ({
      items: SEED,

      create: (input) => {
        const c: Campaign = {
          ...input,
          id: uid(),
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
        set({ items: [c, ...get().items] });
        return c;
      },

      schedule: (id, at) =>
        set({
          items: get().items.map((c) =>
            c.id === id ? { ...c, status: 'scheduled', scheduledAt: at } : c,
          ),
        }),

      send: (id) => {
        const now = new Date().toISOString();
        set({
          items: get().items.map((c) => {
            if (c.id !== id) return c;
            const delivered = Math.round(c.recipients * 0.96);
            return {
              ...c,
              status: 'sent',
              sentAt: now,
              delivered,
              failed: c.recipients - delivered,
            };
          }),
        });
      },

      cancel: (id) =>
        set({ items: get().items.map((c) => (c.id === id ? { ...c, status: 'cancelled' } : c)) }),

      remove: (id) => set({ items: get().items.filter((c) => c.id !== id) }),

      reset: () => set({ items: SEED }),
    }),
    { name: 'bikita-campaigns' },
  ),
);

// ─── Segment helpers ──────────────────────────

import { PROPERTIES } from '@/mocks/fixtures/properties';

export const SEGMENT_LABEL: Record<SegmentId, string> = {
  'all-residents': 'All residents',
  overdue:         'Overdue balances',
  'paid-up':       'Paid up',
  'ward-nyika':    'Nyika ward',
  'ward-mupani':   'Mupani ward',
  commercial:      'Commercial properties',
  residential:     'Residential properties',
};

export function estimateSegmentSize(id: SegmentId): number {
  if (id === 'all-residents') return new Set(PROPERTIES.map((p) => p.ownerId)).size;
  if (id === 'overdue') return new Set(PROPERTIES.filter((p) => p.balanceUsd > 0).map((p) => p.ownerId)).size;
  if (id === 'paid-up') return new Set(PROPERTIES.filter((p) => p.balanceUsd === 0).map((p) => p.ownerId)).size;
  if (id === 'ward-nyika') return new Set(PROPERTIES.filter((p) => p.ward === 'Nyika').map((p) => p.ownerId)).size;
  if (id === 'ward-mupani') return new Set(PROPERTIES.filter((p) => p.ward === 'Mupani').map((p) => p.ownerId)).size;
  if (id === 'commercial') return new Set(PROPERTIES.filter((p) => p.classKind === 'commercial').map((p) => p.ownerId)).size;
  if (id === 'residential') return new Set(PROPERTIES.filter((p) => p.classKind === 'residential').map((p) => p.ownerId)).size;
  return 0;
}
