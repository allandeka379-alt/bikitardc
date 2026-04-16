// Ward-level budget fixture used by the landing
// Transparency section's Recharts bar chart.
export interface WardBudget {
  ward: string;
  collected: number;
  spent: number;
}

export const WARD_BUDGET: WardBudget[] = [
  { ward: 'Nyika',   collected: 68_200, spent: 52_100 },
  { ward: 'Mupani',  collected: 41_800, spent: 38_900 },
  { ward: 'Nhema',   collected: 54_600, spent: 44_300 },
  { ward: 'Bota',    collected: 29_400, spent: 21_050 },
  { ward: 'Chikuku', collected: 37_900, spent: 30_200 },
  { ward: 'Chikwanda', collected: 46_100, spent: 39_800 },
];
