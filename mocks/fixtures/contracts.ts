// ─────────────────────────────────────────────
// Active supplier contracts — awarded from the
// tender / RFQ workflow. Each carries a start /
// end / value and consumption to date so the CFO
// can see contract burn.
// ─────────────────────────────────────────────

export type ContractStatus = 'active' | 'expiring' | 'expired' | 'terminated';

export interface Contract {
  id: string;
  reference: string;          // BRDC-CTR-2026-001
  title: string;
  supplierId: string;         // link to fixtures/creditors.ts
  supplierName: string;       // denormalised for display
  tenderId?: string;
  signedAt: string;
  startsAt: string;
  endsAt: string;
  ceilingUsd: number;         // contract value
  consumedUsd: number;        // amount invoiced / spent against the ceiling
  status: ContractStatus;
  department: string;
  ownerEmployee: string;      // council contract owner
  /** Legal escrow / retention amount, if any. */
  retentionPct: number;
}

export const STATUS_LABEL: Record<ContractStatus, string> = {
  active:     'Active',
  expiring:   'Expiring soon',
  expired:    'Expired',
  terminated: 'Terminated',
};

export const STATUS_TONE: Record<ContractStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
  active:     'success',
  expiring:   'warning',
  expired:    'neutral',
  terminated: 'danger',
};

export const CONTRACTS: Contract[] = [
  {
    id: 'ctr_001', reference: 'BRDC-CTR-2026-001',
    title: 'Kamungoma dual carriageway — phase 2 construction',
    supplierId: 'cr_masv_civ', supplierName: 'Masvingo Civil Works',
    tenderId: 'tn_001',
    signedAt: '2026-01-12', startsAt: '2026-01-20', endsAt: '2026-08-31',
    ceilingUsd: 196_400, consumedUsd: 120_000,
    status: 'active',
    department: 'Engineering', ownerEmployee: 'Eng. Grace Mutema',
    retentionPct: 10,
  },
  {
    id: 'ctr_002', reference: 'BRDC-CTR-2026-002',
    title: 'Bulk diesel supply — 12 months',
    supplierId: 'cr_zuva', supplierName: 'Zuva Total Services',
    tenderId: 'tn_003',
    signedAt: '2026-03-10', startsAt: '2026-03-15', endsAt: '2027-03-14',
    ceilingUsd: 46_080, consumedUsd: 7_680,
    status: 'active',
    department: 'Finance', ownerEmployee: 'Nobert Chigariro',
    retentionPct: 0,
  },
  {
    id: 'ctr_003', reference: 'BRDC-CTR-2025-014',
    title: 'Legal retainer — Gutu & Associates',
    supplierId: 'cr_gutu_law', supplierName: 'Gutu & Associates Legal',
    signedAt: '2025-07-01', startsAt: '2025-07-01', endsAt: '2026-06-30',
    ceilingUsd: 36_000, consumedUsd: 28_400,
    status: 'expiring',
    department: 'Executive', ownerEmployee: 'Eng. Tafadzwa Makoni',
    retentionPct: 0,
  },
  {
    id: 'ctr_004', reference: 'BRDC-CTR-2025-021',
    title: 'Masvingo Hardware — maintenance supplies framework',
    supplierId: 'cr_masvhard', supplierName: 'Masvingo Hardware',
    signedAt: '2025-09-01', startsAt: '2025-09-01', endsAt: '2026-08-31',
    ceilingUsd: 60_000, consumedUsd: 24_800,
    status: 'active',
    department: 'Works', ownerEmployee: 'Fortune Marimo',
    retentionPct: 0,
  },
  {
    id: 'ctr_005', reference: 'BRDC-CTR-2024-009',
    title: 'Willowvale Doc & Print — stationery framework',
    supplierId: 'cr_willdoc', supplierName: 'Willowvale Doc & Print',
    signedAt: '2024-10-01', startsAt: '2024-10-01', endsAt: '2025-09-30',
    ceilingUsd: 12_000, consumedUsd: 11_720,
    status: 'expired',
    department: 'HR & admin', ownerEmployee: 'Rumbidzai Ndou',
    retentionPct: 0,
  },
];

export function findContract(id: string): Contract | undefined {
  return CONTRACTS.find((c) => c.id === id);
}

export function burnPct(c: Contract): number {
  return c.ceilingUsd > 0 ? c.consumedUsd / c.ceilingUsd : 0;
}

export function daysToExpiry(c: Contract, today: Date = new Date('2026-04-17')): number {
  return Math.floor((new Date(c.endsAt).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
