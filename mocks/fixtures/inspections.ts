// Inspection scheduler fixture (spec §3.2
// "Inspection scheduling & assignment" Demo-Visual).

export type InspectionKind = 'building-plan' | 'business-licence' | 'health' | 'environment';
export type InspectionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Inspection {
  id: string;
  reference: string;
  kind: InspectionKind;
  title: string;
  applicationRef?: string;
  address: string;
  ward: string;
  officer: string;
  scheduledAt: string; // ISO
  durationMinutes: number;
  status: InspectionStatus;
  outcomeNote?: string;
}

export const INSPECTION_LABEL: Record<InspectionKind, string> = {
  'building-plan':    'Building plan',
  'business-licence': 'Business licence',
  health:             'Health & safety',
  environment:        'Environmental',
};

export const INSPECTION_TONE: Record<
  InspectionKind,
  { bg: string; text: string }
> = {
  'building-plan':    { bg: 'bg-warning/10',        text: 'text-warning' },
  'business-licence': { bg: 'bg-brand-accent/15',   text: 'text-[#8a6e13]' },
  health:             { bg: 'bg-success/10',        text: 'text-success' },
  environment:        { bg: 'bg-info/10',           text: 'text-info' },
};

// Generate a week-ish of seeded inspections relative to today
function daysFromNow(offset: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const INSPECTIONS: Inspection[] = [
  {
    id: 'ins_0001',
    reference: 'INS-2026-0121',
    kind: 'business-licence',
    title: 'Moyo General Dealers — premises check',
    applicationRef: 'BL-2026-0031',
    address: 'Stand 2210, Mupani Business Park',
    ward: 'Mupani',
    officer: 'Chipo Ndlovu',
    scheduledAt: daysFromNow(1, 9, 30),
    durationMinutes: 60,
    status: 'scheduled',
  },
  {
    id: 'ins_0002',
    reference: 'INS-2026-0122',
    kind: 'building-plan',
    title: 'Nhema warehouse extension — foundation',
    applicationRef: 'BP-2026-0122',
    address: 'Plot 88, Nhema Road',
    ward: 'Nhema',
    officer: 'Garikai Musara',
    scheduledAt: daysFromNow(2, 11, 0),
    durationMinutes: 90,
    status: 'scheduled',
  },
  {
    id: 'ins_0003',
    reference: 'INS-2026-0123',
    kind: 'health',
    title: 'Chikuku clinic water quality sampling',
    address: 'Chikuku Service Centre',
    ward: 'Chikuku',
    officer: 'Sr N. Takaindisa',
    scheduledAt: daysFromNow(2, 14, 0),
    durationMinutes: 45,
    status: 'scheduled',
  },
  {
    id: 'ins_0004',
    reference: 'INS-2026-0124',
    kind: 'business-licence',
    title: 'Privilege Shop — transfer verification',
    applicationRef: 'BL-2026-0032',
    address: 'Shop 3050, Mupani High Street',
    ward: 'Mupani',
    officer: 'Chipo Ndlovu',
    scheduledAt: daysFromNow(3, 10, 0),
    durationMinutes: 45,
    status: 'scheduled',
  },
  {
    id: 'ins_0005',
    reference: 'INS-2026-0125',
    kind: 'environment',
    title: 'Bota illegal dumping follow-up',
    address: 'Farm 9044, Bota South',
    ward: 'Bota',
    officer: 'Mrs R. Chari',
    scheduledAt: daysFromNow(4, 8, 30),
    durationMinutes: 60,
    status: 'scheduled',
  },
  {
    id: 'ins_0006',
    reference: 'INS-2026-0126',
    kind: 'building-plan',
    title: 'Bota farmhouse expansion — roof level',
    applicationRef: 'BP-2026-0130',
    address: 'Farm 9044, Bota South',
    ward: 'Bota',
    officer: 'Garikai Musara',
    scheduledAt: daysFromNow(5, 11, 0),
    durationMinutes: 75,
    status: 'scheduled',
  },
  {
    id: 'ins_0007',
    reference: 'INS-2026-0127',
    kind: 'health',
    title: 'Nyika Primary — pit latrine safety',
    address: 'Nyika Primary School',
    ward: 'Nyika',
    officer: 'Sr N. Takaindisa',
    scheduledAt: daysFromNow(6, 9, 0),
    durationMinutes: 45,
    status: 'scheduled',
  },
  // A completed one for history
  {
    id: 'ins_0008',
    reference: 'INS-2026-0119',
    kind: 'business-licence',
    title: 'Chikuku Bar & Grill — renewal check',
    applicationRef: 'LL-2026-0012',
    address: 'Chikuku main road',
    ward: 'Chikuku',
    officer: 'Chipo Ndlovu',
    scheduledAt: daysFromNow(-3, 10, 0),
    durationMinutes: 60,
    status: 'completed',
    outcomeNote: 'All clear. Renewal recommended.',
  },
];

export function upcomingInspections(now: Date = new Date()): Inspection[] {
  return INSPECTIONS.filter(
    (i) => i.status === 'scheduled' && new Date(i.scheduledAt) >= now,
  ).sort((a, b) => (a.scheduledAt < b.scheduledAt ? -1 : 1));
}

export function pastInspections(now: Date = new Date()): Inspection[] {
  return INSPECTIONS.filter(
    (i) => i.status !== 'scheduled' || new Date(i.scheduledAt) < now,
  ).sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
}

/** Groups a list by YYYY-MM-DD. Preserves order. */
export function groupByDay(list: Inspection[]): { day: string; items: Inspection[] }[] {
  const map = new Map<string, Inspection[]>();
  for (const i of list) {
    const key = i.scheduledAt.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(i);
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
}
