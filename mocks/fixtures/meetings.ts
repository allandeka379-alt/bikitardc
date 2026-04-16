// Council meeting calendar — spec §3.1 "Council
// meeting calendar" Demo-Full, "Agenda (before) +
// minutes (after)" Demo-Visual.

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
export type MeetingKind = 'full-council' | 'committee' | 'special' | 'public-hearing';

export interface MeetingAgendaItem {
  order: number;
  title: string;
  presenter?: string;
  /** In minutes. */
  duration?: number;
  doc?: { label: string };
}

export interface Meeting {
  id: string;
  reference: string;
  title: string;
  kind: MeetingKind;
  status: MeetingStatus;
  startAt: string; // ISO
  endAt: string; // ISO
  venue: string;
  chair: string;
  attendeesExpected: number;
  isPublic: boolean;
  agenda: MeetingAgendaItem[];
  minutesPublished: boolean;
  summary: string;
}

export const MEETINGS: Meeting[] = [
  {
    id: 'm_2026_04_18',
    reference: 'BRDC/M/2026/04/FC',
    title: 'Ordinary council meeting — April 2026',
    kind: 'full-council',
    status: 'scheduled',
    startAt: '2026-04-18T09:00:00Z',
    endAt: '2026-04-18T14:00:00Z',
    venue: 'Bikita Main Council Chamber',
    chair: 'Cllr. G. Chinyama',
    attendeesExpected: 24,
    isPublic: true,
    minutesPublished: false,
    summary:
      'Full-council sitting covering Q1 revenue performance, the Nyika borehole rehabilitation tender outcomes, and a proposed 2% rates review.',
    agenda: [
      { order: 1, title: 'Apologies & adoption of previous minutes',        presenter: 'Cllr. V. Masiyiwa',   duration: 15 },
      { order: 2, title: 'Q1 2026 revenue performance report',              presenter: 'Mr K. Nyathi (CEO)', duration: 45, doc: { label: 'Q1 performance pack (PDF)' } },
      { order: 3, title: 'Nyika–Mupani road rehabilitation tender update',  presenter: 'Cllr. T. Muchena',    duration: 30 },
      { order: 4, title: 'Tabling of proposed 2% rates review',             presenter: 'Finance Committee',   duration: 45, doc: { label: 'Rates review schedule' } },
      { order: 5, title: 'Service requests — breached SLAs',                presenter: 'Ops Manager',         duration: 20 },
      { order: 6, title: 'Public question time',                            duration: 30 },
      { order: 7, title: 'Any other business & closing',                    duration: 15 },
    ],
  },
  {
    id: 'm_2026_04_22',
    reference: 'BRDC/M/2026/04/FN',
    title: 'Finance committee — April',
    kind: 'committee',
    status: 'scheduled',
    startAt: '2026-04-22T10:00:00Z',
    endAt: '2026-04-22T12:30:00Z',
    venue: 'Committee Room 2',
    chair: 'Cllr. V. Masiyiwa',
    attendeesExpected: 8,
    isPublic: false,
    minutesPublished: false,
    summary: 'Review of April reconciliation exceptions, rate card adjustments, and write-off recommendations.',
    agenda: [
      { order: 1, title: 'Reconciliation exceptions — April',   presenter: 'Revenue Officer',  duration: 30 },
      { order: 2, title: 'Rate card proposal — 2026 H2',        presenter: 'Finance Dept',     duration: 45 },
      { order: 3, title: 'Write-off schedule — quarterly',      presenter: 'Finance Dept',     duration: 45 },
    ],
  },
  {
    id: 'm_2026_04_26',
    reference: 'BRDC/M/2026/04/PH',
    title: 'Public hearing — Mupani market by-laws',
    kind: 'public-hearing',
    status: 'scheduled',
    startAt: '2026-04-26T14:00:00Z',
    endAt: '2026-04-26T16:00:00Z',
    venue: 'Mupani Community Hall',
    chair: 'Cllr. R. Chari',
    attendeesExpected: 60,
    isPublic: true,
    minutesPublished: false,
    summary:
      'Open public hearing on proposed amendments to the Mupani market by-laws — stall tariffs, opening hours and sanitation fees.',
    agenda: [
      { order: 1, title: 'Introduction & procedural note', presenter: 'Ward councillor', duration: 15 },
      { order: 2, title: 'Proposed amendments walkthrough', presenter: 'Legal officer',    duration: 45 },
      { order: 3, title: 'Public submissions',              duration: 60 },
    ],
  },
  {
    id: 'm_2026_03_21',
    reference: 'BRDC/M/2026/03/FC',
    title: 'Ordinary council meeting — March 2026',
    kind: 'full-council',
    status: 'completed',
    startAt: '2026-03-21T09:00:00Z',
    endAt: '2026-03-21T13:40:00Z',
    venue: 'Bikita Main Council Chamber',
    chair: 'Cllr. G. Chinyama',
    attendeesExpected: 24,
    isPublic: true,
    minutesPublished: true,
    summary:
      'March full-council: adopted Q4 2025 accounts; approved procurement plan for 4 Mupani boreholes; noted service-request SLA improvements.',
    agenda: [
      { order: 1, title: 'Apologies & adoption of previous minutes', duration: 10 },
      { order: 2, title: 'Q4 2025 accounts adoption',                duration: 45 },
      { order: 3, title: 'Procurement plan — Mupani boreholes',      duration: 40 },
      { order: 4, title: 'Service request performance',              duration: 25 },
      { order: 5, title: 'Any other business',                       duration: 10 },
    ],
  },
  {
    id: 'm_2026_02_14',
    reference: 'BRDC/M/2026/02/FC',
    title: 'Ordinary council meeting — February 2026',
    kind: 'full-council',
    status: 'completed',
    startAt: '2026-02-14T09:00:00Z',
    endAt: '2026-02-14T13:15:00Z',
    venue: 'Bikita Main Council Chamber',
    chair: 'Cllr. G. Chinyama',
    attendeesExpected: 24,
    isPublic: true,
    minutesPublished: true,
    summary:
      'Adopted the 2026 capital budget. Approved 3 tenders. Discussed Chikuku refuse zoning.',
    agenda: [],
  },
];

export function upcomingMeetings(now: Date = new Date()): Meeting[] {
  return MEETINGS.filter(
    (m) => m.status === 'scheduled' && new Date(m.startAt) >= now,
  ).sort((a, b) => (a.startAt < b.startAt ? -1 : 1));
}

export function pastMeetings(now: Date = new Date()): Meeting[] {
  return MEETINGS.filter(
    (m) => m.status !== 'scheduled' || new Date(m.startAt) < now,
  ).sort((a, b) => (a.startAt < b.startAt ? 1 : -1));
}

export const KIND_LABEL: Record<MeetingKind, string> = {
  'full-council':   'Full council',
  committee:        'Committee',
  special:          'Special sitting',
  'public-hearing': 'Public hearing',
};
