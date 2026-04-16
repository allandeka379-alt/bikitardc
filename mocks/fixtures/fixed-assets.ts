// ─────────────────────────────────────────────
// Fixed asset register — land, buildings, vehicles,
// plant, equipment with straight-line depreciation.
//
// Columns mirror the IPSAS 17 minimum:
//   cost, accumulated depreciation, carrying amount,
//   annual depreciation, useful life remaining.
// ─────────────────────────────────────────────

export type AssetCategory =
  | 'land-buildings'
  | 'infrastructure'
  | 'motor-vehicles'
  | 'plant-machinery'
  | 'office-equipment';

export interface FixedAsset {
  id: string;
  tag: string;           // council asset tag e.g. "BRDC-VEH-014"
  description: string;
  category: AssetCategory;
  location: string;
  custodian: string;
  acquiredAt: string;    // ISO
  costUsd: number;
  accumDeprUsd: number;
  /** Useful life in years (SL method). */
  usefulLifeYears: number;
  /** 0 for land; straight-line depreciation otherwise. */
  annualDeprUsd: number;
  /** 'active', 'disposed', 'impaired'. */
  status: 'active' | 'disposed' | 'impaired';
}

export const ASSET_CATEGORY_LABEL: Record<AssetCategory, string> = {
  'land-buildings':  'Land & buildings',
  infrastructure:    'Infrastructure',
  'motor-vehicles':  'Motor vehicles',
  'plant-machinery': 'Plant & machinery',
  'office-equipment':'Office equipment',
};

export const FIXED_ASSETS: FixedAsset[] = [
  // ── Land & buildings ──
  { id: 'fa_001', tag: 'BRDC-LB-001', description: 'Civic Centre, Chikwanda',        category: 'land-buildings',  location: 'Chikwanda HQ',   custodian: 'Administration', acquiredAt: '2006-06-30', costUsd: 680_000, accumDeprUsd: 272_000, usefulLifeYears: 50, annualDeprUsd: 13_600, status: 'active' },
  { id: 'fa_002', tag: 'BRDC-LB-002', description: 'Mupani Beer Hall building',      category: 'land-buildings',  location: 'Mupani',         custodian: 'Revenue',        acquiredAt: '1998-10-01', costUsd: 120_000, accumDeprUsd:  67_200, usefulLifeYears: 50, annualDeprUsd:  2_400, status: 'active' },
  { id: 'fa_003', tag: 'BRDC-LB-003', description: 'Nhema Ward Office',              category: 'land-buildings',  location: 'Nhema',          custodian: 'Administration', acquiredAt: '2012-04-12', costUsd:  80_000, accumDeprUsd:  22_400, usefulLifeYears: 50, annualDeprUsd:  1_600, status: 'active' },
  { id: 'fa_004', tag: 'BRDC-LB-004', description: 'Silveira Sub-office',            category: 'land-buildings',  location: 'Silveira',       custodian: 'Administration', acquiredAt: '2015-08-20', costUsd:  64_000, accumDeprUsd:  13_440, usefulLifeYears: 50, annualDeprUsd:  1_280, status: 'active' },

  // ── Infrastructure ──
  { id: 'fa_010', tag: 'BRDC-INF-001', description: 'Kamungoma carriageway (phase 1)',category: 'infrastructure', location: 'Kamungoma',      custodian: 'Engineering',    acquiredAt: '2024-12-01', costUsd: 220_000, accumDeprUsd:  11_000, usefulLifeYears: 20, annualDeprUsd: 11_000, status: 'active' },
  { id: 'fa_011', tag: 'BRDC-INF-002', description: 'Mupani water reticulation',     category: 'infrastructure',  location: 'Mupani',         custodian: 'Water & San.',   acquiredAt: '2022-06-15', costUsd: 188_000, accumDeprUsd:  28_200, usefulLifeYears: 25, annualDeprUsd:  7_520, status: 'active' },
  { id: 'fa_012', tag: 'BRDC-INF-003', description: 'Nyika solar streetlights (batch 1)',category: 'infrastructure',location: 'Nyika',       custodian: 'Engineering',    acquiredAt: '2025-11-20', costUsd:  46_000, accumDeprUsd:   2_300, usefulLifeYears: 10, annualDeprUsd:  4_600, status: 'active' },

  // ── Motor vehicles ──
  { id: 'fa_020', tag: 'BRDC-VEH-001', description: 'Isuzu D-Max (CEO)',             category: 'motor-vehicles',  location: 'Pool',           custodian: 'Executive',      acquiredAt: '2023-02-10', costUsd:  44_000, accumDeprUsd:  13_200, usefulLifeYears: 8,  annualDeprUsd:  5_500, status: 'active' },
  { id: 'fa_021', tag: 'BRDC-VEH-002', description: 'Toyota Hilux — Works',          category: 'motor-vehicles',  location: 'Works yard',     custodian: 'Works',          acquiredAt: '2021-07-04', costUsd:  38_000, accumDeprUsd:  17_800, usefulLifeYears: 8,  annualDeprUsd:  4_750, status: 'active' },
  { id: 'fa_022', tag: 'BRDC-VEH-003', description: 'Mahindra Bolero — Revenue',     category: 'motor-vehicles',  location: 'HQ',             custodian: 'Revenue',        acquiredAt: '2024-05-20', costUsd:  22_000, accumDeprUsd:   4_400, usefulLifeYears: 8,  annualDeprUsd:  2_750, status: 'active' },
  { id: 'fa_023', tag: 'BRDC-VEH-004', description: 'Nissan Hardbody — Water/San',   category: 'motor-vehicles',  location: 'Water yard',     custodian: 'Water & San.',   acquiredAt: '2019-03-15', costUsd:  28_000, accumDeprUsd:  22_400, usefulLifeYears: 8,  annualDeprUsd:  3_500, status: 'active' },
  { id: 'fa_024', tag: 'BRDC-VEH-005', description: 'Iveco 7-tonne refuse truck',    category: 'motor-vehicles',  location: 'Works yard',     custodian: 'Works',          acquiredAt: '2018-09-01', costUsd:  56_000, accumDeprUsd:  50_400, usefulLifeYears: 8,  annualDeprUsd:  7_000, status: 'active' },

  // ── Plant & machinery ──
  { id: 'fa_030', tag: 'BRDC-PLT-001', description: 'CAT motor grader 120K',         category: 'plant-machinery', location: 'Works yard',     custodian: 'Engineering',    acquiredAt: '2016-11-10', costUsd: 180_000, accumDeprUsd: 151_200, usefulLifeYears: 12, annualDeprUsd: 15_000, status: 'active' },
  { id: 'fa_031', tag: 'BRDC-PLT-002', description: 'JCB 3CX backhoe',               category: 'plant-machinery', location: 'Works yard',     custodian: 'Engineering',    acquiredAt: '2020-02-14', costUsd:  72_000, accumDeprUsd:  37_200, usefulLifeYears: 12, annualDeprUsd:  6_000, status: 'active' },
  { id: 'fa_032', tag: 'BRDC-PLT-003', description: 'Portable concrete mixer',       category: 'plant-machinery', location: 'Works yard',     custodian: 'Engineering',    acquiredAt: '2022-04-25', costUsd:   3_800, accumDeprUsd:   1_520, usefulLifeYears: 10, annualDeprUsd:    380, status: 'active' },
  { id: 'fa_033', tag: 'BRDC-PLT-004', description: 'Diesel generator 25 kVA',       category: 'plant-machinery', location: 'HQ',             custodian: 'IT',             acquiredAt: '2023-06-02', costUsd:  14_000, accumDeprUsd:   4_200, usefulLifeYears: 10, annualDeprUsd:  1_400, status: 'active' },

  // ── Office equipment ──
  { id: 'fa_040', tag: 'BRDC-EQP-001', description: 'HP MFP printers (x4)',          category: 'office-equipment',location: 'Finance floor',  custodian: 'IT',             acquiredAt: '2023-09-15', costUsd:   3_200, accumDeprUsd:   1_280, usefulLifeYears: 5,  annualDeprUsd:    640, status: 'active' },
  { id: 'fa_041', tag: 'BRDC-EQP-002', description: 'Dell OptiPlex workstations (x18)',category: 'office-equipment',location: 'All depts',   custodian: 'IT',             acquiredAt: '2024-01-08', costUsd:  14_400, accumDeprUsd:   3_840, usefulLifeYears: 5,  annualDeprUsd:  2_880, status: 'active' },
  { id: 'fa_042', tag: 'BRDC-EQP-003', description: 'Cisco switches & access points',category: 'office-equipment',location: 'Comms room',   custodian: 'IT',             acquiredAt: '2023-03-22', costUsd:   6_800, accumDeprUsd:   4_080, usefulLifeYears: 5,  annualDeprUsd:  1_360, status: 'active' },
];

export function carryingAmount(a: FixedAsset): number {
  return a.costUsd - a.accumDeprUsd;
}

export function totalsByCategory(): Record<AssetCategory, { cost: number; accum: number; nbv: number }> {
  const out: Record<AssetCategory, { cost: number; accum: number; nbv: number }> = {
    'land-buildings':  { cost: 0, accum: 0, nbv: 0 },
    infrastructure:    { cost: 0, accum: 0, nbv: 0 },
    'motor-vehicles':  { cost: 0, accum: 0, nbv: 0 },
    'plant-machinery': { cost: 0, accum: 0, nbv: 0 },
    'office-equipment':{ cost: 0, accum: 0, nbv: 0 },
  };
  for (const a of FIXED_ASSETS) {
    if (a.status === 'disposed') continue;
    out[a.category].cost  += a.costUsd;
    out[a.category].accum += a.accumDeprUsd;
    out[a.category].nbv   += carryingAmount(a);
  }
  return out;
}
