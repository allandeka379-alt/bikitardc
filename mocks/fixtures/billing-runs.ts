// ─────────────────────────────────────────────
// Billing runs — a single cycle of automated
// statement generation for one revenue source and
// one period (usually a month or a quarter).
//
// Lifecycle:   draft → approved → posted → notified
//
//  draft     A clerk/supervisor has generated the
//            billing run. Lines are computed but no
//            invoices exist yet.
//  approved  Supervisor signs off. Figures are
//            locked. Notifications queued.
//  posted    Invoices and ledger entries are
//            created. Arrears start accruing on the
//            due date.
//  notified  SMS + WhatsApp + email dispatched to
//            affected accounts.
//
// A failed run sits in `draft` with `errorCount` >
// 0 and can be retried from the UI.
// ─────────────────────────────────────────────

import type { RevenueSourceId } from './revenue-sources';

export type BillingRunStatus = 'draft' | 'approved' | 'posted' | 'notified' | 'failed';

export interface BillingRun {
  id: string;
  source: RevenueSourceId;
  /** ISO period key — "2026-04" for a month, "2026-Q2" for a quarter. */
  period: string;
  /** How many accounts were billed. */
  accountCount: number;
  /** Total amount billed in USD. */
  totalUsd: number;
  status: BillingRunStatus;
  createdAt: string;      // ISO
  generatedBy: string;    // staff name
  approvedAt: string | null;
  approvedBy: string | null;
  postedAt: string | null;
  notifiedAt: string | null;
  errorCount: number;
  /** Short free-text notes from the supervisor. */
  notes?: string;
}

export const BILLING_RUNS: BillingRun[] = [
  // ── APRIL 2026 (current cycle) ──
  {
    id: 'br_2026_04_rates',
    source: 'property-rates',
    period: '2026-04',
    accountCount: 4_128,
    totalUsd: 184_220,
    status: 'notified',
    createdAt: '2026-04-01T07:02:00Z',
    generatedBy: 'Mai Moyo',
    approvedAt: '2026-04-01T09:14:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: '2026-04-01T09:40:00Z',
    notifiedAt: '2026-04-01T09:55:00Z',
    errorCount: 0,
  },
  {
    id: 'br_2026_04_utax',
    source: 'unit-tax',
    period: '2026-04',
    accountCount: 2_750,
    totalUsd: 41_250,
    status: 'posted',
    createdAt: '2026-04-02T08:10:00Z',
    generatedBy: 'Mai Moyo',
    approvedAt: '2026-04-02T10:00:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: '2026-04-02T10:30:00Z',
    notifiedAt: null,
    errorCount: 0,
    notes: 'Notifications held pending confirmation of SMS gateway budget.',
  },
  {
    id: 'br_2026_04_market',
    source: 'market-fees',
    period: '2026-04',
    accountCount: 186,
    totalUsd: 3_120,
    status: 'approved',
    createdAt: '2026-04-01T06:45:00Z',
    generatedBy: 'Runako Zengeya',
    approvedAt: '2026-04-03T14:20:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: null,
    notifiedAt: null,
    errorCount: 0,
  },
  {
    id: 'br_2026_04_refuse',
    source: 'refuse-sanitation',
    period: '2026-04',
    accountCount: 1_942,
    totalUsd: 22_180,
    status: 'draft',
    createdAt: '2026-04-15T11:22:00Z',
    generatedBy: 'Mai Moyo',
    approvedAt: null,
    approvedBy: null,
    postedAt: null,
    notifiedAt: null,
    errorCount: 12,
    notes: '12 accounts failed the meter-read validation. Requires manual review.',
  },

  // ── MARCH 2026 (fully closed) ──
  {
    id: 'br_2026_03_rates',
    source: 'property-rates',
    period: '2026-03',
    accountCount: 4_118,
    totalUsd: 182_960,
    status: 'notified',
    createdAt: '2026-03-01T07:00:00Z',
    generatedBy: 'Mai Moyo',
    approvedAt: '2026-03-01T09:18:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: '2026-03-01T09:40:00Z',
    notifiedAt: '2026-03-01T09:55:00Z',
    errorCount: 0,
  },
  {
    id: 'br_2026_03_utax',
    source: 'unit-tax',
    period: '2026-03',
    accountCount: 2_746,
    totalUsd: 41_190,
    status: 'notified',
    createdAt: '2026-03-02T08:10:00Z',
    generatedBy: 'Mai Moyo',
    approvedAt: '2026-03-02T10:00:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: '2026-03-02T10:30:00Z',
    notifiedAt: '2026-03-02T10:40:00Z',
    errorCount: 0,
  },
  {
    id: 'br_2026_03_devl',
    source: 'development-levy',
    period: '2026-Q1',
    accountCount: 4_118,
    totalUsd: 28_950,
    status: 'notified',
    createdAt: '2026-03-05T09:00:00Z',
    generatedBy: 'Runako Zengeya',
    approvedAt: '2026-03-06T09:00:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: '2026-03-06T09:25:00Z',
    notifiedAt: '2026-03-06T09:40:00Z',
    errorCount: 0,
  },
  {
    id: 'br_2026_03_water',
    source: 'water-sewer',
    period: '2026-03',
    accountCount: 810,
    totalUsd: 16_430,
    status: 'notified',
    createdAt: '2026-03-04T08:00:00Z',
    generatedBy: 'Runako Zengeya',
    approvedAt: '2026-03-04T10:20:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: '2026-03-04T10:40:00Z',
    notifiedAt: '2026-03-04T10:50:00Z',
    errorCount: 0,
  },
  {
    id: 'br_2026_03_campfire',
    source: 'campfire',
    period: '2026-Q1',
    accountCount: 4,
    totalUsd: 4_250,
    status: 'notified',
    createdAt: '2026-03-28T13:00:00Z',
    generatedBy: 'Mai Moyo',
    approvedAt: '2026-03-28T14:00:00Z',
    approvedBy: 'N. Chigariro (CFO)',
    postedAt: '2026-03-28T14:10:00Z',
    notifiedAt: '2026-03-28T14:15:00Z',
    errorCount: 0,
    notes: 'Levies for elephant & buffalo off-takes, Nyika + Nhema wards.',
  },
];

export function billingRunsByPeriod(): Record<string, BillingRun[]> {
  const out: Record<string, BillingRun[]> = {};
  for (const r of BILLING_RUNS) {
    (out[r.period] ||= []).push(r);
  }
  return out;
}

export function findBillingRun(id: string): BillingRun | undefined {
  return BILLING_RUNS.find((r) => r.id === id);
}

export const STATUS_LABEL: Record<BillingRunStatus, string> = {
  draft:    'Draft',
  approved: 'Approved',
  posted:   'Posted',
  notified: 'Notified',
  failed:   'Failed',
};

export const STATUS_TONE: Record<BillingRunStatus, 'info' | 'warning' | 'success' | 'brand' | 'danger'> = {
  draft:    'warning',
  approved: 'info',
  posted:   'brand',
  notified: 'success',
  failed:   'danger',
};
