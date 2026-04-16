// ─────────────────────────────────────────────
// Manual verification queue (spec §3.1)
//
// Non-owner property-link requests pending review
// by a rates clerk. Journey C step 4 specifies
// opening "the case for Tendai Moyo linking his
// mother's stand" — we seed that exact case here.
// ─────────────────────────────────────────────

export type VerificationKind = 'linked-payer' | 'family-link' | 'tenant-link' | 'owner-change';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Verification {
  id: string;
  reference: string;
  kind: VerificationKind;
  applicantId: string;
  applicantName: string;
  subjectPropertyId: string;
  relationship: string;
  note: string;
  supportingDocs: { label: string; type: 'id' | 'letter' | 'bill' | 'other' }[];
  submittedAt: string;
  status: VerificationStatus;
}

export const VERIFICATION_KIND_LABEL: Record<VerificationKind, string> = {
  'linked-payer': 'Linked payer (diaspora)',
  'family-link':  'Family link',
  'tenant-link':  'Tenant link',
  'owner-change': 'Ownership change',
};

export const VERIFICATIONS: Verification[] = [
  {
    id: 'v_001',
    reference: 'VR-2026-0031',
    kind: 'family-link',
    applicantId: 'u_tendai',
    applicantName: 'Tendai Moyo',
    subjectPropertyId: 'p_6802', // "his mother's stand" (Journey C)
    relationship: "Son — wants to pay on his mother Rudo Sibanda's behalf",
    note: 'Mother recently hospitalised and unable to manage her rates — requesting view+pay access.',
    supportingDocs: [
      { label: 'National ID — applicant',   type: 'id' },
      { label: "Mother's ID copy",          type: 'id' },
      { label: 'Affidavit of relationship', type: 'letter' },
    ],
    submittedAt: '2026-04-14T09:12:00Z',
    status: 'pending',
  },
  {
    id: 'v_002',
    reference: 'VR-2026-0032',
    kind: 'linked-payer',
    applicantId: 'u_other_5',
    applicantName: 'Nyaradzo Chari (UK)',
    subjectPropertyId: 'p_1177',
    relationship: 'Daughter (diaspora) — pays on father\'s behalf',
    note: 'Resident in the UK. Has been paying via international transfer; requests formal linking.',
    supportingDocs: [
      { label: 'Applicant passport copy', type: 'id' },
      { label: 'Paternal affidavit',      type: 'letter' },
      { label: 'Prior bank receipt',      type: 'bill' },
    ],
    submittedAt: '2026-04-12T16:22:00Z',
    status: 'pending',
  },
  {
    id: 'v_003',
    reference: 'VR-2026-0033',
    kind: 'tenant-link',
    applicantId: 'u_other_6',
    applicantName: 'Brian Murwisi',
    subjectPropertyId: 'p_3050',
    relationship: 'Tenant — long-term lease, landlord overseas',
    note: 'Leases Shop 3050 on 2-year agreement. Landlord asked tenant to handle rates direct.',
    supportingDocs: [
      { label: 'Lease agreement', type: 'letter' },
      { label: 'Tenant ID',       type: 'id' },
    ],
    submittedAt: '2026-04-13T11:01:00Z',
    status: 'pending',
  },
];

export function pendingVerifications(): Verification[] {
  return VERIFICATIONS.filter((v) => v.status === 'pending');
}
