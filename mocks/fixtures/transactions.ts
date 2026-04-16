// ─────────────────────────────────────────────
// Payment transactions fixture
//
// Mirrors spec §9.1: 40+ transactions across
// channels (EcoCash, OneMoney, InnBucks, Paynow,
// bank, cash). Used by:
//   • Recent activity widget on dashboard
//   • Transactions tab on property detail
//   • ERP reconciliation queue (later milestone)
// ─────────────────────────────────────────────

export type PaymentChannel =
  | 'ecocash'
  | 'onemoney'
  | 'innbucks'
  | 'paynow'
  | 'zimswitch'
  | 'bank'
  | 'cash'
  | 'mastercard'
  | 'mukuru'
  | 'telecash'
  | 'visa';

export type PaymentStatus = 'succeeded' | 'failed' | 'pending';

export interface Transaction {
  id: string;
  reference: string;
  propertyId: string;
  ownerId: string;
  amount: number;
  currency: 'USD' | 'ZWG';
  channel: PaymentChannel;
  status: PaymentStatus;
  createdAt: string; // ISO
  note?: string;
}

export const CHANNEL_LABEL: Record<PaymentChannel, string> = {
  ecocash: 'EcoCash',
  onemoney: 'OneMoney',
  innbucks: 'InnBucks',
  paynow: 'Paynow',
  zimswitch: 'ZimSwitch',
  bank: 'Bank transfer',
  cash: 'Cash receipt',
  mastercard: 'Visa / Mastercard (Diaspora)',
  mukuru: 'Mukuru',
  telecash: 'Telecash',
  visa: 'Visa',
};

export const TRANSACTIONS: Transaction[] = [
  // ── Tendai / 4521 — Nyika ──
  { id: 'tx_000001', reference: 'BRDC-20260114-003412', propertyId: 'p_4521', ownerId: 'u_tendai', amount:  87.50, currency: 'USD', channel: 'ecocash',  status: 'succeeded', createdAt: '2026-01-14T10:22:00Z' },
  { id: 'tx_000002', reference: 'BRDC-20251218-001184', propertyId: 'p_4521', ownerId: 'u_tendai', amount:  87.50, currency: 'USD', channel: 'ecocash',  status: 'succeeded', createdAt: '2025-12-18T09:05:00Z' },
  { id: 'tx_000003', reference: 'BRDC-20251114-000872', propertyId: 'p_4521', ownerId: 'u_tendai', amount:  87.50, currency: 'USD', channel: 'onemoney', status: 'succeeded', createdAt: '2025-11-14T13:40:00Z' },
  { id: 'tx_000004', reference: 'BRDC-20251013-000544', propertyId: 'p_4521', ownerId: 'u_tendai', amount:  87.50, currency: 'USD', channel: 'paynow',   status: 'succeeded', createdAt: '2025-10-13T17:12:00Z' },

  // ── Tendai / 2210 — Mupani commercial ──
  { id: 'tx_000010', reference: 'BRDC-20260328-004819', propertyId: 'p_2210', ownerId: 'u_tendai', amount: 108.00, currency: 'USD', channel: 'paynow',   status: 'succeeded', createdAt: '2026-03-28T14:05:00Z' },
  { id: 'tx_000011', reference: 'BRDC-20260225-004132', propertyId: 'p_2210', ownerId: 'u_tendai', amount: 108.00, currency: 'USD', channel: 'ecocash',  status: 'succeeded', createdAt: '2026-02-25T12:30:00Z' },
  { id: 'tx_000012', reference: 'BRDC-20260130-003902', propertyId: 'p_2210', ownerId: 'u_tendai', amount: 108.00, currency: 'USD', channel: 'ecocash',  status: 'succeeded', createdAt: '2026-01-30T08:50:00Z' },
  { id: 'tx_000013', reference: 'BRDC-20260108-003617', propertyId: 'p_2210', ownerId: 'u_tendai', amount: 108.00, currency: 'USD', channel: 'bank',     status: 'succeeded', createdAt: '2026-01-08T10:15:00Z' },
  { id: 'tx_000014', reference: 'BRDC-20260112-003704', propertyId: 'p_2210', ownerId: 'u_tendai', amount:  45.00, currency: 'USD', channel: 'ecocash',  status: 'failed',    createdAt: '2026-01-12T20:04:00Z', note: 'Gateway timeout — retried successfully below.' },
  { id: 'tx_000015', reference: 'BRDC-20260112-003709', propertyId: 'p_2210', ownerId: 'u_tendai', amount:  45.00, currency: 'USD', channel: 'ecocash',  status: 'succeeded', createdAt: '2026-01-12T20:08:00Z' },

  // ── Other residents (seed volume for ERP views) ──
  { id: 'tx_000100', reference: 'BRDC-20260405-005211', propertyId: 'p_1177', ownerId: 'u_other_3', amount: 55,    currency: 'USD', channel: 'ecocash',  status: 'succeeded', createdAt: '2026-04-05T08:47:00Z' },
  { id: 'tx_000101', reference: 'BRDC-20260220-004502', propertyId: 'p_3050', ownerId: 'u_other_4', amount: 110,   currency: 'USD', channel: 'paynow',   status: 'succeeded', createdAt: '2026-02-20T16:10:00Z' },
  { id: 'tx_000102', reference: 'BRDC-20251202-002188', propertyId: 'p_6802', ownerId: 'u_other_1', amount: 48,    currency: 'USD', channel: 'cash',     status: 'succeeded', createdAt: '2025-12-02T09:30:00Z' },
  { id: 'tx_000103', reference: 'BRDC-20250911-001506', propertyId: 'p_9044', ownerId: 'u_other_2', amount: 180,   currency: 'USD', channel: 'onemoney', status: 'succeeded', createdAt: '2025-09-11T11:15:00Z' },
];

export function transactionsForProperty(propertyId: string): Transaction[] {
  return TRANSACTIONS.filter((t) => t.propertyId === propertyId).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function transactionsForOwner(ownerId: string): Transaction[] {
  return TRANSACTIONS.filter((t) => t.ownerId === ownerId).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}
