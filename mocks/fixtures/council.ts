// ─────────────────────────────────────────────
// Internal council workflow — meetings, agendas,
// resolutions and action items. Sits alongside
// (but is distinct from) fixtures/meetings.ts
// which powers the citizen-facing /meetings
// public view.
// ─────────────────────────────────────────────

export type MeetingKind =
  | 'full-council'
  | 'finance-committee'
  | 'works-committee'
  | 'social-services'
  | 'audit'
  | 'special';

export type MeetingStatus = 'scheduled' | 'in-progress' | 'minuted' | 'ratified' | 'cancelled';

export type ResolutionStatus = 'proposed' | 'amended' | 'passed' | 'rejected' | 'deferred' | 'actioned';

export type ActionStatus = 'open' | 'in-progress' | 'overdue' | 'completed' | 'cancelled';

export interface AgendaItem {
  id: string;
  order: number;
  title: string;
  presenter: string;
  minutesAllocated: number;
  attachments: number;
  notes?: string;
}

export interface CouncilMeeting {
  id: string;
  reference: string;          // BRDC-MTG-2026-004
  title: string;
  kind: MeetingKind;
  venue: string;
  startsAt: string;           // ISO
  durationMinutes: number;
  chair: string;
  secretary: string;
  status: MeetingStatus;
  attendees: string[];
  apologies: string[];
  agenda: AgendaItem[];
}

export interface Resolution {
  id: string;
  reference: string;          // BRDC-RES-2026-014
  meetingId: string;
  title: string;
  summary: string;
  proposer: string;
  seconder: string;
  status: ResolutionStatus;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  adoptedAt?: string;
}

export interface ActionItem {
  id: string;
  reference: string;          // BRDC-ACT-2026-023
  resolutionId?: string;
  meetingId: string;
  description: string;
  owner: string;              // staff member
  department: string;
  dueAt: string;
  status: ActionStatus;
  progressPct: number;
  notes?: string;
}

export const KIND_LABEL: Record<MeetingKind, string> = {
  'full-council':      'Full council',
  'finance-committee': 'Finance committee',
  'works-committee':   'Works committee',
  'social-services':   'Social services',
  audit:               'Audit committee',
  special:             'Special sitting',
};

export const MEETING_STATUS_LABEL: Record<MeetingStatus, string> = {
  scheduled:    'Scheduled',
  'in-progress':'In progress',
  minuted:      'Minuted (draft)',
  ratified:     'Ratified',
  cancelled:    'Cancelled',
};

export const MEETING_STATUS_TONE: Record<MeetingStatus, 'warning' | 'info' | 'brand' | 'success' | 'neutral'> = {
  scheduled:    'warning',
  'in-progress':'info',
  minuted:      'brand',
  ratified:     'success',
  cancelled:    'neutral',
};

export const RES_STATUS_LABEL: Record<ResolutionStatus, string> = {
  proposed: 'Proposed',
  amended:  'Amended',
  passed:   'Passed',
  rejected: 'Rejected',
  deferred: 'Deferred',
  actioned: 'Actioned',
};

export const RES_STATUS_TONE: Record<ResolutionStatus, 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'brand'> = {
  proposed: 'neutral',
  amended:  'info',
  passed:   'success',
  rejected: 'danger',
  deferred: 'warning',
  actioned: 'brand',
};

export const ACT_STATUS_LABEL: Record<ActionStatus, string> = {
  open:         'Open',
  'in-progress':'In progress',
  overdue:      'Overdue',
  completed:    'Completed',
  cancelled:    'Cancelled',
};

export const ACT_STATUS_TONE: Record<ActionStatus, 'warning' | 'info' | 'danger' | 'success' | 'neutral'> = {
  open:         'warning',
  'in-progress':'info',
  overdue:      'danger',
  completed:    'success',
  cancelled:    'neutral',
};

export const COUNCIL_MEETINGS: CouncilMeeting[] = [
  // Upcoming
  {
    id: 'mtg_001', reference: 'BRDC-MTG-2026-005',
    title: 'April ordinary council meeting',
    kind: 'full-council',
    venue: 'Chaka\u2019s Lodge Conference Hall',
    startsAt: '2026-04-23T09:00:00Z',
    durationMinutes: 240,
    chair: 'Cllr. T. Muchena',
    secretary: 'Rumbidzai Ndou',
    status: 'scheduled',
    attendees: ['Cllr. T. Muchena', 'Cllr. R. Chari', 'Cllr. G. Makore', 'Eng. T. Makoni', 'N. Chigariro', 'R. Ndou'],
    apologies: ['Cllr. F. Mugo'],
    agenda: [
      { id: 'a_001', order: 1, title: 'Opening prayer & apologies',                  presenter: 'Cllr. T. Muchena', minutesAllocated:  10, attachments: 0 },
      { id: 'a_002', order: 2, title: 'Confirmation of March minutes',               presenter: 'R. Ndou',          minutesAllocated:  15, attachments: 1 },
      { id: 'a_003', order: 3, title: 'CFO report — Q1 FY2026 financials',           presenter: 'N. Chigariro',     minutesAllocated:  45, attachments: 3 },
      { id: 'a_004', order: 4, title: 'Kamungoma carriageway phase 2 progress',      presenter: 'Eng. G. Mutema',   minutesAllocated:  30, attachments: 2 },
      { id: 'a_005', order: 5, title: 'CAMPFIRE dividend distribution — Q1',         presenter: 'A. Makuwaza',      minutesAllocated:  20, attachments: 1 },
      { id: 'a_006', order: 6, title: 'By-law amendment — refuse charges',           presenter: 'Eng. T. Makoni',   minutesAllocated:  45, attachments: 1, notes: 'Requires formal vote.' },
      { id: 'a_007', order: 7, title: 'Any other business',                          presenter: 'Cllr. T. Muchena', minutesAllocated:  30, attachments: 0 },
      { id: 'a_008', order: 8, title: 'Date of next meeting / close',                presenter: 'Cllr. T. Muchena', minutesAllocated:  10, attachments: 0 },
    ],
  },
  {
    id: 'mtg_002', reference: 'BRDC-MTG-2026-006',
    title: 'Finance committee — monthly review',
    kind: 'finance-committee',
    venue: 'Boardroom, Civic Centre',
    startsAt: '2026-04-20T14:00:00Z',
    durationMinutes: 180,
    chair: 'Cllr. R. Chari',
    secretary: 'Patience Dube',
    status: 'scheduled',
    attendees: ['Cllr. R. Chari', 'N. Chigariro', 'T. Chidziva', 'P. Dube'],
    apologies: [],
    agenda: [
      { id: 'a_101', order: 1, title: 'March bank reconciliation sign-off',         presenter: 'T. Chidziva',      minutesAllocated:  30, attachments: 1 },
      { id: 'a_102', order: 2, title: 'Creditors aging and payment schedule',       presenter: 'N. Chigariro',     minutesAllocated:  30, attachments: 1 },
      { id: 'a_103', order: 3, title: 'Debtor collection campaign — Q2 plan',       presenter: 'Mai Moyo',         minutesAllocated:  30, attachments: 1 },
      { id: 'a_104', order: 4, title: 'Variance review — expense lines over 40%',   presenter: 'N. Chigariro',     minutesAllocated:  45, attachments: 2 },
      { id: 'a_105', order: 5, title: 'AOB',                                         presenter: 'Cllr. R. Chari',   minutesAllocated:  15, attachments: 0 },
    ],
  },
  // Past (minuted / ratified)
  {
    id: 'mtg_010', reference: 'BRDC-MTG-2026-004',
    title: 'March ordinary council meeting',
    kind: 'full-council',
    venue: 'Civic Centre Hall',
    startsAt: '2026-03-26T09:00:00Z',
    durationMinutes: 240,
    chair: 'Cllr. T. Muchena',
    secretary: 'Rumbidzai Ndou',
    status: 'ratified',
    attendees: ['Cllr. T. Muchena', 'Cllr. R. Chari', 'Cllr. G. Makore', 'Cllr. F. Mugo', 'Eng. T. Makoni', 'N. Chigariro', 'R. Ndou'],
    apologies: [],
    agenda: [
      { id: 'a_201', order: 1, title: 'Opening prayer & apologies',                  presenter: 'Cllr. T. Muchena', minutesAllocated:  10, attachments: 0 },
      { id: 'a_202', order: 2, title: 'Confirmation of February minutes',            presenter: 'R. Ndou',          minutesAllocated:  15, attachments: 1 },
      { id: 'a_203', order: 3, title: 'CFO report — February financials',            presenter: 'N. Chigariro',     minutesAllocated:  45, attachments: 3 },
      { id: 'a_204', order: 4, title: 'Kamungoma solar signals commissioning',      presenter: 'Eng. G. Mutema',   minutesAllocated:  30, attachments: 2 },
      { id: 'a_205', order: 5, title: 'Harurwa harvest season opening — Nyika',      presenter: 'A. Makuwaza',      minutesAllocated:  20, attachments: 0 },
      { id: 'a_206', order: 6, title: 'FY2026 budget variance — Q1 preview',         presenter: 'N. Chigariro',     minutesAllocated:  45, attachments: 1 },
      { id: 'a_207', order: 7, title: 'AOB',                                         presenter: 'Cllr. T. Muchena', minutesAllocated:  30, attachments: 0 },
    ],
  },
];

export const RESOLUTIONS: Resolution[] = [
  {
    id: 'res_001', reference: 'BRDC-RES-2026-014',
    meetingId: 'mtg_010',
    title: 'Approve April refuse charge increase',
    summary: 'That refuse & sanitation charges be increased by 6% effective 1 April 2026 across all property classes, subject to by-law amendment.',
    proposer: 'Cllr. R. Chari', seconder: 'Cllr. G. Makore',
    status: 'passed',
    votesFor: 6, votesAgainst: 1, abstentions: 0,
    adoptedAt: '2026-03-26',
  },
  {
    id: 'res_002', reference: 'BRDC-RES-2026-015',
    meetingId: 'mtg_010',
    title: 'Commission Kamungoma solar signals',
    summary: 'That the council formally commissions the Kamungoma solar traffic signals and credits the engineering team for delivery.',
    proposer: 'Cllr. T. Muchena', seconder: 'Cllr. F. Mugo',
    status: 'passed',
    votesFor: 7, votesAgainst: 0, abstentions: 0,
    adoptedAt: '2026-03-26',
  },
  {
    id: 'res_003', reference: 'BRDC-RES-2026-016',
    meetingId: 'mtg_010',
    title: 'CAMPFIRE Q1 ward dividend schedule',
    summary: 'That the CAMPFIRE Q1 dividend is distributed to contributing wards in proportion to off-takes, with Nyika receiving USD 2,075.',
    proposer: 'A. Makuwaza', seconder: 'Cllr. R. Chari',
    status: 'actioned',
    votesFor: 7, votesAgainst: 0, abstentions: 0,
    adoptedAt: '2026-03-26',
  },
  {
    id: 'res_004', reference: 'BRDC-RES-2026-017',
    meetingId: 'mtg_010',
    title: 'Defer Silveira tavern licence renewal',
    summary: 'That the Silveira Council Tavern liquor licence renewal be deferred pending an independent operations review.',
    proposer: 'Cllr. G. Makore', seconder: 'Cllr. R. Chari',
    status: 'deferred',
    votesFor: 4, votesAgainst: 2, abstentions: 1,
    adoptedAt: '2026-03-26',
  },
  {
    id: 'res_005', reference: 'BRDC-RES-2026-018',
    meetingId: 'mtg_010',
    title: 'Approve procurement committee membership',
    summary: 'Confirming the procurement committee membership for FY2026 comprising the CFO, HR head, Engineering director, and two councillors.',
    proposer: 'Cllr. T. Muchena', seconder: 'Cllr. F. Mugo',
    status: 'passed',
    votesFor: 7, votesAgainst: 0, abstentions: 0,
    adoptedAt: '2026-03-26',
  },
];

export const ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act_001', reference: 'BRDC-ACT-2026-031',
    resolutionId: 'res_001', meetingId: 'mtg_010',
    description: 'Draft refuse-charge by-law amendment and circulate to legal',
    owner: 'Rumbidzai Ndou', department: 'HR & admin',
    dueAt: '2026-04-20', status: 'in-progress', progressPct: 60,
  },
  {
    id: 'act_002', reference: 'BRDC-ACT-2026-032',
    resolutionId: 'res_002', meetingId: 'mtg_010',
    description: 'Finalise Kamungoma signals handover documentation',
    owner: 'Eng. Grace Mutema', department: 'Engineering',
    dueAt: '2026-04-10', status: 'completed', progressPct: 100,
  },
  {
    id: 'act_003', reference: 'BRDC-ACT-2026-033',
    resolutionId: 'res_003', meetingId: 'mtg_010',
    description: 'Process CAMPFIRE ward dividend payments for Q1',
    owner: 'Nobert Chigariro', department: 'Finance',
    dueAt: '2026-04-12', status: 'completed', progressPct: 100,
    notes: 'Nyika paid USD 2,075 on 4 April.',
  },
  {
    id: 'act_004', reference: 'BRDC-ACT-2026-034',
    resolutionId: 'res_004', meetingId: 'mtg_010',
    description: 'Commission independent operations review at Silveira tavern',
    owner: 'Nobert Chigariro', department: 'Finance',
    dueAt: '2026-04-15', status: 'overdue', progressPct: 20,
    notes: 'Scope drafted. Awaiting legal sign-off.',
  },
  {
    id: 'act_005', reference: 'BRDC-ACT-2026-035',
    resolutionId: 'res_005', meetingId: 'mtg_010',
    description: 'Gazette procurement committee membership in council minutes',
    owner: 'Rumbidzai Ndou', department: 'HR & admin',
    dueAt: '2026-04-02', status: 'completed', progressPct: 100,
  },
  {
    id: 'act_006', reference: 'BRDC-ACT-2026-022',
    meetingId: 'mtg_010',
    description: 'Table FY2026 budget variance preview at April full council',
    owner: 'Nobert Chigariro', department: 'Finance',
    dueAt: '2026-04-22', status: 'in-progress', progressPct: 80,
  },
];

export function findMeeting(id: string): CouncilMeeting | undefined {
  return COUNCIL_MEETINGS.find((m) => m.id === id);
}

export function findResolution(id: string): Resolution | undefined {
  return RESOLUTIONS.find((r) => r.id === id);
}

export function resolutionsFor(meetingId: string): Resolution[] {
  return RESOLUTIONS.filter((r) => r.meetingId === meetingId);
}

export function actionsFor(meetingId: string): ActionItem[] {
  return ACTION_ITEMS.filter((a) => a.meetingId === meetingId);
}

export function openActions(): ActionItem[] {
  return ACTION_ITEMS.filter((a) => a.status !== 'completed' && a.status !== 'cancelled');
}
