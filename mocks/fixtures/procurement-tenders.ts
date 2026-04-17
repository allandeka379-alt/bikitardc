// ─────────────────────────────────────────────
// Internal tender / bidding workflow — different
// from the public-facing tenders fixture which is
// just the advert.
//
// Lifecycle (PRAZ-compliant RFQ / RDC tender):
//   advertised → closed → evaluation → award → contract-signed
// ─────────────────────────────────────────────

export type TenderStage =
  | 'draft'
  | 'advertised'
  | 'closed'
  | 'evaluation'
  | 'award-recommended'
  | 'award'
  | 'contract-signed'
  | 'cancelled';

export type TenderMethod = 'rfq' | 'open-tender' | 'restricted' | 'direct';

export interface TenderBid {
  id: string;
  tenderId: string;
  bidderName: string;
  bidderPraz: string;
  quotedUsd: number;
  technicalScore: number;  // 0..100
  financialScore: number;  // 0..100
  combinedScore: number;   // 0..100
  disqualified?: boolean;
  notes?: string;
}

export interface Tender {
  id: string;
  reference: string;      // BRDC-TND-2026-001
  title: string;
  method: TenderMethod;
  scope: string;
  budgetEnvelopeUsd: number;
  advertisedAt: string;
  closesAt: string;
  department: string;
  owner: string;          // council procurement lead
  stage: TenderStage;
  awardedTo?: string;     // bidderName
  awardUsd?: number;
  /** Whether the Procurement Committee has signed off. */
  committeeApproved: boolean;
}

export const STAGE_LABEL: Record<TenderStage, string> = {
  draft:              'Draft',
  advertised:         'Advertised',
  closed:             'Closed',
  evaluation:         'Under evaluation',
  'award-recommended':'Award recommended',
  award:              'Awarded',
  'contract-signed':  'Contract signed',
  cancelled:          'Cancelled',
};

export const STAGE_TONE: Record<TenderStage, 'neutral' | 'info' | 'warning' | 'brand' | 'success' | 'danger'> = {
  draft:              'neutral',
  advertised:         'info',
  closed:             'warning',
  evaluation:         'brand',
  'award-recommended':'warning',
  award:              'success',
  'contract-signed':  'success',
  cancelled:          'danger',
};

export const METHOD_LABEL: Record<TenderMethod, string> = {
  rfq:          'Request for quotation',
  'open-tender':'Open tender',
  restricted:   'Restricted',
  direct:       'Direct appointment',
};

export const TENDERS: Tender[] = [
  {
    id: 'tn_001', reference: 'BRDC-TND-2026-001',
    title: 'Kamungoma dual carriageway — phase 2',
    method: 'open-tender',
    scope: 'Dual-lane upgrade of the Kamungoma–Junction corridor including shoulders and drainage.',
    budgetEnvelopeUsd: 220_000,
    advertisedAt: '2026-01-15',
    closesAt: '2026-02-26',
    department: 'Engineering',
    owner: 'Eng. Grace Mutema',
    stage: 'contract-signed',
    awardedTo: 'Masvingo Civil Works',
    awardUsd: 196_400,
    committeeApproved: true,
  },
  {
    id: 'tn_002', reference: 'BRDC-TND-2026-002',
    title: 'Solar streetlight rollout — batch 2',
    method: 'open-tender',
    scope: 'Supply and install 24 solar LED streetlights in Nyika and Mupani market centres.',
    budgetEnvelopeUsd: 48_000,
    advertisedAt: '2026-03-10',
    closesAt: '2026-04-14',
    department: 'Engineering',
    owner: 'Eng. Grace Mutema',
    stage: 'evaluation',
    committeeApproved: false,
  },
  {
    id: 'tn_003', reference: 'BRDC-TND-2026-003',
    title: 'Bulk diesel supply — 12 months',
    method: 'rfq',
    scope: 'Bulk diesel supply with delivery to Chikwanda works yard and Mupani.',
    budgetEnvelopeUsd: 48_000,
    advertisedAt: '2026-02-20',
    closesAt: '2026-03-07',
    department: 'Finance',
    owner: 'Nobert Chigariro',
    stage: 'contract-signed',
    awardedTo: 'Zuva Total Services',
    awardUsd: 46_080,
    committeeApproved: true,
  },
  {
    id: 'tn_004', reference: 'BRDC-TND-2026-004',
    title: 'Dam rehabilitation — Siya spillway',
    method: 'open-tender',
    scope: 'Engineering assessment and spillway repair works on Siya Dam.',
    budgetEnvelopeUsd: 72_000,
    advertisedAt: '2026-04-01',
    closesAt: '2026-05-06',
    department: 'Engineering',
    owner: 'Eng. Grace Mutema',
    stage: 'advertised',
    committeeApproved: false,
  },
  {
    id: 'tn_005', reference: 'BRDC-TND-2026-005',
    title: 'ICT refresh — workstations + network',
    method: 'rfq',
    scope: 'Replacement desktops (20) and upgrade of council switching / access points.',
    budgetEnvelopeUsd: 22_000,
    advertisedAt: '2026-04-03',
    closesAt: '2026-04-18',
    department: 'ICT',
    owner: 'Kudakwashe Njanji',
    stage: 'closed',
    committeeApproved: false,
  },
];

export const TENDER_BIDS: TenderBid[] = [
  // tn_002 bids
  { id: 'bid_002_a', tenderId: 'tn_002', bidderName: 'Solarez Zimbabwe',     bidderPraz: 'PRAZ-1218-22', quotedUsd: 46_500, technicalScore: 88, financialScore: 92, combinedScore: 90 },
  { id: 'bid_002_b', tenderId: 'tn_002', bidderName: 'Sunpower Africa',       bidderPraz: 'PRAZ-1402-08', quotedUsd: 44_200, technicalScore: 74, financialScore: 96, combinedScore: 82 },
  { id: 'bid_002_c', tenderId: 'tn_002', bidderName: 'Masvingo Electrical',   bidderPraz: 'PRAZ-0611-14', quotedUsd: 52_800, technicalScore: 80, financialScore: 82, combinedScore: 81 },
  { id: 'bid_002_d', tenderId: 'tn_002', bidderName: 'GreenVolt Ltd',         bidderPraz: 'PRAZ-0917-02', quotedUsd: 49_980, technicalScore: 62, financialScore: 86, combinedScore: 72, disqualified: true, notes: 'Missing tax clearance.' },

  // tn_005 bids
  { id: 'bid_005_a', tenderId: 'tn_005', bidderName: 'DataNet Solutions',     bidderPraz: 'PRAZ-0812-17', quotedUsd: 19_800, technicalScore: 82, financialScore: 90, combinedScore: 85 },
  { id: 'bid_005_b', tenderId: 'tn_005', bidderName: 'ZOL Business',          bidderPraz: 'PRAZ-0105-04', quotedUsd: 22_400, technicalScore: 86, financialScore: 78, combinedScore: 83 },
  { id: 'bid_005_c', tenderId: 'tn_005', bidderName: 'Willowvale IT',         bidderPraz: 'PRAZ-0611-12', quotedUsd: 20_900, technicalScore: 72, financialScore: 86, combinedScore: 78 },
];

export function findTender(id: string): Tender | undefined {
  return TENDERS.find((t) => t.id === id);
}

export function bidsForTender(tenderId: string): TenderBid[] {
  return TENDER_BIDS
    .filter((b) => b.tenderId === tenderId)
    .sort((a, b) => (b.combinedScore - a.combinedScore));
}

export function countByStage(): Record<TenderStage, number> {
  const out = { draft: 0, advertised: 0, closed: 0, evaluation: 0, 'award-recommended': 0, award: 0, 'contract-signed': 0, cancelled: 0 } as Record<TenderStage, number>;
  for (const t of TENDERS) out[t.stage]++;
  return out;
}
