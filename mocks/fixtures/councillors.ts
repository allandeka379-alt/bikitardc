// ─────────────────────────────────────────────
// Councillors & council executive
//
// Spec §3.1: "Ward councillor & office contacts" —
// Demo — Full. Seeded across all 6 Bikita wards
// plus the council executive.
// ─────────────────────────────────────────────

export type CouncillorRole = 'ward-councillor' | 'chairperson' | 'vice-chair' | 'ceo' | 'deputy-ceo' | 'committee-chair';

export interface Councillor {
  id: string;
  fullName: string;
  role: CouncillorRole;
  title: string; // "Cllr. T. Muchena"
  wardId?: string; // set for ward-councillor
  wardName?: string;
  committee?: string;
  phone: string;
  email: string;
  surgeryDay?: string; // e.g. "Every Thursday, Bikita Hall"
  photoUrl?: string;
  bio: string;
  tenureStart: string; // ISO
}

export const COUNCILLORS: Councillor[] = [
  {
    id: 'c_chair',
    fullName: 'Gift Chinyama',
    title: 'Cllr. G. Chinyama',
    role: 'chairperson',
    phone: '+263 39 2 110 001',
    email: 'chair@bikita.gov.zw',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=75&auto=format&fit=crop',
    bio: 'Council chairperson since 2023. Oversees full-council sittings, committee coordination and the annual budget process.',
    tenureStart: '2023-08-15',
  },
  {
    id: 'c_vice',
    fullName: 'Violet Masiyiwa',
    title: 'Cllr. V. Masiyiwa',
    role: 'vice-chair',
    phone: '+263 39 2 110 002',
    email: 'vice@bikita.gov.zw',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=75&auto=format&fit=crop',
    bio: 'Vice-chair with lead on rural development and infrastructure. Sits on the Finance & Works committees.',
    tenureStart: '2023-08-15',
    committee: 'Works & Infrastructure',
  },
  {
    id: 'c_ceo',
    fullName: 'Kudakwashe Nyathi',
    title: 'Mr K. Nyathi',
    role: 'ceo',
    phone: '+263 39 2 110 010',
    email: 'ceo@bikita.gov.zw',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=75&auto=format&fit=crop',
    bio: 'Chief Executive Officer. Responsible for day-to-day administration, revenue and service delivery.',
    tenureStart: '2022-04-01',
  },
  {
    id: 'c_dceo',
    fullName: 'Nyarai Gwezhe',
    title: 'Ms N. Gwezhe',
    role: 'deputy-ceo',
    phone: '+263 39 2 110 011',
    email: 'deputy.ceo@bikita.gov.zw',
    bio: 'Deputy CEO with oversight of HR, records management and public engagement.',
    tenureStart: '2023-01-10',
  },
  // Ward councillors
  {
    id: 'c_nyika',
    fullName: 'Tawanda Muchena',
    title: 'Cllr. T. Muchena',
    role: 'ward-councillor',
    wardId: 'w_nyika',
    wardName: 'Nyika',
    phone: '+263 77 120 1001',
    email: 'nyika@bikita.gov.zw',
    surgeryDay: 'Every Thursday 14:00–16:00, Nyika Community Hall',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=75&auto=format&fit=crop',
    bio: 'Serving Nyika Ward since 2018. Focus areas: water reticulation, rural roads, education block renovations.',
    tenureStart: '2018-09-01',
  },
  {
    id: 'c_mupani',
    fullName: 'Rutendo Chari',
    title: 'Cllr. R. Chari',
    role: 'ward-councillor',
    wardId: 'w_mupani',
    wardName: 'Mupani',
    phone: '+263 77 120 1002',
    email: 'mupani@bikita.gov.zw',
    surgeryDay: 'Every Tuesday 10:00–12:00, Mupani Business Centre',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=75&auto=format&fit=crop',
    bio: 'Mupani Ward since 2023. Leads on commercial by-laws, market stall allocations, youth programmes.',
    tenureStart: '2023-08-27',
  },
  {
    id: 'c_nhema',
    fullName: 'Grace Makore',
    title: 'Cllr. G. Makore',
    role: 'ward-councillor',
    wardId: 'w_nhema',
    wardName: 'Nhema',
    phone: '+263 77 120 1003',
    email: 'nhema@bikita.gov.zw',
    surgeryDay: 'Every Friday 09:00–11:00, Nhema Clinic',
    bio: 'Nhema Ward since 2018. Advocates on primary healthcare access and school feeding programmes.',
    tenureStart: '2018-09-01',
  },
  {
    id: 'c_bota',
    fullName: 'Simbarashe Mugari',
    title: 'Cllr. S. Mugari',
    role: 'ward-councillor',
    wardId: 'w_bota',
    wardName: 'Bota',
    phone: '+263 77 120 1004',
    email: 'bota@bikita.gov.zw',
    surgeryDay: 'Every Wednesday 13:00–15:00, Bota South Hall',
    bio: 'Bota Ward since 2013. Long-standing advocate for rural water and irrigation schemes.',
    tenureStart: '2013-08-01',
  },
  {
    id: 'c_chikuku',
    fullName: 'Privilege Zvomuya',
    title: 'Cllr. P. Zvomuya',
    role: 'ward-councillor',
    wardId: 'w_chikuku',
    wardName: 'Chikuku',
    phone: '+263 77 120 1005',
    email: 'chikuku@bikita.gov.zw',
    surgeryDay: 'Every Monday 10:00–12:00, Chikuku Service Centre',
    bio: 'Chikuku Ward since 2023. Portfolio interests: refuse collection, drainage, streetlighting.',
    tenureStart: '2023-08-27',
  },
  {
    id: 'c_chikwanda',
    fullName: 'Brian Takaindisa',
    title: 'Cllr. B. Takaindisa',
    role: 'ward-councillor',
    wardId: 'w_chikwanda',
    wardName: 'Chikwanda',
    phone: '+263 77 120 1006',
    email: 'chikwanda@bikita.gov.zw',
    surgeryDay: 'Every Thursday 10:00–12:00, Chikwanda Council Office',
    bio: 'Chikwanda Ward since 2018. Priorities: cholera-prevention infrastructure and rural electrification.',
    tenureStart: '2018-09-01',
  },
];

export const ROLE_LABEL: Record<CouncillorRole, string> = {
  chairperson: 'Chairperson',
  'vice-chair': 'Vice-chairperson',
  'committee-chair': 'Committee Chair',
  ceo: 'Chief Executive Officer',
  'deputy-ceo': 'Deputy CEO',
  'ward-councillor': 'Ward Councillor',
};

export function councillorsByWard(wardId: string): Councillor[] {
  return COUNCILLORS.filter((c) => c.wardId === wardId);
}

export function executiveCouncillors(): Councillor[] {
  return COUNCILLORS.filter((c) => c.role !== 'ward-councillor');
}

export function wardCouncillors(): Councillor[] {
  return COUNCILLORS.filter((c) => c.role === 'ward-councillor');
}
