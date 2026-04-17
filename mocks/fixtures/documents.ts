// ─────────────────────────────────────────────
// Central document repository — internal records
// with retention policies and audit-friendly
// categorisation.
//
// The fixture backs /erp/documents and powers the
// retention-policy view at /erp/documents/retention.
// ─────────────────────────────────────────────

export type DocCategory =
  | 'council-minutes'
  | 'by-laws'
  | 'budget'
  | 'audit'
  | 'contracts'
  | 'tenders'
  | 'hr-records'
  | 'tax-returns'
  | 'asset-register'
  | 'policy'
  | 'citizen-records';

export type DocSensitivity = 'public' | 'internal' | 'confidential' | 'restricted';

export interface DocumentRecord {
  id: string;
  reference: string;       // BRDC-DOC-2026-0001
  title: string;
  category: DocCategory;
  sensitivity: DocSensitivity;
  filetype: 'pdf' | 'docx' | 'xlsx' | 'jpg';
  sizeKb: number;
  owner: string;
  department: string;
  uploadedAt: string;
  lastAccessedAt: string;
  version: string;
  /** ISO date when the document will be reviewed / disposed. */
  reviewDueAt: string;
  tags: string[];
}

export interface RetentionPolicy {
  category: DocCategory;
  label: string;
  retentionYears: number;
  disposalAction: 'destroy' | 'archive' | 'transfer-national-archives';
  authority: string;       // e.g. "Local Authorities Act §301"
}

export const CATEGORY_LABEL: Record<DocCategory, string> = {
  'council-minutes':  'Council minutes',
  'by-laws':          'By-laws',
  budget:             'Budget & finance',
  audit:              'Audit reports',
  contracts:          'Contracts',
  tenders:            'Tenders & procurement',
  'hr-records':       'HR records',
  'tax-returns':      'Tax returns',
  'asset-register':   'Asset register',
  policy:             'Policy & strategy',
  'citizen-records':  'Citizen records',
};

export const SENSITIVITY_LABEL: Record<DocSensitivity, string> = {
  public:        'Public',
  internal:      'Internal',
  confidential:  'Confidential',
  restricted:    'Restricted',
};

export const SENSITIVITY_TONE: Record<DocSensitivity, 'success' | 'info' | 'warning' | 'danger'> = {
  public:        'success',
  internal:      'info',
  confidential:  'warning',
  restricted:    'danger',
};

export const RETENTION_POLICIES: RetentionPolicy[] = [
  { category: 'council-minutes',  label: 'Council minutes',        retentionYears: 99, disposalAction: 'transfer-national-archives', authority: 'Local Authorities Act §301(a)' },
  { category: 'by-laws',          label: 'By-laws (gazetted)',     retentionYears: 99, disposalAction: 'transfer-national-archives', authority: 'Local Authorities Act §301(a)' },
  { category: 'budget',           label: 'Budget & finance',        retentionYears:  7, disposalAction: 'archive',   authority: 'Public Finance Management Act §74' },
  { category: 'audit',            label: 'Audit reports',           retentionYears: 10, disposalAction: 'archive',   authority: 'Audit Act §48' },
  { category: 'contracts',        label: 'Supplier contracts',      retentionYears: 10, disposalAction: 'archive',   authority: 'PRAZ Regulations §104' },
  { category: 'tenders',          label: 'Tender documentation',    retentionYears: 10, disposalAction: 'archive',   authority: 'PRAZ Regulations §104' },
  { category: 'hr-records',       label: 'HR records',              retentionYears: 50, disposalAction: 'archive',   authority: 'Labour Act §62' },
  { category: 'tax-returns',      label: 'Tax returns & statutory', retentionYears:  7, disposalAction: 'archive',   authority: 'Income Tax Act §75' },
  { category: 'asset-register',   label: 'Asset register',          retentionYears: 15, disposalAction: 'archive',   authority: 'IPSAS 17' },
  { category: 'policy',           label: 'Policy & strategy',       retentionYears: 20, disposalAction: 'archive',   authority: 'Council standing orders' },
  { category: 'citizen-records',  label: 'Citizen records',         retentionYears: 10, disposalAction: 'destroy',   authority: 'Data Protection Act §18' },
];

export const DOCUMENTS: DocumentRecord[] = [
  { id: 'doc_001', reference: 'BRDC-DOC-2026-0014', title: 'Council minutes — March 2026',                 category: 'council-minutes', sensitivity: 'public',        filetype: 'pdf',  sizeKb: 420,  owner: 'Rumbidzai Ndou',     department: 'HR & admin',   uploadedAt: '2026-03-27', lastAccessedAt: '2026-04-14', version: 'v1.2', reviewDueAt: '2125-03-27', tags: ['minutes','Q1'] },
  { id: 'doc_002', reference: 'BRDC-DOC-2026-0015', title: 'By-law amendment — refuse charges (draft)',    category: 'by-laws',         sensitivity: 'internal',      filetype: 'docx', sizeKb: 148,  owner: 'Rumbidzai Ndou',     department: 'HR & admin',   uploadedAt: '2026-04-02', lastAccessedAt: '2026-04-15', version: 'v0.4', reviewDueAt: '2125-04-02', tags: ['draft','by-law'] },
  { id: 'doc_003', reference: 'BRDC-DOC-2026-0016', title: 'FY2026 approved budget',                       category: 'budget',          sensitivity: 'internal',      filetype: 'xlsx', sizeKb: 680,  owner: 'Nobert Chigariro',   department: 'Finance',      uploadedAt: '2025-12-20', lastAccessedAt: '2026-04-12', version: 'v3.0', reviewDueAt: '2032-12-20', tags: ['budget','approved'] },
  { id: 'doc_004', reference: 'BRDC-DOC-2026-0017', title: 'External audit report — FY2024',               category: 'audit',           sensitivity: 'confidential',  filetype: 'pdf',  sizeKb: 1_820, owner: 'Nobert Chigariro',  department: 'Finance',      uploadedAt: '2025-08-10', lastAccessedAt: '2026-03-28', version: 'v1.0', reviewDueAt: '2035-08-10', tags: ['audit','external'] },
  { id: 'doc_005', reference: 'BRDC-DOC-2026-0018', title: 'Masvingo Civil Works contract — carriageway',  category: 'contracts',       sensitivity: 'confidential',  filetype: 'pdf',  sizeKb: 520,  owner: 'Eng. Grace Mutema',  department: 'Engineering',  uploadedAt: '2026-01-12', lastAccessedAt: '2026-04-16', version: 'v1.0', reviewDueAt: '2036-01-12', tags: ['contract','carriageway'] },
  { id: 'doc_006', reference: 'BRDC-DOC-2026-0019', title: 'BRDC-TND-2026-002 tender advert',              category: 'tenders',         sensitivity: 'public',        filetype: 'pdf',  sizeKb: 210,  owner: 'Eng. Grace Mutema',  department: 'Engineering',  uploadedAt: '2026-03-10', lastAccessedAt: '2026-04-14', version: 'v1.0', reviewDueAt: '2036-03-10', tags: ['tender','solar'] },
  { id: 'doc_007', reference: 'BRDC-DOC-2026-0020', title: 'Staff handbook v3',                            category: 'hr-records',      sensitivity: 'internal',      filetype: 'pdf',  sizeKb: 480,  owner: 'Rumbidzai Ndou',     department: 'HR & admin',   uploadedAt: '2025-11-04', lastAccessedAt: '2026-04-03', version: 'v3.0', reviewDueAt: '2075-11-04', tags: ['handbook','staff'] },
  { id: 'doc_008', reference: 'BRDC-DOC-2026-0021', title: 'Q1 VAT return & remittance',                   category: 'tax-returns',     sensitivity: 'restricted',    filetype: 'pdf',  sizeKb:  92,  owner: 'Nobert Chigariro',   department: 'Finance',      uploadedAt: '2026-04-07', lastAccessedAt: '2026-04-10', version: 'v1.0', reviewDueAt: '2033-04-07', tags: ['ZIMRA','Q1'] },
  { id: 'doc_009', reference: 'BRDC-DOC-2026-0022', title: 'Fixed asset register — export',                category: 'asset-register',  sensitivity: 'internal',      filetype: 'xlsx', sizeKb: 240,  owner: 'Nobert Chigariro',   department: 'Finance',      uploadedAt: '2026-01-15', lastAccessedAt: '2026-04-17', version: 'v4.1', reviewDueAt: '2041-01-15', tags: ['assets','IPSAS'] },
  { id: 'doc_010', reference: 'BRDC-DOC-2026-0023', title: 'ICT disaster-recovery policy',                  category: 'policy',          sensitivity: 'internal',      filetype: 'docx', sizeKb: 116,  owner: 'Kudakwashe Njanji',  department: 'ICT',          uploadedAt: '2025-09-18', lastAccessedAt: '2026-02-20', version: 'v1.1', reviewDueAt: '2045-09-18', tags: ['policy','DR'] },
  { id: 'doc_011', reference: 'BRDC-DOC-2026-0024', title: 'Data protection impact assessment — 2026',     category: 'policy',          sensitivity: 'confidential',  filetype: 'pdf',  sizeKb: 310,  owner: 'Kudakwashe Njanji',  department: 'ICT',          uploadedAt: '2026-02-02', lastAccessedAt: '2026-04-11', version: 'v1.0', reviewDueAt: '2046-02-02', tags: ['DPIA','privacy'] },
  { id: 'doc_012', reference: 'BRDC-DOC-2026-0025', title: 'Bulk diesel contract — Zuva',                  category: 'contracts',       sensitivity: 'confidential',  filetype: 'pdf',  sizeKb: 380,  owner: 'Nobert Chigariro',   department: 'Finance',      uploadedAt: '2026-03-10', lastAccessedAt: '2026-04-06', version: 'v1.0', reviewDueAt: '2036-03-10', tags: ['contract','fuel'] },
  { id: 'doc_013', reference: 'BRDC-DOC-2026-0026', title: 'CAMPFIRE programme policy',                     category: 'policy',          sensitivity: 'public',        filetype: 'pdf',  sizeKb: 220,  owner: 'Anna Makuwaza',      department: 'Social services', uploadedAt: '2024-06-04', lastAccessedAt: '2026-04-01', version: 'v2.0', reviewDueAt: '2044-06-04', tags: ['campfire','policy'] },
];

export function findDocument(id: string): DocumentRecord | undefined {
  return DOCUMENTS.find((d) => d.id === id);
}

export function retentionFor(cat: DocCategory): RetentionPolicy | undefined {
  return RETENTION_POLICIES.find((r) => r.category === cat);
}
