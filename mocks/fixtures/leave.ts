// ─────────────────────────────────────────────
// Leave management — per-employee balances and
// a feed of leave requests (pending / approved /
// rejected).
//
// Entitlements follow NEC for Local Authorities:
//   annual leave 24 working days, sick 14, compas-
//   sionate 5, maternity 98 calendar.
// ─────────────────────────────────────────────

export type LeaveType = 'annual' | 'sick' | 'compassionate' | 'maternity' | 'study';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'taken';

export interface LeaveBalance {
  employeeId: string;
  type: LeaveType;
  entitlementDays: number;
  takenDays: number;
  pendingDays: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startsAt: string;       // ISO
  endsAt: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  submittedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export const LEAVE_LABEL: Record<LeaveType, string> = {
  annual:        'Annual leave',
  sick:          'Sick leave',
  compassionate: 'Compassionate',
  maternity:     'Maternity',
  study:         'Study leave',
};

export const STATUS_LABEL: Record<LeaveStatus, string> = {
  pending:   'Pending',
  approved:  'Approved',
  rejected:  'Rejected',
  cancelled: 'Cancelled',
  taken:     'Taken',
};

export const STATUS_TONE: Record<LeaveStatus, 'warning' | 'success' | 'danger' | 'neutral' | 'info'> = {
  pending:   'warning',
  approved:  'success',
  rejected:  'danger',
  cancelled: 'neutral',
  taken:     'info',
};

// Default entitlements. All employees get the same base.
function baseBalances(employeeId: string): LeaveBalance[] {
  return [
    { employeeId, type: 'annual',        entitlementDays: 24, takenDays: 0, pendingDays: 0 },
    { employeeId, type: 'sick',          entitlementDays: 14, takenDays: 0, pendingDays: 0 },
    { employeeId, type: 'compassionate', entitlementDays:  5, takenDays: 0, pendingDays: 0 },
  ];
}

export const LEAVE_BALANCES: LeaveBalance[] = [
  // Draws from named employees so the balances look realistic
  ...baseBalances('e_001').map((b) => (b.type === 'annual' ? { ...b, takenDays: 12 } : b)),
  ...baseBalances('e_002').map((b) => (b.type === 'annual' ? { ...b, takenDays:  8, pendingDays: 4 } : b)),
  ...baseBalances('e_003').map((b) => (b.type === 'annual' ? { ...b, takenDays:  5 } : b)),
  ...baseBalances('e_004').map((b) => (b.type === 'annual' ? { ...b, takenDays:  7, pendingDays: 2 } : b)),
  ...baseBalances('e_010').map((b) => b.type === 'annual' ? { ...b, takenDays:  3 } : b.type === 'sick' ? { ...b, takenDays: 2 } : b),
  ...baseBalances('e_011').map((b) => b.type === 'annual' ? { ...b, takenDays:  1 } : b),
  ...baseBalances('e_012').map((b) => b.type === 'annual' ? { ...b, takenDays:  4 } : b),
  ...baseBalances('e_013').map((b) => b.type === 'annual' ? { ...b, takenDays:  2 } : b),
  ...baseBalances('e_020').map((b) => b.type === 'annual' ? { ...b, takenDays:  6 } : b),
  ...baseBalances('e_021').map((b) => b.type === 'annual' ? { ...b, takenDays:  9 } : b),
  ...baseBalances('e_022').map((b) => b.type === 'annual' ? { ...b, takenDays: 14 } : b),
  ...baseBalances('e_023').map((b) => b.type === 'annual' ? { ...b, takenDays: 10 } : b),
  ...baseBalances('e_024').map((b) => b.type === 'annual' ? { ...b, takenDays:  3 } : b),
  ...baseBalances('e_025').map((b) => b.type === 'annual' ? { ...b, takenDays:  5 } : b),
  ...baseBalances('e_030').map((b) => b.type === 'annual' ? { ...b, takenDays:  7 } : b),
  ...baseBalances('e_031').map((b) => b.type === 'annual' ? { ...b, takenDays: 11 } : b),
  ...baseBalances('e_032').map((b) => b.type === 'annual' ? { ...b, takenDays: 18, pendingDays: 0 } : b),
  ...baseBalances('e_040').map((b) => b.type === 'annual' ? { ...b, takenDays:  8 } : b),
  ...baseBalances('e_041').map((b) => b.type === 'annual' ? { ...b, takenDays: 12 } : b),
  ...baseBalances('e_042').map((b) => b.type === 'annual' ? { ...b, takenDays: 15 } : b),
  ...baseBalances('e_050').map((b) => b.type === 'annual' ? { ...b, takenDays:  3 } : b),
  ...baseBalances('e_060').map((b) => b.type === 'annual' ? { ...b, takenDays:  8 } : b),
  ...baseBalances('e_061').map((b) => b.type === 'annual' ? { ...b, takenDays: 16 } : b),
  ...baseBalances('e_070').map((b) => b.type === 'annual' ? { ...b, takenDays:  5 } : b),
  ...baseBalances('e_071').map((b) => b.type === 'annual' ? { ...b, takenDays: 12 } : b),
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lr_001', employeeId: 'e_002', type: 'annual', startsAt: '2026-05-04', endsAt: '2026-05-08', days: 4, reason: 'Family visit to Bulawayo', status: 'pending',  submittedAt: '2026-04-14', approvedBy: null,   approvedAt: null },
  { id: 'lr_002', employeeId: 'e_004', type: 'annual', startsAt: '2026-04-20', endsAt: '2026-04-22', days: 2, reason: 'Graduation ceremony', status: 'pending',  submittedAt: '2026-04-10', approvedBy: null,   approvedAt: null },
  { id: 'lr_003', employeeId: 'e_032', type: 'maternity', startsAt: '2026-02-01', endsAt: '2026-05-08', days: 98, reason: 'Maternity leave', status: 'approved', submittedAt: '2026-01-05', approvedBy: 'Rumbidzai Ndou', approvedAt: '2026-01-06' },
  { id: 'lr_004', employeeId: 'e_022', type: 'annual', startsAt: '2026-03-16', endsAt: '2026-03-29', days: 14, reason: '',                          status: 'taken',    submittedAt: '2026-02-28', approvedBy: 'Fortune Marimo', approvedAt: '2026-03-01' },
  { id: 'lr_005', employeeId: 'e_023', type: 'annual', startsAt: '2026-04-07', endsAt: '2026-04-18', days: 10, reason: 'Family duty',            status: 'taken',    submittedAt: '2026-03-25', approvedBy: 'Fortune Marimo', approvedAt: '2026-03-26' },
  { id: 'lr_006', employeeId: 'e_061', type: 'sick',   startsAt: '2026-04-02', endsAt: '2026-04-03', days: 2, reason: 'Malaria',                 status: 'taken',    submittedAt: '2026-04-02', approvedBy: 'Langton Kuchena',  approvedAt: '2026-04-02' },
  { id: 'lr_007', employeeId: 'e_042', type: 'annual', startsAt: '2026-06-02', endsAt: '2026-06-14', days: 12, reason: 'Daughter\u2019s wedding', status: 'pending',  submittedAt: '2026-04-13', approvedBy: null,   approvedAt: null },
  { id: 'lr_008', employeeId: 'e_010', type: 'compassionate', startsAt: '2026-03-12', endsAt: '2026-03-14', days: 3, reason: 'Bereavement',     status: 'taken',    submittedAt: '2026-03-11', approvedBy: 'Rumbidzai Ndou', approvedAt: '2026-03-11' },
];

export function balancesFor(employeeId: string): LeaveBalance[] {
  return LEAVE_BALANCES.filter((b) => b.employeeId === employeeId);
}

export function requestsFor(employeeId: string): LeaveRequest[] {
  return LEAVE_REQUESTS.filter((r) => r.employeeId === employeeId);
}

export function pendingLeaveCount(): number {
  return LEAVE_REQUESTS.filter((r) => r.status === 'pending').length;
}

export function onLeaveToday(today: Date = new Date('2026-04-17')): string[] {
  const d = today.getTime();
  return LEAVE_REQUESTS
    .filter((r) => (r.status === 'approved' || r.status === 'taken') && new Date(r.startsAt).getTime() <= d && d <= new Date(r.endsAt).getTime())
    .map((r) => r.employeeId);
}
