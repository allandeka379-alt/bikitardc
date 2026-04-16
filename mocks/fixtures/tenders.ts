// Seed tenders — spec §3.1 transparency
export interface Tender {
  id: string;
  title: string;
  reference: string;
  closingDate: string; // ISO
  estimatedValueUsd: number;
  status: 'open' | 'closed' | 'awarded';
}

export const TENDERS: Tender[] = [
  {
    id: 't_nyika_road',
    title: 'Rehabilitation of Nyika–Mupani road',
    reference: 'BRDC/2026/T/001',
    closingDate: '2026-04-30T12:00:00Z',
    estimatedValueUsd: 148_000,
    status: 'open',
  },
  {
    id: 't_borehole_mupani',
    title: 'Drilling of 4 community boreholes — Mupani Ward',
    reference: 'BRDC/2026/T/002',
    closingDate: '2026-05-12T12:00:00Z',
    estimatedValueUsd: 32_500,
    status: 'open',
  },
  {
    id: 't_solar_clinics',
    title: 'Solar power installation for 3 rural health facilities',
    reference: 'BRDC/2026/T/003',
    closingDate: '2026-05-20T12:00:00Z',
    estimatedValueUsd: 78_200,
    status: 'open',
  },
];
