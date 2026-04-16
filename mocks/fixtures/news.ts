// ─────────────────────────────────────────────
// News & public notices — spec §3.1 transparency
// ─────────────────────────────────────────────

export type NewsCategory = 'notice' | 'event' | 'alert' | 'update' | 'tender';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  date: string; // ISO
  ward?: string;
}

export const NEWS: NewsItem[] = [
  {
    id: 'n_2026_04_10',
    title: 'Q1 2026 budget performance report published',
    summary:
      'Our first-quarter collections reached 68% of target. Detailed breakdowns by ward are now available.',
    category: 'update',
    date: '2026-04-14T09:00:00Z',
  },
  {
    id: 'n_2026_04_08',
    title: 'Ordinary council meeting — Thursday 18 April',
    summary:
      'Agenda includes Q1 revenue report, Nyika borehole rehabilitation and rates review.',
    category: 'event',
    date: '2026-04-08T12:00:00Z',
  },
  {
    id: 'n_2026_04_05',
    title: 'Rates clearance fast-track: 3-day turnaround',
    summary:
      'Residents with fully settled accounts can now receive clearance certificates in 3 working days.',
    category: 'notice',
    date: '2026-04-05T08:00:00Z',
  },
  {
    id: 'n_2026_04_02',
    title: 'Tender: Rehabilitation of Nyika–Mupani road',
    summary:
      'Sealed bids invited for 14km road rehabilitation. Closing date 30 April 2026.',
    category: 'tender',
    date: '2026-04-02T10:00:00Z',
    ward: 'Nyika',
  },
  {
    id: 'n_2026_03_28',
    title: 'Water advisory — Mupani Ward',
    summary:
      'Planned maintenance on 5 April 2026 will interrupt supply from 06:00 to 14:00.',
    category: 'alert',
    date: '2026-03-28T16:30:00Z',
    ward: 'Mupani',
  },
];
