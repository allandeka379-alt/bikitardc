// ─────────────────────────────────────────────
// Council-run beer hall outlets. Tracks monthly
// operating revenue, cost of sales and net margin.
//
// Feeds:
//   • /erp/finance/beer-hall
//   • Beer hall contribution on the revenue
//     dashboard
// ─────────────────────────────────────────────

export interface BeerHallOutlet {
  id: string;
  name: string;
  ward: string;
  manager: string;
  /** Last-closed month. */
  periodMonth: string; // "2026-03"
  revenueUsd: number;
  costOfSalesUsd: number;
  staffUsd: number;
  /** License expiry for the liquor licence. */
  liquorExpiry: string; // ISO date
  status: 'trading' | 'closed' | 'under-review';
}

export const BEER_HALLS: BeerHallOutlet[] = [
  {
    id: 'b_mupani',
    name: 'Mupani Beer Hall',
    ward: 'Mupani',
    manager: 'Tichaona Ngwena',
    periodMonth: '2026-03',
    revenueUsd: 14_820,
    costOfSalesUsd: 9_160,
    staffUsd: 1_480,
    liquorExpiry: '2026-12-31',
    status: 'trading',
  },
  {
    id: 'b_bota',
    name: 'Bota Community Tavern',
    ward: 'Bota',
    manager: 'Farai Mutasa',
    periodMonth: '2026-03',
    revenueUsd: 8_940,
    costOfSalesUsd: 5_680,
    staffUsd: 1_120,
    liquorExpiry: '2026-09-30',
    status: 'trading',
  },
  {
    id: 'b_silveira',
    name: 'Silveira Council Tavern',
    ward: 'Silveira',
    manager: 'Lovemore Chinyani',
    periodMonth: '2026-03',
    revenueUsd: 11_000,
    costOfSalesUsd: 7_220,
    staffUsd: 1_320,
    liquorExpiry: '2026-06-30',
    status: 'under-review',
  },
];

export function beerHallNetMargin(b: BeerHallOutlet): number {
  return b.revenueUsd - b.costOfSalesUsd - b.staffUsd;
}
