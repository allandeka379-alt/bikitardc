// ─────────────────────────────────────────────
// Approved FY2026 internal budget (Finance module).
// Different from fixtures/budget.ts which powers the
// public ward-transparency chart — this fixture is
// the line-by-line operational budget by vote.
//
// Each line carries:
//   • Annual approved figure
//   • Year-to-date actual (sum of GL postings)
//   • A computed variance % vs pro-rata
//
// Fed into /erp/finance/budget and the IPSAS
// budget-execution report.
// ─────────────────────────────────────────────

export type BudgetVote =
  | 'executive'
  | 'finance'
  | 'revenue'
  | 'engineering'
  | 'works'
  | 'water-sanitation'
  | 'social-services'
  | 'hr'
  | 'it'
  | 'capital';

export type BudgetKind = 'revenue' | 'expense' | 'capital';

export interface BudgetLine {
  id: string;
  vote: BudgetVote;
  kind: BudgetKind;
  category: string;
  approvedUsd: number;
  ytdActualUsd: number;
  glAccount?: string;
}

export const VOTE_LABEL: Record<BudgetVote, string> = {
  executive:         'Executive & Council',
  finance:           'Finance',
  revenue:           'Revenue',
  engineering:       'Engineering',
  works:             'Works',
  'water-sanitation':'Water & sanitation',
  'social-services': 'Social services',
  hr:                'HR & administration',
  it:                'ICT',
  capital:           'Capital works',
};

// FY runs Jan–Dec. At 2026-04-17 we expect ~30% of the annual
// figure for a linearly-consumed line. Some categories are
// deliberately ahead/behind to make the variance view real.
export const BUDGET_LINES: BudgetLine[] = [
  // ── Revenue targets (by source) ──
  { id: 'bl_rev_rates',    vote: 'revenue', kind: 'revenue', category: 'Property rates',         approvedUsd: 540_000, ytdActualUsd: 182_340, glAccount: '4100' },
  { id: 'bl_rev_utax',     vote: 'revenue', kind: 'revenue', category: 'Unit tax',               approvedUsd:  96_000, ytdActualUsd:  41_220, glAccount: '4110' },
  { id: 'bl_rev_devl',     vote: 'revenue', kind: 'revenue', category: 'Development levy',       approvedUsd:  72_000, ytdActualUsd:  28_950, glAccount: '4120' },
  { id: 'bl_rev_biz',      vote: 'revenue', kind: 'revenue', category: 'Business licences',      approvedUsd: 120_000, ytdActualUsd:  57_480, glAccount: '4200' },
  { id: 'bl_rev_mkt',      vote: 'revenue', kind: 'revenue', category: 'Market fees',            approvedUsd:  48_000, ytdActualUsd:  19_640, glAccount: '4310' },
  { id: 'bl_rev_beer',     vote: 'revenue', kind: 'revenue', category: 'Beer hall revenue',      approvedUsd:  88_000, ytdActualUsd:  34_760, glAccount: '4320' },
  { id: 'bl_rev_camp',     vote: 'revenue', kind: 'revenue', category: 'CAMPFIRE levies',        approvedUsd:  36_000, ytdActualUsd:  12_450, glAccount: '4400' },
  { id: 'bl_rev_ref',      vote: 'revenue', kind: 'revenue', category: 'Refuse & sanitation',    approvedUsd:  54_000, ytdActualUsd:  22_180, glAccount: '4210' },
  { id: 'bl_rev_wat',      vote: 'revenue', kind: 'revenue', category: 'Water & sewer',          approvedUsd:  42_000, ytdActualUsd:  16_430, glAccount: '4220' },
  { id: 'bl_rev_misc',     vote: 'revenue', kind: 'revenue', category: 'Plan + hall + cemetery', approvedUsd:  38_000, ytdActualUsd:  15_220 },

  // ── Employee costs (by vote) ──
  { id: 'bl_emp_exec',  vote: 'executive',       kind: 'expense', category: 'Salaries & allowances', approvedUsd:  72_000, ytdActualUsd: 22_080 },
  { id: 'bl_emp_fin',   vote: 'finance',         kind: 'expense', category: 'Salaries & allowances', approvedUsd:  96_000, ytdActualUsd: 29_440 },
  { id: 'bl_emp_rev',   vote: 'revenue',         kind: 'expense', category: 'Salaries & allowances', approvedUsd:  84_000, ytdActualUsd: 26_820 },
  { id: 'bl_emp_eng',   vote: 'engineering',     kind: 'expense', category: 'Salaries & allowances', approvedUsd:  64_000, ytdActualUsd: 19_220 },
  { id: 'bl_emp_wrk',   vote: 'works',           kind: 'expense', category: 'Salaries & allowances', approvedUsd:  76_000, ytdActualUsd: 23_280 },
  { id: 'bl_emp_wat',   vote: 'water-sanitation',kind: 'expense', category: 'Salaries & allowances', approvedUsd:  48_000, ytdActualUsd: 14_600 },
  { id: 'bl_emp_ss',    vote: 'social-services', kind: 'expense', category: 'Salaries & allowances', approvedUsd:  32_000, ytdActualUsd:  9_920 },
  { id: 'bl_emp_hr',    vote: 'hr',              kind: 'expense', category: 'Salaries & allowances', approvedUsd:  28_000, ytdActualUsd:  8_640 },
  { id: 'bl_emp_it',    vote: 'it',              kind: 'expense', category: 'Salaries & allowances', approvedUsd:  18_000, ytdActualUsd:  5_720 },

  // ── Goods & services ──
  { id: 'bl_gs_fuel',   vote: 'works',           kind: 'expense', category: 'Fuel & lubricants',     approvedUsd:  48_000, ytdActualUsd: 18_420 },
  { id: 'bl_gs_rm',     vote: 'engineering',     kind: 'expense', category: 'Repairs & maintenance', approvedUsd:  36_000, ytdActualUsd: 14_760 },
  { id: 'bl_gs_util',   vote: 'finance',         kind: 'expense', category: 'Utilities',             approvedUsd:  24_000, ytdActualUsd:  8_240 },
  { id: 'bl_gs_print',  vote: 'finance',         kind: 'expense', category: 'Printing & stationery', approvedUsd:   8_000, ytdActualUsd:  3_180 },
  { id: 'bl_gs_comm',   vote: 'it',              kind: 'expense', category: 'Communications',        approvedUsd:  18_000, ytdActualUsd:  6_920 },
  { id: 'bl_gs_prof',   vote: 'executive',       kind: 'expense', category: 'Professional fees',     approvedUsd:  32_000, ytdActualUsd: 12_420 },
  { id: 'bl_gs_beer',   vote: 'revenue',         kind: 'expense', category: 'Cost of beer sales',    approvedUsd:  54_000, ytdActualUsd: 20_520 },

  // ── Transfers ──
  { id: 'bl_tr_camp',   vote: 'social-services', kind: 'expense', category: 'CAMPFIRE ward dividends',approvedUsd:  18_000, ytdActualUsd:  6_225 },
  { id: 'bl_tr_grants', vote: 'social-services', kind: 'expense', category: 'Community grants',      approvedUsd:  24_000, ytdActualUsd:  8_575 },

  // ── Finance costs ──
  { id: 'bl_fc_loan',   vote: 'finance',         kind: 'expense', category: 'Loan interest (IDBZ)',  approvedUsd:  18_000, ytdActualUsd:  4_820 },

  // ── Capital works ──
  { id: 'bl_cap_signals',vote: 'capital', kind: 'capital', category: 'Kamungoma solar signals',      approvedUsd:  68_000, ytdActualUsd: 68_000 },
  { id: 'bl_cap_road',   vote: 'capital', kind: 'capital', category: 'Kamungoma carriageway',        approvedUsd: 220_000, ytdActualUsd: 202_100 },
  { id: 'bl_cap_street', vote: 'capital', kind: 'capital', category: 'Solar street-lighting',        approvedUsd:  90_000, ytdActualUsd: 64_800 },
  { id: 'bl_cap_elec',   vote: 'capital', kind: 'capital', category: 'Rural electrification',        approvedUsd: 150_000, ytdActualUsd: 87_000 },
  { id: 'bl_cap_dam',    vote: 'capital', kind: 'capital', category: 'Dam rehabilitation',           approvedUsd:  72_000, ytdActualUsd: 28_800 },
  { id: 'bl_cap_sign',   vote: 'capital', kind: 'capital', category: 'Signage & road safety',        approvedUsd:  24_000, ytdActualUsd:  7_200 },
];

/** Pro-rata consumption expected at this point in the fiscal year (0..1). */
export const YTD_PRORATA = 0.30;

export interface BudgetVariance {
  line: BudgetLine;
  consumedPct: number;
  variancePct: number;
  remainingUsd: number;
}

export function computeVariance(line: BudgetLine): BudgetVariance {
  const consumedPct = line.approvedUsd > 0 ? line.ytdActualUsd / line.approvedUsd : 0;
  const variancePct = consumedPct - YTD_PRORATA;
  const remainingUsd = line.approvedUsd - line.ytdActualUsd;
  return { line, consumedPct, variancePct, remainingUsd };
}

export function totalsByKind() {
  const out = {
    revenue: { approved: 0, actual: 0 },
    expense: { approved: 0, actual: 0 },
    capital: { approved: 0, actual: 0 },
  };
  for (const l of BUDGET_LINES) {
    out[l.kind].approved += l.approvedUsd;
    out[l.kind].actual += l.ytdActualUsd;
  }
  return out;
}
