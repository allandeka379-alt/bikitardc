// ─────────────────────────────────────────────
// Market stall register — every council-managed
// market stall across the district with the holder,
// trade type, fee tier and current balance.
//
// Feeds:
//   • /erp/finance/market-fees  — stall register
//   • Billing runs of kind market-fees
//   • Monthly market fee statements
// ─────────────────────────────────────────────

export type MarketStallStatus = 'occupied' | 'vacant' | 'suspended';
export type MarketStallTier = 'daily' | 'weekly' | 'monthly';

export interface MarketStall {
  id: string;
  code: string;              // e.g. "MUP-A-014"
  marketName: string;        // e.g. "Mupani Main Market"
  ward: string;
  bay: string;               // stall bay / block
  trade: string;             // fruit & veg / butcher / grain / clothing / hardware
  holderName: string | null; // null when vacant
  holderPhone: string | null;
  feeUsd: number;            // per-period fee
  tier: MarketStallTier;
  status: MarketStallStatus;
  /** Outstanding balance at last billing close. */
  balanceUsd: number;
  /** ISO date of last paid invoice. */
  lastPaidAt: string | null;
}

export const MARKET_STALLS: MarketStall[] = [
  // Mupani Main Market — A block (fresh produce)
  { id: 'm_mup_a001', code: 'MUP-A-001', marketName: 'Mupani Main Market', ward: 'Mupani', bay: 'A-001', trade: 'Fruit & veg',   holderName: 'Memory Chauke',   holderPhone: '+263 77 111 2301', feeUsd: 12, tier: 'monthly', status: 'occupied', balanceUsd: 0,    lastPaidAt: '2026-04-02' },
  { id: 'm_mup_a002', code: 'MUP-A-002', marketName: 'Mupani Main Market', ward: 'Mupani', bay: 'A-002', trade: 'Fruit & veg',   holderName: 'Tatenda Moyo',    holderPhone: '+263 77 111 2302', feeUsd: 12, tier: 'monthly', status: 'occupied', balanceUsd: 24,   lastPaidAt: '2026-02-12' },
  { id: 'm_mup_a003', code: 'MUP-A-003', marketName: 'Mupani Main Market', ward: 'Mupani', bay: 'A-003', trade: 'Fruit & veg',   holderName: 'Ruvimbo Sibanda', holderPhone: '+263 77 111 2303', feeUsd: 12, tier: 'monthly', status: 'occupied', balanceUsd: 12,   lastPaidAt: '2026-03-04' },
  { id: 'm_mup_a004', code: 'MUP-A-004', marketName: 'Mupani Main Market', ward: 'Mupani', bay: 'A-004', trade: 'Fruit & veg',   holderName: null,              holderPhone: null,                feeUsd: 12, tier: 'monthly', status: 'vacant',   balanceUsd: 0,    lastPaidAt: null },

  // Mupani — B block (butchery / cooked food)
  { id: 'm_mup_b001', code: 'MUP-B-001', marketName: 'Mupani Main Market', ward: 'Mupani', bay: 'B-001', trade: 'Butchery',      holderName: 'Gift Makoni',     holderPhone: '+263 77 111 2401', feeUsd: 28, tier: 'monthly', status: 'occupied', balanceUsd: 0,    lastPaidAt: '2026-04-01' },
  { id: 'm_mup_b002', code: 'MUP-B-002', marketName: 'Mupani Main Market', ward: 'Mupani', bay: 'B-002', trade: 'Cooked food',   holderName: 'Rumbi Dube',      holderPhone: '+263 77 111 2402', feeUsd: 22, tier: 'monthly', status: 'occupied', balanceUsd: 44,   lastPaidAt: '2026-02-04' },

  // Nyika flea market — daily stalls
  { id: 'm_nyi_d001', code: 'NYI-D-001', marketName: 'Nyika Flea Market', ward: 'Nyika',   bay: 'D-01',  trade: 'Clothing',      holderName: 'Patience Ndlovu', holderPhone: '+263 77 222 1101', feeUsd:  2, tier: 'daily',   status: 'occupied', balanceUsd: 0,    lastPaidAt: '2026-04-15' },
  { id: 'm_nyi_d002', code: 'NYI-D-002', marketName: 'Nyika Flea Market', ward: 'Nyika',   bay: 'D-02',  trade: 'Shoes',         holderName: 'Wellington Moyo', holderPhone: '+263 77 222 1102', feeUsd:  2, tier: 'daily',   status: 'occupied', balanceUsd: 0,    lastPaidAt: '2026-04-15' },
  { id: 'm_nyi_d003', code: 'NYI-D-003', marketName: 'Nyika Flea Market', ward: 'Nyika',   bay: 'D-03',  trade: 'Electronics',   holderName: 'Tinashe Zondo',   holderPhone: '+263 77 222 1103', feeUsd:  2, tier: 'daily',   status: 'suspended', balanceUsd: 18, lastPaidAt: '2026-03-20' },
  { id: 'm_nyi_d004', code: 'NYI-D-004', marketName: 'Nyika Flea Market', ward: 'Nyika',   bay: 'D-04',  trade: 'Groceries',     holderName: null,              holderPhone: null,                feeUsd:  2, tier: 'daily',   status: 'vacant',   balanceUsd: 0,  lastPaidAt: null },

  // Nhema farmers' market — weekly stalls
  { id: 'm_nhe_w001', code: 'NHE-W-001', marketName: 'Nhema Farmers Market', ward: 'Nhema', bay: 'W-01', trade: 'Grain',          holderName: 'Chipo Hwata',     holderPhone: '+263 77 333 0101', feeUsd:  8, tier: 'weekly',  status: 'occupied', balanceUsd: 0,    lastPaidAt: '2026-04-13' },
  { id: 'm_nhe_w002', code: 'NHE-W-002', marketName: 'Nhema Farmers Market', ward: 'Nhema', bay: 'W-02', trade: 'Livestock feed', holderName: 'Noah Chikwava',   holderPhone: '+263 77 333 0102', feeUsd:  8, tier: 'weekly',  status: 'occupied', balanceUsd: 16,   lastPaidAt: '2026-03-16' },
  { id: 'm_nhe_w003', code: 'NHE-W-003', marketName: 'Nhema Farmers Market', ward: 'Nhema', bay: 'W-03', trade: 'Seeds',          holderName: 'Anna Sithole',    holderPhone: '+263 77 333 0103', feeUsd:  8, tier: 'weekly',  status: 'occupied', balanceUsd: 0,    lastPaidAt: '2026-04-13' },
];

export function stallsByMarket(): Record<string, MarketStall[]> {
  const out: Record<string, MarketStall[]> = {};
  for (const s of MARKET_STALLS) {
    (out[s.marketName] ||= []).push(s);
  }
  return out;
}

export function totalMarketArrears(): number {
  return MARKET_STALLS.reduce((sum, s) => sum + s.balanceUsd, 0);
}
