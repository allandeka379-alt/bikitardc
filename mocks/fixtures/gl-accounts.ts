// ─────────────────────────────────────────────
// Chart of Accounts — IPSAS-aligned structure:
//
//   1xxx  Assets           (current, non-current)
//   2xxx  Liabilities      (current, non-current)
//   3xxx  Net assets / Accumulated surplus
//   4xxx  Revenue          (exchange + non-exchange)
//   5xxx  Employee costs
//   6xxx  Goods & services
//   7xxx  Transfers & grants
//   8xxx  Finance costs
//   9xxx  Depreciation & impairment
// ─────────────────────────────────────────────

export type GlAccountType =
  | 'asset'
  | 'liability'
  | 'net-assets'
  | 'revenue'
  | 'expense';

export interface GlAccount {
  code: string;
  name: string;
  type: GlAccountType;
  parentCode?: string;
  /** FY2026 YTD balance in USD. Positive = natural balance on the correct side. */
  ytdBalanceUsd: number;
  /** FY2025 comparative. */
  priorYearUsd: number;
}

export const GL_ACCOUNTS: GlAccount[] = [
  // ── 1000 Assets ──
  { code: '1000', name: 'Assets',                             type: 'asset',      ytdBalanceUsd: 2_840_120, priorYearUsd: 2_612_480 },
  { code: '1100', name: 'Current assets',                     type: 'asset', parentCode: '1000', ytdBalanceUsd: 612_450, priorYearUsd: 548_200 },
  { code: '1110', name: 'Cash at bank',                       type: 'asset', parentCode: '1100', ytdBalanceUsd: 288_310, priorYearUsd: 240_140 },
  { code: '1120', name: 'Cash on hand',                       type: 'asset', parentCode: '1100', ytdBalanceUsd:   4_820, priorYearUsd:   3_950 },
  { code: '1130', name: 'Receivables from exchange',          type: 'asset', parentCode: '1100', ytdBalanceUsd: 184_620, priorYearUsd: 162_310 },
  { code: '1140', name: 'Rates debtors',                      type: 'asset', parentCode: '1100', ytdBalanceUsd: 108_290, priorYearUsd:  99_420 },
  { code: '1150', name: 'Prepayments',                        type: 'asset', parentCode: '1100', ytdBalanceUsd:  18_340, priorYearUsd:  22_100 },
  { code: '1160', name: 'Inventory — stores',                 type: 'asset', parentCode: '1100', ytdBalanceUsd:   8_070, priorYearUsd:  11_280 },

  { code: '1500', name: 'Non-current assets',                 type: 'asset', parentCode: '1000', ytdBalanceUsd: 2_227_670, priorYearUsd: 2_064_280 },
  { code: '1510', name: 'Land & buildings',                   type: 'asset', parentCode: '1500', ytdBalanceUsd: 1_420_500, priorYearUsd: 1_420_500 },
  { code: '1520', name: 'Infrastructure — roads',             type: 'asset', parentCode: '1500', ytdBalanceUsd:   324_100, priorYearUsd:   304_600 },
  { code: '1530', name: 'Infrastructure — water & sewer',     type: 'asset', parentCode: '1500', ytdBalanceUsd:   218_450, priorYearUsd:   198_960 },
  { code: '1540', name: 'Motor vehicles',                     type: 'asset', parentCode: '1500', ytdBalanceUsd:    96_220, priorYearUsd:    78_740 },
  { code: '1550', name: 'Plant & machinery',                  type: 'asset', parentCode: '1500', ytdBalanceUsd:   112_840, priorYearUsd:    44_480 },
  { code: '1560', name: 'Office equipment',                   type: 'asset', parentCode: '1500', ytdBalanceUsd:    14_890, priorYearUsd:    12_920 },
  { code: '1590', name: 'Accumulated depreciation',           type: 'asset', parentCode: '1500', ytdBalanceUsd:        40_330, priorYearUsd: 4_080 },

  // ── 2000 Liabilities ──
  { code: '2000', name: 'Liabilities',                        type: 'liability',                  ytdBalanceUsd: 326_840, priorYearUsd: 294_720 },
  { code: '2100', name: 'Current liabilities',                type: 'liability', parentCode: '2000', ytdBalanceUsd: 212_140, priorYearUsd: 186_420 },
  { code: '2110', name: 'Trade payables (creditors)',         type: 'liability', parentCode: '2100', ytdBalanceUsd:  78_920, priorYearUsd:  64_820 },
  { code: '2120', name: 'Accruals',                           type: 'liability', parentCode: '2100', ytdBalanceUsd:  22_440, priorYearUsd:  19_120 },
  { code: '2130', name: 'PAYE withheld',                      type: 'liability', parentCode: '2100', ytdBalanceUsd:   6_820, priorYearUsd:   6_420 },
  { code: '2140', name: 'NSSA withheld',                      type: 'liability', parentCode: '2100', ytdBalanceUsd:   4_120, priorYearUsd:   3_910 },
  { code: '2150', name: 'NEC withheld',                       type: 'liability', parentCode: '2100', ytdBalanceUsd:   2_210, priorYearUsd:   2_080 },
  { code: '2160', name: 'Deferred revenue',                   type: 'liability', parentCode: '2100', ytdBalanceUsd:  24_820, priorYearUsd:  18_440 },
  { code: '2170', name: 'Consumer deposits',                  type: 'liability', parentCode: '2100', ytdBalanceUsd:  72_810, priorYearUsd:  71_630 },

  { code: '2500', name: 'Non-current liabilities',            type: 'liability', parentCode: '2000', ytdBalanceUsd: 114_700, priorYearUsd: 108_300 },
  { code: '2510', name: 'Long-term loans — IDBZ',             type: 'liability', parentCode: '2500', ytdBalanceUsd: 102_400, priorYearUsd:  96_000 },
  { code: '2520', name: 'Pension obligations',                type: 'liability', parentCode: '2500', ytdBalanceUsd:  12_300, priorYearUsd:  12_300 },

  // ── 3000 Net assets ──
  { code: '3000', name: 'Net assets',                         type: 'net-assets',                 ytdBalanceUsd: 2_513_280, priorYearUsd: 2_317_760 },
  { code: '3100', name: 'Accumulated surplus (general fund)', type: 'net-assets', parentCode: '3000', ytdBalanceUsd: 2_082_840, priorYearUsd: 1_912_240 },
  { code: '3200', name: 'Capital reserves',                   type: 'net-assets', parentCode: '3000', ytdBalanceUsd:   230_440, priorYearUsd:   215_520 },
  { code: '3300', name: 'Restricted funds — CAMPFIRE',        type: 'net-assets', parentCode: '3000', ytdBalanceUsd:   200_000, priorYearUsd:   190_000 },

  // ── 4000 Revenue ──
  { code: '4000', name: 'Revenue',                            type: 'revenue',                    ytdBalanceUsd: 430_670, priorYearUsd: 402_140 },
  { code: '4100', name: 'Property rates',                     type: 'revenue', parentCode: '4000', ytdBalanceUsd: 182_340, priorYearUsd: 168_420 },
  { code: '4110', name: 'Unit tax',                           type: 'revenue', parentCode: '4000', ytdBalanceUsd:  41_220, priorYearUsd:  39_220 },
  { code: '4120', name: 'Development levy',                   type: 'revenue', parentCode: '4000', ytdBalanceUsd:  28_950, priorYearUsd:  27_600 },
  { code: '4200', name: 'Business licences',                  type: 'revenue', parentCode: '4000', ytdBalanceUsd:  57_480, priorYearUsd:  48_220 },
  { code: '4210', name: 'Refuse & sanitation',                type: 'revenue', parentCode: '4000', ytdBalanceUsd:  22_180, priorYearUsd:  21_440 },
  { code: '4220', name: 'Water & sewer',                      type: 'revenue', parentCode: '4000', ytdBalanceUsd:  16_430, priorYearUsd:  14_920 },
  { code: '4230', name: 'Plan approval fees',                 type: 'revenue', parentCode: '4000', ytdBalanceUsd:   7_890, priorYearUsd:   6_410 },
  { code: '4310', name: 'Market fees',                        type: 'revenue', parentCode: '4000', ytdBalanceUsd:  19_640, priorYearUsd:  17_940 },
  { code: '4320', name: 'Beer hall revenue',                  type: 'revenue', parentCode: '4000', ytdBalanceUsd:  34_760, priorYearUsd:  33_210 },
  { code: '4330', name: 'Civic hall hire',                    type: 'revenue', parentCode: '4000', ytdBalanceUsd:   4_210, priorYearUsd:   4_380 },
  { code: '4340', name: 'Cemetery fees',                      type: 'revenue', parentCode: '4000', ytdBalanceUsd:   3_120, priorYearUsd:   2_840 },
  { code: '4400', name: 'CAMPFIRE levies',                    type: 'revenue', parentCode: '4000', ytdBalanceUsd:  12_450, priorYearUsd:  17_540 },

  // ── 5000 Employee costs ──
  { code: '5000', name: 'Employee costs',                     type: 'expense',                    ytdBalanceUsd: 148_720, priorYearUsd: 132_420 },
  { code: '5100', name: 'Salaries & wages',                   type: 'expense', parentCode: '5000', ytdBalanceUsd: 124_480, priorYearUsd: 110_280 },
  { code: '5200', name: 'Allowances',                         type: 'expense', parentCode: '5000', ytdBalanceUsd:  12_840, priorYearUsd:  11_200 },
  { code: '5300', name: 'Employer NSSA / NEC',                type: 'expense', parentCode: '5000', ytdBalanceUsd:   8_240, priorYearUsd:   7_640 },
  { code: '5400', name: 'Pension contributions',              type: 'expense', parentCode: '5000', ytdBalanceUsd:   3_160, priorYearUsd:   3_300 },

  // ── 6000 Goods & services ──
  { code: '6000', name: 'Goods & services',                   type: 'expense',                    ytdBalanceUsd: 84_460, priorYearUsd: 78_210 },
  { code: '6100', name: 'Fuel & lubricants',                  type: 'expense', parentCode: '6000', ytdBalanceUsd: 18_420, priorYearUsd: 16_240 },
  { code: '6200', name: 'Repairs & maintenance',              type: 'expense', parentCode: '6000', ytdBalanceUsd: 14_760, priorYearUsd: 13_210 },
  { code: '6300', name: 'Utilities',                          type: 'expense', parentCode: '6000', ytdBalanceUsd:  8_240, priorYearUsd:  7_620 },
  { code: '6400', name: 'Printing & stationery',              type: 'expense', parentCode: '6000', ytdBalanceUsd:  3_180, priorYearUsd:  2_940 },
  { code: '6500', name: 'Communications',                     type: 'expense', parentCode: '6000', ytdBalanceUsd:  6_920, priorYearUsd:  5_810 },
  { code: '6600', name: 'Professional fees',                  type: 'expense', parentCode: '6000', ytdBalanceUsd: 12_420, priorYearUsd: 11_820 },
  { code: '6700', name: 'Cost of beer hall sales',            type: 'expense', parentCode: '6000', ytdBalanceUsd: 20_520, priorYearUsd: 20_570 },

  // ── 7000 Transfers ──
  { code: '7000', name: 'Transfers & grants',                 type: 'expense',                    ytdBalanceUsd: 14_800, priorYearUsd: 12_420 },
  { code: '7100', name: 'CAMPFIRE ward dividends',            type: 'expense', parentCode: '7000', ytdBalanceUsd:  6_225, priorYearUsd:  8_770 },
  { code: '7200', name: 'Community grants',                   type: 'expense', parentCode: '7000', ytdBalanceUsd:  8_575, priorYearUsd:  3_650 },

  // ── 8000 Finance costs ──
  { code: '8000', name: 'Finance costs',                      type: 'expense',                    ytdBalanceUsd:  4_820, priorYearUsd:  5_420 },
  { code: '8100', name: 'Loan interest — IDBZ',               type: 'expense', parentCode: '8000', ytdBalanceUsd:  4_820, priorYearUsd:  5_420 },

  // ── 9000 Depreciation ──
  { code: '9000', name: 'Depreciation & impairment',          type: 'expense',                    ytdBalanceUsd: 36_250, priorYearUsd: 41_820 },
  { code: '9100', name: 'Depreciation — buildings',           type: 'expense', parentCode: '9000', ytdBalanceUsd: 14_200, priorYearUsd: 14_200 },
  { code: '9200', name: 'Depreciation — vehicles',            type: 'expense', parentCode: '9000', ytdBalanceUsd:  9_620, priorYearUsd:  7_880 },
  { code: '9300', name: 'Depreciation — plant',               type: 'expense', parentCode: '9000', ytdBalanceUsd: 11_280, priorYearUsd: 14_440 },
  { code: '9400', name: 'Depreciation — equipment',           type: 'expense', parentCode: '9000', ytdBalanceUsd:  1_150, priorYearUsd:  5_300 },
];

export function findGlAccount(code: string): GlAccount | undefined {
  return GL_ACCOUNTS.find((a) => a.code === code);
}

export function accountsOfType(type: GlAccountType): GlAccount[] {
  return GL_ACCOUNTS.filter((a) => a.type === type && !a.parentCode);
}

export function childrenOf(code: string): GlAccount[] {
  return GL_ACCOUNTS.filter((a) => a.parentCode === code);
}

export const TYPE_LABEL: Record<GlAccountType, string> = {
  asset:       'Assets',
  liability:   'Liabilities',
  'net-assets':'Net assets',
  revenue:     'Revenue',
  expense:     'Expenses',
};
