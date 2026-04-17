// ─────────────────────────────────────────────
// Penalty fixture — surcharges, late fees, bylaw
// fines and dishonoured-payment charges raised
// against residents / properties.
//
// The CRM surfaces these in the Customer 360 view
// so a clerk can see, raise, waive and allocate
// payments against them from the counter.
// ─────────────────────────────────────────────

export type PenaltyReason =
  | 'late-payment-interest'
  | 'dishonoured-cheque'
  | 'bylaw-contravention'
  | 'unauthorised-building'
  | 'refuse-non-compliance'
  | 'stall-arrears-surcharge'
  | 'licence-late-renewal';

export type PenaltyStatus = 'active' | 'paid' | 'waived' | 'disputed';

export interface Penalty {
  id: string;
  reference: string;
  ownerId: string;
  propertyId?: string;
  reason: PenaltyReason;
  note?: string;
  amountUsd: number;
  appliedAt: string; // ISO
  appliedBy: string; // clerk name
  status: PenaltyStatus;
  waivedBy?: string;
  waivedAt?: string;
  waiverReason?: string;
}

export const PENALTY_REASON_LABEL: Record<PenaltyReason, string> = {
  'late-payment-interest':   'Late-payment interest',
  'dishonoured-cheque':      'Dishonoured cheque charge',
  'bylaw-contravention':     'Bylaw contravention',
  'unauthorised-building':   'Unauthorised building works',
  'refuse-non-compliance':   'Refuse non-compliance',
  'stall-arrears-surcharge': 'Market stall arrears surcharge',
  'licence-late-renewal':    'Licence late-renewal fee',
};

export const PENALTY_STATUS_LABEL: Record<PenaltyStatus, string> = {
  active:   'Outstanding',
  paid:     'Paid',
  waived:   'Waived',
  disputed: 'Disputed',
};

export const PENALTIES: Penalty[] = [
  {
    id:         'pen_001',
    reference:  'PEN-2026-0018',
    ownerId:    'u_tendai',
    propertyId: 'p_4521',
    reason:     'late-payment-interest',
    note:       'March rates not cleared within 14-day grace window.',
    amountUsd:  8.40,
    appliedAt:  '2026-03-25T09:15:00Z',
    appliedBy:  'Mai Moyo',
    status:     'active',
  },
  {
    id:         'pen_002',
    reference:  'PEN-2026-0019',
    ownerId:    'o_chari',
    propertyId: 'p_2210',
    reason:     'bylaw-contravention',
    note:       'Tuck-shop operating outside market hours — §12(3) of General Bylaws 2015.',
    amountUsd:  25,
    appliedAt:  '2026-03-28T14:00:00Z',
    appliedBy:  'T. Chidziva',
    status:     'active',
  },
  {
    id:         'pen_003',
    reference:  'PEN-2026-0020',
    ownerId:    'o_makore',
    propertyId: 'p_3102',
    reason:     'dishonoured-cheque',
    note:       'Cheque no. 00214 returned by bank — "refer to drawer".',
    amountUsd:  15,
    appliedAt:  '2026-02-17T11:05:00Z',
    appliedBy:  'Mai Moyo',
    status:     'paid',
  },
  {
    id:         'pen_004',
    reference:  'PEN-2026-0021',
    ownerId:    'o_mushore',
    propertyId: 'p_5108',
    reason:     'refuse-non-compliance',
    note:       'Refuse left uncovered on collection day — third warning.',
    amountUsd:  12,
    appliedAt:  '2026-04-03T08:30:00Z',
    appliedBy:  'N. Chigariro',
    status:     'active',
  },
  {
    id:         'pen_005',
    reference:  'PEN-2026-0022',
    ownerId:    'o_zinyama',
    reason:     'licence-late-renewal',
    note:       'Business licence renewed 21 days after expiry.',
    amountUsd:  5,
    appliedAt:  '2026-04-01T10:20:00Z',
    appliedBy:  'T. Chidziva',
    status:     'active',
  },
  {
    id:         'pen_006',
    reference:  'PEN-2026-0023',
    ownerId:    'o_sibanda',
    propertyId: 'p_7401',
    reason:     'unauthorised-building',
    note:       'Perimeter wall erected without approved plan — §8 Building Bylaws.',
    amountUsd:  120,
    appliedAt:  '2026-03-09T15:40:00Z',
    appliedBy:  'P. Dube',
    status:     'disputed',
  },
  {
    id:         'pen_007',
    reference:  'PEN-2026-0024',
    ownerId:    'o_chari',
    reason:     'stall-arrears-surcharge',
    note:       'Stall 14A — two months rental in arrears.',
    amountUsd:  6,
    appliedAt:  '2026-03-30T07:55:00Z',
    appliedBy:  'Mai Moyo',
    status:     'waived',
    waivedBy:   'Eng. Tafadzwa Makoni',
    waivedAt:   '2026-04-02T13:10:00Z',
    waiverReason: 'First-time trader — warning issued instead.',
  },
  {
    id:         'pen_008',
    reference:  'PEN-2026-0025',
    ownerId:    'o_marongwe',
    propertyId: 'p_8834',
    reason:     'late-payment-interest',
    note:       'Feb + Mar rates unpaid; interest accrued at 1.5%/month on arrears.',
    amountUsd:  14.65,
    appliedAt:  '2026-04-04T09:00:00Z',
    appliedBy:  'Mai Moyo',
    status:     'active',
  },
];

// ─── Helpers ────────────────────────────────────

export function penaltiesForOwner(ownerId: string, all: Penalty[] = PENALTIES): Penalty[] {
  return all
    .filter((p) => p.ownerId === ownerId)
    .sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));
}

export function penaltiesForProperty(propertyId: string, all: Penalty[] = PENALTIES): Penalty[] {
  return all
    .filter((p) => p.propertyId === propertyId)
    .sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));
}

export function outstandingPenaltyTotal(ownerId: string, all: Penalty[] = PENALTIES): number {
  return penaltiesForOwner(ownerId, all)
    .filter((p) => p.status === 'active')
    .reduce((s, p) => s + p.amountUsd, 0);
}
