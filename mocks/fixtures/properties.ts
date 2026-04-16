// ─────────────────────────────────────────────
// Properties fixture (spec §9.1)
// 6 properties across 4 wards, mix of residential,
// commercial, agricultural.
//
// Tendai Moyo owns 2 properties — the first one
// (stand 4521, Nyika ward) MUST carry the $87.50
// outstanding balance called out in Journey A
// (spec §7.1) because the demo walks a reviewer
// through that exact figure.
// ─────────────────────────────────────────────

export type PropertyClass = 'residential' | 'commercial' | 'agricultural';
export type BalanceTier = 'clear' | 'due-soon' | 'overdue';

export interface Property {
  id: string;
  stand: string;
  ownerId: string;
  ownerName: string;
  ward: string;
  address: string;
  classKind: PropertyClass;
  areaSqm: number;
  balanceUsd: number;
  lastPaymentAt: string | null;
  nextDueAt: string;
  ytdPaid: number;
  ytdBilled: number;
}

/** Balance tier derived from amount + due date — used for colour coding. */
export function tierOf(p: Property, now: Date = new Date()): BalanceTier {
  if (p.balanceUsd <= 0) return 'clear';
  const due = new Date(p.nextDueAt);
  if (due.getTime() < now.getTime()) return 'overdue';
  return 'due-soon';
}

export const PROPERTIES: Property[] = [
  {
    id: 'p_4521',
    stand: 'Stand 4521',
    ownerId: 'u_tendai',
    ownerName: 'Tendai Moyo',
    ward: 'Nyika',
    address: 'Stand 4521, Nyika Township',
    classKind: 'residential',
    areaSqm: 1_050,
    balanceUsd: 87.5, // ← locked by spec §7.1 Journey A
    lastPaymentAt: '2026-01-14T10:22:00Z',
    nextDueAt: '2026-04-30T23:59:59Z',
    ytdPaid: 260,
    ytdBilled: 347.5,
  },
  {
    id: 'p_2210',
    stand: 'Stand 2210',
    ownerId: 'u_tendai',
    ownerName: 'Tendai Moyo',
    ward: 'Mupani',
    address: 'Stand 2210, Mupani Business Park',
    classKind: 'commercial',
    areaSqm: 620,
    balanceUsd: 0,
    lastPaymentAt: '2026-03-28T14:05:00Z',
    nextDueAt: '2026-05-15T23:59:59Z',
    ytdPaid: 540,
    ytdBilled: 540,
  },
  {
    id: 'p_6802',
    stand: 'Stand 6802',
    ownerId: 'u_other_1',
    ownerName: 'Rudo Sibanda',
    ward: 'Nhema',
    address: 'Stand 6802, Nhema Road',
    classKind: 'residential',
    areaSqm: 890,
    balanceUsd: 142.3,
    lastPaymentAt: '2025-12-02T09:30:00Z',
    nextDueAt: '2026-03-31T23:59:59Z',
    ytdPaid: 48,
    ytdBilled: 190.3,
  },
  {
    id: 'p_9044',
    stand: 'Stand 9044',
    ownerId: 'u_other_2',
    ownerName: 'Kudzai Nyatanga',
    ward: 'Bota',
    address: 'Farm 9044, Bota South',
    classKind: 'agricultural',
    areaSqm: 48_000,
    balanceUsd: 315,
    lastPaymentAt: '2025-09-11T11:15:00Z',
    nextDueAt: '2026-02-28T23:59:59Z',
    ytdPaid: 180,
    ytdBilled: 495,
  },
  {
    id: 'p_1177',
    stand: 'Stand 1177',
    ownerId: 'u_other_3',
    ownerName: 'Farai Murwisi',
    ward: 'Nyika',
    address: 'Stand 1177, Nyika Township',
    classKind: 'residential',
    areaSqm: 720,
    balanceUsd: 0,
    lastPaymentAt: '2026-04-05T08:47:00Z',
    nextDueAt: '2026-05-31T23:59:59Z',
    ytdPaid: 220,
    ytdBilled: 220,
  },
  {
    id: 'p_3050',
    stand: 'Stand 3050',
    ownerId: 'u_other_4',
    ownerName: 'Privilege Shop (Pvt) Ltd',
    ward: 'Mupani',
    address: 'Shop 3050, Mupani High Street',
    classKind: 'commercial',
    areaSqm: 180,
    balanceUsd: 62.4,
    lastPaymentAt: '2026-02-20T16:10:00Z',
    nextDueAt: '2026-04-15T23:59:59Z',
    ytdPaid: 420,
    ytdBilled: 482.4,
  },
];

export function findProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

export function propertiesForOwner(ownerId: string): Property[] {
  return PROPERTIES.filter((p) => p.ownerId === ownerId);
}
