// ─────────────────────────────────────────────
// Canonical list of council revenue sources — the
// single source-of-truth behind Billing runs, the
// Finance GL dashboards, and the statutory returns
// to the Ministry.
//
// Ordered roughly by FY2026 YTD contribution so the
// first rows naturally dominate revenue dashboards.
// ─────────────────────────────────────────────

export type RevenueSourceId =
  | 'property-rates'
  | 'unit-tax'
  | 'development-levy'
  | 'business-licence'
  | 'market-fees'
  | 'beer-hall'
  | 'campfire'
  | 'refuse-sanitation'
  | 'water-sewer'
  | 'hall-hire'
  | 'cemetery'
  | 'plan-fees';

export type RevenueSourceCategory =
  | 'rates-and-taxes'
  | 'licences-and-permits'
  | 'service-charges'
  | 'natural-resources'
  | 'other';

export interface RevenueSource {
  id: RevenueSourceId;
  label: string;
  shortCode: string; // e.g. "RATES", "UTAX" — used on reports
  category: RevenueSourceCategory;
  description: string;
  glAccount: string; // IPSAS revenue account code
  /** Billed automatically by a scheduled billing run. */
  isBillingRun: boolean;
  /** Approximate YTD FY2026 collection in USD — used for headline tiles. */
  ytdUsd: number;
  /** FY2026 budgeted target. */
  targetUsd: number;
}

export const REVENUE_SOURCES: RevenueSource[] = [
  {
    id: 'property-rates',
    label: 'Property rates',
    shortCode: 'RATES',
    category: 'rates-and-taxes',
    description:
      'Quarterly rates on residential, commercial and agricultural stands — Council by-law §3.2.',
    glAccount: '4100',
    isBillingRun: true,
    ytdUsd: 182_340,
    targetUsd: 540_000,
  },
  {
    id: 'unit-tax',
    label: 'Unit tax',
    shortCode: 'UTAX',
    category: 'rates-and-taxes',
    description:
      'Annual communal-land unit tax — RDC Act §45. Flat amount per tax-paying household.',
    glAccount: '4110',
    isBillingRun: true,
    ytdUsd: 41_220,
    targetUsd: 96_000,
  },
  {
    id: 'development-levy',
    label: 'Development levy',
    shortCode: 'DEVL',
    category: 'rates-and-taxes',
    description:
      'Statutory levy on all rated properties, ring-fenced for ward capital projects.',
    glAccount: '4120',
    isBillingRun: true,
    ytdUsd: 28_950,
    targetUsd: 72_000,
  },
  {
    id: 'business-licence',
    label: 'Business licences',
    shortCode: 'BIZ',
    category: 'licences-and-permits',
    description:
      'Trading, vending, liquor and professional licences — billed on application + annual renewal.',
    glAccount: '4200',
    isBillingRun: false,
    ytdUsd: 57_480,
    targetUsd: 120_000,
  },
  {
    id: 'market-fees',
    label: 'Market fees',
    shortCode: 'MKT',
    category: 'service-charges',
    description:
      'Daily and monthly stall rentals across Mupani, Nyika and Nhema council markets.',
    glAccount: '4310',
    isBillingRun: true,
    ytdUsd: 19_640,
    targetUsd: 48_000,
  },
  {
    id: 'beer-hall',
    label: 'Beer hall revenue',
    shortCode: 'BEER',
    category: 'service-charges',
    description:
      'Council-run beer halls — Mupani, Bota and Silveira outlets. Operating revenue less cost of sales.',
    glAccount: '4320',
    isBillingRun: false,
    ytdUsd: 34_760,
    targetUsd: 88_000,
  },
  {
    id: 'campfire',
    label: 'CAMPFIRE levies',
    shortCode: 'CAMP',
    category: 'natural-resources',
    description:
      'Wildlife quota fees and natural-resource royalties under the CAMPFIRE programme — ring-fenced per ward.',
    glAccount: '4400',
    isBillingRun: true,
    ytdUsd: 12_450,
    targetUsd: 36_000,
  },
  {
    id: 'refuse-sanitation',
    label: 'Refuse & sanitation',
    shortCode: 'REF',
    category: 'service-charges',
    description:
      'Monthly refuse collection and septic-tank draining charges by property class.',
    glAccount: '4210',
    isBillingRun: true,
    ytdUsd: 22_180,
    targetUsd: 54_000,
  },
  {
    id: 'water-sewer',
    label: 'Water & sewer',
    shortCode: 'WAT',
    category: 'service-charges',
    description:
      'Metered water consumption + sewer/reticulation charges for connected properties.',
    glAccount: '4220',
    isBillingRun: true,
    ytdUsd: 16_430,
    targetUsd: 42_000,
  },
  {
    id: 'hall-hire',
    label: 'Civic hall hire',
    shortCode: 'HALL',
    category: 'service-charges',
    description:
      'Civic centre and ward hall rental fees — weddings, conferences, workshops.',
    glAccount: '4330',
    isBillingRun: false,
    ytdUsd: 4_210,
    targetUsd: 12_000,
  },
  {
    id: 'cemetery',
    label: 'Cemetery fees',
    shortCode: 'CEM',
    category: 'service-charges',
    description: 'Burial plot allocation and grave digging fees.',
    glAccount: '4340',
    isBillingRun: false,
    ytdUsd: 3_120,
    targetUsd: 8_000,
  },
  {
    id: 'plan-fees',
    label: 'Plan approval fees',
    shortCode: 'PLAN',
    category: 'licences-and-permits',
    description: 'Building plans, subdivision, change of use and associated inspections.',
    glAccount: '4230',
    isBillingRun: false,
    ytdUsd: 7_890,
    targetUsd: 18_000,
  },
];

export const CATEGORY_LABEL: Record<RevenueSourceCategory, string> = {
  'rates-and-taxes':     'Rates & taxes',
  'licences-and-permits': 'Licences & permits',
  'service-charges':     'Service charges',
  'natural-resources':   'Natural resources',
  other:                 'Other',
};

export function findRevenueSource(id: RevenueSourceId): RevenueSource | undefined {
  return REVENUE_SOURCES.find((s) => s.id === id);
}

/** Total YTD across all sources — used on headline tiles. */
export function revenueYtdTotal(): number {
  return REVENUE_SOURCES.reduce((sum, s) => sum + s.ytdUsd, 0);
}

export function revenueTargetTotal(): number {
  return REVENUE_SOURCES.reduce((sum, s) => sum + s.targetUsd, 0);
}
