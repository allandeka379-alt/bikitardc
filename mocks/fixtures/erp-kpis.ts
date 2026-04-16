// ERP dashboard KPI history.
//
// Each KPI gets a 14-day sparkline used by the
// dashboard tiles + monthly revenue by source used
// by the main chart.

export interface KpiSpark {
  id: string;
  label: string;
  /** Current value for display. */
  value: number;
  /** Plus/minus delta vs previous period, as a percentage. */
  deltaPct: number;
  /** 14 numeric points for the sparkline. */
  series: number[];
  /** Sub-label — appears under the big number. */
  sublabel: string;
  kind: 'currency' | 'count';
}

export const TODAYS_KPIS: KpiSpark[] = [
  {
    id: 'collections-today',
    label: "Today's collections",
    value: 2145.5, // Journey C step 2 — the exact figure
    deltaPct: 8.4,
    series: [1420, 1610, 1780, 1330, 1205, 1580, 1990, 2100, 1860, 1742, 2050, 1985, 2280, 2145.5],
    sublabel: 'vs $1 980 yesterday',
    kind: 'currency',
  },
  {
    id: 'open-tickets',
    label: 'Open tickets',
    value: 18,
    deltaPct: -6.2,
    series: [22, 21, 24, 23, 25, 22, 20, 21, 19, 20, 19, 20, 19, 18],
    sublabel: '3 breached SLA',
    kind: 'count',
  },
  {
    id: 'pending-verifications',
    label: 'Pending verifications',
    value: 3,
    deltaPct: 50,
    series: [0, 1, 1, 0, 2, 2, 1, 2, 2, 3, 2, 3, 2, 3],
    sublabel: 'Oldest: 4 days',
    kind: 'count',
  },
  {
    id: 'collection-rate',
    label: 'Collection rate (MTD)',
    value: 71.2,
    deltaPct: 2.1,
    series: [63, 64, 65, 66, 67, 67, 68, 69, 70, 69, 70, 71, 71, 71.2],
    sublabel: 'Target 75%',
    kind: 'count',
  },
];

export interface RevenueBySource {
  label: string;
  amount: number;
}

export const REVENUE_BY_SOURCE: RevenueBySource[] = [
  { label: 'Property rates',  amount: 38_420 },
  { label: 'Business licence', amount: 12_600 },
  { label: 'Unit tax',        amount:  8_850 },
  { label: 'Development levy', amount:  6_420 },
  { label: 'Refuse',          amount:  4_280 },
  { label: 'Market & stalls', amount:  2_110 },
];

export interface MonthlyCollection {
  month: string;
  collected: number;
  target: number;
}

/** Last 12 months collected vs target — main chart on ERP dashboard. */
export const MONTHLY_COLLECTIONS: MonthlyCollection[] = [
  { month: 'May',  collected:  52_100, target: 60_000 },
  { month: 'Jun',  collected:  58_400, target: 62_000 },
  { month: 'Jul',  collected:  61_900, target: 64_000 },
  { month: 'Aug',  collected:  57_200, target: 65_000 },
  { month: 'Sep',  collected:  64_800, target: 66_000 },
  { month: 'Oct',  collected:  69_100, target: 68_000 },
  { month: 'Nov',  collected:  71_500, target: 70_000 },
  { month: 'Dec',  collected:  66_200, target: 72_000 },
  { month: 'Jan',  collected:  74_800, target: 74_000 },
  { month: 'Feb',  collected:  81_200, target: 76_000 },
  { month: 'Mar',  collected:  83_600, target: 78_000 },
  { month: 'Apr',  collected:  54_320, target: 80_000 }, // month in progress
];

export interface AgeingBucket {
  bucket: '0-30 days' | '31-60 days' | '61-90 days' | '90+ days';
  amount: number;
  count: number;
}

export const AGEING_DEBTORS: AgeingBucket[] = [
  { bucket: '0-30 days',   amount:  42_300, count: 156 },
  { bucket: '31-60 days',  amount:  28_900, count:  94 },
  { bucket: '61-90 days',  amount:  19_400, count:  62 },
  { bucket: '90+ days',    amount:  34_250, count:  38 },
];
