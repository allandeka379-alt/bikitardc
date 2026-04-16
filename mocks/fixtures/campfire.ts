// ─────────────────────────────────────────────
// CAMPFIRE — Communal Areas Management Programme
// for Indigenous Resources.
//
// Tracks the wildlife hunting quota allocated to
// Bikita by ZimParks per ward, the levy paid when
// an off-take is booked, and the ward dividend that
// is ring-fenced for community infrastructure.
// ─────────────────────────────────────────────

export type CampfireSpecies =
  | 'elephant'
  | 'buffalo'
  | 'kudu'
  | 'impala'
  | 'crocodile'
  | 'leopard';

export interface CampfireQuota {
  id: string;
  ward: string;
  species: CampfireSpecies;
  /** Animals allocated to the ward for the fiscal year. */
  allocated: number;
  /** Animals taken so far. */
  utilised: number;
  /** Levy USD per off-take — payable to council before the hunt. */
  feePerOfftakeUsd: number;
  season: string; // e.g. "2026"
}

export interface CampfireOfftake {
  id: string;
  quotaId: string;
  ward: string;
  species: CampfireSpecies;
  operator: string;          // safari operator
  huntersOrigin: string;     // "ZA", "DE", "US", etc.
  offtakeDate: string;       // ISO
  levyUsd: number;
  status: 'scheduled' | 'paid' | 'completed' | 'cancelled';
}

export const SPECIES_LABEL: Record<CampfireSpecies, string> = {
  elephant:   'Elephant',
  buffalo:    'Buffalo',
  kudu:       'Kudu',
  impala:     'Impala',
  crocodile:  'Crocodile',
  leopard:    'Leopard',
};

export const CAMPFIRE_QUOTAS: CampfireQuota[] = [
  { id: 'c_nyi_ele', ward: 'Nyika',   species: 'elephant', allocated: 2, utilised: 1, feePerOfftakeUsd: 7500, season: '2026' },
  { id: 'c_nyi_buf', ward: 'Nyika',   species: 'buffalo',  allocated: 6, utilised: 3, feePerOfftakeUsd: 1800, season: '2026' },
  { id: 'c_nyi_kud', ward: 'Nyika',   species: 'kudu',     allocated: 8, utilised: 5, feePerOfftakeUsd:  650, season: '2026' },
  { id: 'c_nhe_ele', ward: 'Nhema',   species: 'elephant', allocated: 1, utilised: 0, feePerOfftakeUsd: 7500, season: '2026' },
  { id: 'c_nhe_buf', ward: 'Nhema',   species: 'buffalo',  allocated: 4, utilised: 2, feePerOfftakeUsd: 1800, season: '2026' },
  { id: 'c_nhe_imp', ward: 'Nhema',   species: 'impala',   allocated:12, utilised: 9, feePerOfftakeUsd:  220, season: '2026' },
  { id: 'c_mup_buf', ward: 'Mupani',  species: 'buffalo',  allocated: 3, utilised: 1, feePerOfftakeUsd: 1800, season: '2026' },
  { id: 'c_mup_croc',ward: 'Mupani',  species: 'crocodile',allocated: 5, utilised: 3, feePerOfftakeUsd:  480, season: '2026' },
  { id: 'c_bot_imp', ward: 'Bota',    species: 'impala',   allocated: 8, utilised: 4, feePerOfftakeUsd:  220, season: '2026' },
  { id: 'c_bot_leo', ward: 'Bota',    species: 'leopard',  allocated: 1, utilised: 1, feePerOfftakeUsd: 4200, season: '2026' },
];

export const CAMPFIRE_OFFTAKES: CampfireOfftake[] = [
  { id: 'o_001', quotaId: 'c_nyi_ele', ward: 'Nyika', species: 'elephant', operator: 'Karoi Safaris',   huntersOrigin: 'DE', offtakeDate: '2026-02-14', levyUsd: 7500, status: 'completed' },
  { id: 'o_002', quotaId: 'c_nyi_buf', ward: 'Nyika', species: 'buffalo',  operator: 'Karoi Safaris',   huntersOrigin: 'US', offtakeDate: '2026-03-02', levyUsd: 1800, status: 'completed' },
  { id: 'o_003', quotaId: 'c_nyi_buf', ward: 'Nyika', species: 'buffalo',  operator: 'Bvumba Hunting',  huntersOrigin: 'US', offtakeDate: '2026-03-28', levyUsd: 1800, status: 'completed' },
  { id: 'o_004', quotaId: 'c_nyi_buf', ward: 'Nyika', species: 'buffalo',  operator: 'Karoi Safaris',   huntersOrigin: 'DE', offtakeDate: '2026-04-22', levyUsd: 1800, status: 'paid' },
  { id: 'o_005', quotaId: 'c_nyi_kud', ward: 'Nyika', species: 'kudu',     operator: 'Chete Hunters',   huntersOrigin: 'ZA', offtakeDate: '2026-05-04', levyUsd:  650, status: 'scheduled' },
  { id: 'o_006', quotaId: 'c_nhe_imp', ward: 'Nhema', species: 'impala',   operator: 'Bvumba Hunting',  huntersOrigin: 'ZA', offtakeDate: '2026-03-10', levyUsd:  220, status: 'completed' },
  { id: 'o_007', quotaId: 'c_mup_croc',ward: 'Mupani',species: 'crocodile',operator: 'Zambezi Safaris', huntersOrigin: 'ZA', offtakeDate: '2026-02-02', levyUsd:  480, status: 'completed' },
  { id: 'o_008', quotaId: 'c_bot_leo', ward: 'Bota',  species: 'leopard',  operator: 'Bvumba Hunting',  huntersOrigin: 'US', offtakeDate: '2026-04-01', levyUsd: 4200, status: 'completed' },
];

export function quotasByWard(): Record<string, CampfireQuota[]> {
  const out: Record<string, CampfireQuota[]> = {};
  for (const q of CAMPFIRE_QUOTAS) {
    (out[q.ward] ||= []).push(q);
  }
  return out;
}

export function campfireYtdLevies(): number {
  return CAMPFIRE_OFFTAKES
    .filter((o) => o.status === 'completed' || o.status === 'paid')
    .reduce((sum, o) => sum + o.levyUsd, 0);
}
