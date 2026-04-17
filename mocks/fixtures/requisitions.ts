// ─────────────────────────────────────────────
// Internal purchase requisitions — PRAZ-compliant
// workflow that precedes any procurement.
//
// Lifecycle:
//   draft → submitted → approved → po-raised → grv-received → invoiced
//
// Each requisition threads through to a purchase
// order, a goods-received voucher, and finally a
// supplier invoice in fixtures/creditors.ts.
// ─────────────────────────────────────────────

export type RequisitionStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'po-raised'
  | 'grv-received'
  | 'invoiced'
  | 'cancelled';

export type RequisitionCategory =
  | 'fuel'
  | 'maintenance'
  | 'utilities'
  | 'stationery'
  | 'it'
  | 'legal'
  | 'engineering'
  | 'construction'
  | 'other';

export interface RequisitionLine {
  description: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface Requisition {
  id: string;
  reference: string;             // BRDC-REQ-2026-0001
  title: string;
  requestedBy: string;           // employee full name
  department: string;
  category: RequisitionCategory;
  raisedAt: string;              // ISO
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedReason?: string;
  status: RequisitionStatus;
  lines: RequisitionLine[];
  /** Generated PO once approved. */
  poNumber?: string;
  /** GRV date once goods received. */
  grvDate?: string;
  /** Selected supplier (creditor id) after the quote round. */
  supplierId?: string;
  /** Linked creditor invoice id once the invoice arrives. */
  invoiceId?: string;
  /** Short justification used in the budget-check step. */
  justification: string;
  /** Budget line it draws against. */
  budgetLineId: string;
}

export const STATUS_LABEL: Record<RequisitionStatus, string> = {
  draft:         'Draft',
  submitted:     'Submitted',
  approved:      'Approved',
  rejected:      'Rejected',
  'po-raised':   'PO raised',
  'grv-received':'GRV received',
  invoiced:      'Invoiced',
  cancelled:     'Cancelled',
};

export const STATUS_TONE: Record<RequisitionStatus, 'neutral' | 'warning' | 'info' | 'success' | 'danger' | 'brand'> = {
  draft:         'neutral',
  submitted:     'warning',
  approved:      'info',
  rejected:      'danger',
  'po-raised':   'brand',
  'grv-received':'brand',
  invoiced:      'success',
  cancelled:     'neutral',
};

export const CATEGORY_LABEL: Record<RequisitionCategory, string> = {
  fuel:         'Fuel & lubricants',
  maintenance:  'Maintenance',
  utilities:    'Utilities',
  stationery:   'Stationery',
  it:           'IT & telecoms',
  legal:        'Legal & professional',
  engineering:  'Engineering',
  construction: 'Construction',
  other:        'Other',
};

export const REQUISITIONS: Requisition[] = [
  {
    id: 'req_001', reference: 'BRDC-REQ-2026-0091', title: 'Bulk diesel — April',
    requestedBy: 'Fortune Marimo', department: 'Works', category: 'fuel',
    raisedAt: '2026-04-05T08:00:00Z', submittedAt: '2026-04-05T08:30:00Z',
    approvedAt: '2026-04-06T10:00:00Z', approvedBy: 'Nobert Chigariro (CFO)',
    rejectedAt: null, status: 'invoiced',
    lines: [{ description: 'Diesel 50ppm (bulk)', quantity: 3200, unitPriceUsd: 1.20 }],
    poNumber: 'PO-BRDC-2026-0091', grvDate: '2026-04-06', supplierId: 'cr_zuva',
    invoiceId: 'inv_zuva_01', budgetLineId: 'bl_gs_fuel',
    justification: 'Covers April fleet + grader operations at Nhema feeder road.',
  },
  {
    id: 'req_002', reference: 'BRDC-REQ-2026-0087', title: 'Roadworks tools & spares',
    requestedBy: 'Eng. Munashe Gwatidzo', department: 'Engineering', category: 'maintenance',
    raisedAt: '2026-04-02T09:00:00Z', submittedAt: '2026-04-02T10:15:00Z',
    approvedAt: '2026-04-03T13:40:00Z', approvedBy: 'Nobert Chigariro (CFO)',
    rejectedAt: null, status: 'invoiced',
    lines: [
      { description: 'Compactor plate rental (2 weeks)', quantity: 1, unitPriceUsd: 640 },
      { description: 'Assorted hand tools',               quantity: 1, unitPriceUsd: 280 },
      { description: 'Safety PPE kits',                   quantity: 12, unitPriceUsd:  60 },
      { description: 'Traffic cones & signage',           quantity: 1, unitPriceUsd: 680 },
    ],
    poNumber: 'PO-BRDC-2026-0087', grvDate: '2026-04-08', supplierId: 'cr_masvhard',
    invoiceId: 'inv_mh_01', budgetLineId: 'bl_gs_rm',
    justification: 'Equipment for Nhema–Mazungunye feeder road grading and Kamungoma road.',
  },
  {
    id: 'req_003', reference: 'BRDC-REQ-2026-0104', title: 'Solar streetlight poles (batch 2)',
    requestedBy: 'Eng. Grace Mutema', department: 'Engineering', category: 'construction',
    raisedAt: '2026-04-10T07:30:00Z', submittedAt: '2026-04-10T09:00:00Z',
    approvedAt: null, approvedBy: null, rejectedAt: null, status: 'submitted',
    lines: [
      { description: 'Solar LED streetlight (70W)', quantity: 24, unitPriceUsd: 520 },
      { description: 'Galvanised pole 6m',           quantity: 24, unitPriceUsd: 180 },
      { description: 'Concrete foundations',         quantity: 24, unitPriceUsd:  80 },
    ],
    budgetLineId: 'bl_cap_street',
    justification: 'Second tranche of solar street-lighting rollout for Nyika market centre.',
  },
  {
    id: 'req_004', reference: 'BRDC-REQ-2026-0112', title: 'Office stationery — Q2',
    requestedBy: 'Mary Matondo', department: 'HR & admin', category: 'stationery',
    raisedAt: '2026-04-14T08:15:00Z', submittedAt: '2026-04-14T08:20:00Z',
    approvedAt: '2026-04-15T09:10:00Z', approvedBy: 'Rumbidzai Ndou (HR)',
    rejectedAt: null, status: 'grv-received',
    lines: [
      { description: 'A4 paper ream',     quantity: 80, unitPriceUsd:  4.20 },
      { description: 'Printer toner HP',  quantity:  4, unitPriceUsd: 46    },
      { description: 'Office pens (box)', quantity: 10, unitPriceUsd:  3.80 },
    ],
    poNumber: 'PO-BRDC-2026-0112', grvDate: '2026-04-16',
    supplierId: 'cr_willdoc', budgetLineId: 'bl_gs_print',
    justification: 'Quarterly stationery replenishment for all departments.',
  },
  {
    id: 'req_005', reference: 'BRDC-REQ-2026-0118', title: 'Legal opinion — Nyika land dispute',
    requestedBy: 'Eng. Tafadzwa Makoni', department: 'Executive', category: 'legal',
    raisedAt: '2026-04-01T11:00:00Z', submittedAt: '2026-04-01T11:30:00Z',
    approvedAt: '2026-04-02T09:00:00Z', approvedBy: 'Nobert Chigariro (CFO)',
    rejectedAt: null, status: 'po-raised',
    lines: [{ description: 'Legal opinion + drafting of response', quantity: 1, unitPriceUsd: 7_200 }],
    poNumber: 'PO-BRDC-2026-0118', supplierId: 'cr_gutu_law', budgetLineId: 'bl_gs_prof',
    justification: 'Council counter-claim to the Nyika land dispute. External counsel required.',
  },
  {
    id: 'req_006', reference: 'BRDC-REQ-2026-0122', title: 'Iveco refuse truck gearbox',
    requestedBy: 'Blessing Mpofu', department: 'Works', category: 'maintenance',
    raisedAt: '2026-04-03T07:20:00Z', submittedAt: '2026-04-03T08:00:00Z',
    approvedAt: '2026-04-04T11:00:00Z', approvedBy: 'Nobert Chigariro (CFO)',
    rejectedAt: null, status: 'po-raised',
    lines: [{ description: 'Gearbox rebuild + labour', quantity: 1, unitPriceUsd: 1_840 }],
    poNumber: 'PO-BRDC-2026-0122', supplierId: 'cr_masvhard', budgetLineId: 'bl_gs_rm',
    justification: 'Refuse truck out of service. Required to restore weekly collection schedule.',
  },
  {
    id: 'req_007', reference: 'BRDC-REQ-2026-0126', title: 'New Econet bulk-SMS package',
    requestedBy: 'Kudakwashe Njanji', department: 'ICT', category: 'it',
    raisedAt: '2026-04-12T09:00:00Z', submittedAt: '2026-04-12T09:10:00Z',
    approvedAt: null, approvedBy: null,
    rejectedAt: '2026-04-14T10:40:00Z', rejectedReason: 'Exhausted FY2026 COMMS budget; resubmit in Q3.',
    status: 'rejected',
    lines: [{ description: 'Econet bulk-SMS credits (50k)', quantity: 1, unitPriceUsd: 1_820 }],
    budgetLineId: 'bl_gs_comm',
    justification: 'Billing notifications and alerts dispatching for the Finance module.',
  },
  {
    id: 'req_008', reference: 'BRDC-REQ-2026-0129', title: 'Venue hire — council AGM',
    requestedBy: 'Mary Matondo', department: 'HR & admin', category: 'other',
    raisedAt: '2026-04-15T08:00:00Z', submittedAt: null, approvedAt: null, approvedBy: null,
    rejectedAt: null, status: 'draft',
    lines: [
      { description: 'Chaka\u2019s Lodge conference hall (2 days)', quantity: 1, unitPriceUsd: 1_400 },
      { description: 'Catering per head', quantity: 60, unitPriceUsd: 18 },
    ],
    budgetLineId: 'bl_emp_exec',
    justification: 'Annual council meeting with all ward councillors and senior staff.',
  },
];

export function findRequisition(id: string): Requisition | undefined {
  return REQUISITIONS.find((r) => r.id === id);
}

export function totalUsd(r: Requisition): number {
  return r.lines.reduce((s, l) => s + l.quantity * l.unitPriceUsd, 0);
}

export function countByStatus(): Record<RequisitionStatus, number> {
  const out = { draft: 0, submitted: 0, approved: 0, rejected: 0, 'po-raised': 0, 'grv-received': 0, invoiced: 0, cancelled: 0 } as Record<RequisitionStatus, number>;
  for (const r of REQUISITIONS) out[r.status]++;
  return out;
}
