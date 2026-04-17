// ─────────────────────────────────────────────
// Audit log fixture
//
// Append-only record of sensitive actions (spec
// §3.3). Rendered in a right-side drawer accessible
// from every ERP screen.
// ─────────────────────────────────────────────

export type AuditActionKind =
  | 'login'
  | 'verification-approved'
  | 'verification-rejected'
  | 'payment-matched'
  | 'payment-recorded'
  | 'application-advanced'
  | 'application-submitted'
  | 'penalty-raised'
  | 'penalty-waived'
  | 'note-added'
  | 'request-assigned'
  | 'request-resolved'
  | 'billing-run-created'
  | 'role-changed';

export interface AuditEntry {
  id: string;
  at: string;
  actorName: string;
  actorRole: string;
  action: AuditActionKind;
  subject: string;
  note?: string;
}

export const AUDIT_ACTION_LABEL: Record<AuditActionKind, string> = {
  login:                  'Logged in',
  'verification-approved': 'Approved verification',
  'verification-rejected': 'Rejected verification',
  'payment-matched':       'Matched payment',
  'payment-recorded':      'Recorded counter payment',
  'application-advanced':  'Advanced application',
  'application-submitted': 'Submitted application',
  'penalty-raised':        'Raised penalty',
  'penalty-waived':        'Waived penalty',
  'note-added':            'Added customer note',
  'request-assigned':      'Assigned request',
  'request-resolved':      'Resolved request',
  'billing-run-created':   'Created billing run',
  'role-changed':          'Changed user role',
};

export const AUDIT_SEED: AuditEntry[] = [
  { id: 'al_010', at: '2026-04-16T07:45:00Z', actorName: 'Mai Moyo',      actorRole: 'Rates Clerk',   action: 'login',                  subject: 'clerk@demo.bikita' },
  { id: 'al_009', at: '2026-04-16T07:47:14Z', actorName: 'Mai Moyo',      actorRole: 'Rates Clerk',   action: 'payment-matched',        subject: 'BRDC-20260114-003412 ↔ EC-40931' },
  { id: 'al_008', at: '2026-04-15T16:02:30Z', actorName: 'Cllr. Muchena', actorRole: 'Ward councillor', action: 'request-assigned',    subject: 'SR-2026-0006 → Water & Sanitation' },
  { id: 'al_007', at: '2026-04-15T14:18:05Z', actorName: 'Mai Moyo',      actorRole: 'Rates Clerk',   action: 'application-advanced',   subject: 'BL-2026-0031 → Under review' },
  { id: 'al_006', at: '2026-04-14T10:22:12Z', actorName: 'Chipo Ndlovu',  actorRole: 'Revenue Officer', action: 'billing-run-created', subject: 'April 2026 residential billing run' },
  { id: 'al_005', at: '2026-04-13T09:35:41Z', actorName: 'Mai Moyo',      actorRole: 'Rates Clerk',   action: 'verification-approved',  subject: 'VR-2026-0018 — Farai Murwisi' },
  { id: 'al_004', at: '2026-04-12T08:02:17Z', actorName: 'System',        actorRole: 'System',        action: 'request-resolved',       subject: 'SR-2026-0011 — leaking standpipe' },
  { id: 'al_003', at: '2026-04-11T15:12:00Z', actorName: 'Admin',         actorRole: 'Administrator', action: 'role-changed',           subject: 'tendai@demo.bikita → Resident' },
  { id: 'al_002', at: '2026-04-10T11:02:50Z', actorName: 'Mai Moyo',      actorRole: 'Rates Clerk',   action: 'verification-rejected',  subject: 'VR-2026-0017 — insufficient documents' },
  { id: 'al_001', at: '2026-04-09T08:00:00Z', actorName: 'Mai Moyo',      actorRole: 'Rates Clerk',   action: 'login',                  subject: 'clerk@demo.bikita' },
];
