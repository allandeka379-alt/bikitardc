// ─────────────────────────────────────────────
// Service applications fixture
//
// Spec §9.1: 12 applications in various stages,
// one belonging to Tendai. The Journey B story
// (spec §7.2) references 'BL-2026-0031' by name —
// we seed that exact reference so the demo-only
// 'Advance Stage' control works in a later
// milestone.
// ─────────────────────────────────────────────

export type ApplicationType =
  | 'business-licence'
  | 'building-plan'
  | 'market-stall'
  | 'residential-stand'
  | 'liquor-licence'
  | 'burial-order'
  | 'hawkers-permit'
  | 'rates-clearance';

export type ApplicationStage =
  | 'submitted'
  | 'under-review'
  | 'inspection-scheduled'
  | 'approved'
  | 'rejected'
  | 'issued';

export const STAGE_ORDER: ApplicationStage[] = [
  'submitted',
  'under-review',
  'inspection-scheduled',
  'approved',
  'issued',
];

export interface ApplicationEvent {
  at: string;
  stage: ApplicationStage;
  note?: string;
}

export interface Application {
  id: string;
  reference: string;
  type: ApplicationType;
  title: string;
  ownerId: string;
  propertyId?: string;
  submittedAt: string;
  stage: ApplicationStage;
  feeUsd: number;
  feePaid: boolean;
  events: ApplicationEvent[];
}

export const APPLICATION_TYPE_LABEL: Record<ApplicationType, string> = {
  'business-licence':    'Business licence',
  'building-plan':       'Building plan',
  'market-stall':        'Market stall',
  'residential-stand':   'Residential stand',
  'liquor-licence':      'Liquor licence',
  'burial-order':        'Burial order',
  'hawkers-permit':      "Hawkers' permit",
  'rates-clearance':     'Rates clearance',
};

export const APPLICATIONS: Application[] = [
  // Tendai's in-flight business licence (referenced by Journey B)
  {
    id: 'app_bl_0031',
    reference: 'BL-2026-0031',
    type: 'business-licence',
    title: 'Moyo General Dealers — new licence',
    ownerId: 'u_tendai',
    propertyId: 'p_2210',
    submittedAt: '2026-04-02T11:10:00Z',
    stage: 'under-review',
    feeUsd: 25,
    feePaid: true,
    events: [
      { at: '2026-04-02T11:10:00Z', stage: 'submitted',    note: 'Application submitted via portal.' },
      { at: '2026-04-03T09:22:00Z', stage: 'under-review', note: 'Licensing Officer reviewing supporting documents.' },
    ],
  },
  // Seed 11 more across types/stages for the ERP kanban in a later milestone.
  { id: 'app_bp_0122', reference: 'BP-2026-0122', type: 'building-plan',     title: 'Nhema warehouse extension',       ownerId: 'u_other_1', submittedAt: '2026-03-18T10:00:00Z', stage: 'inspection-scheduled', feeUsd: 60, feePaid: true, events: [] },
  { id: 'app_rs_0088', reference: 'RS-2026-0088', type: 'residential-stand', title: 'Nyika stand application',         ownerId: 'u_other_2', submittedAt: '2026-03-05T09:30:00Z', stage: 'submitted',            feeUsd: 15, feePaid: true, events: [] },
  { id: 'app_hp_0044', reference: 'HP-2026-0044', type: 'hawkers-permit',    title: 'Mupani market hawkers permit',    ownerId: 'u_other_3', submittedAt: '2026-04-10T14:15:00Z', stage: 'under-review',         feeUsd:  8, feePaid: true, events: [] },
  { id: 'app_ll_0012', reference: 'LL-2026-0012', type: 'liquor-licence',    title: 'Chikuku Bar & Grill — renewal',   ownerId: 'u_other_4', submittedAt: '2026-02-20T09:00:00Z', stage: 'approved',             feeUsd: 40, feePaid: true, events: [] },
  { id: 'app_ms_0007', reference: 'MS-2026-0007', type: 'market-stall',      title: 'Stall A-12 — Mupani market',      ownerId: 'u_other_1', submittedAt: '2026-04-11T08:00:00Z', stage: 'issued',               feeUsd: 10, feePaid: true, events: [] },
  { id: 'app_rc_0019', reference: 'RC-2026-0019', type: 'rates-clearance',   title: 'Stand 1177 clearance',            ownerId: 'u_other_3', submittedAt: '2026-04-12T07:55:00Z', stage: 'issued',               feeUsd:  0, feePaid: true, events: [] },
  { id: 'app_bl_0032', reference: 'BL-2026-0032', type: 'business-licence',  title: 'Privilege Shop — transfer',       ownerId: 'u_other_4', submittedAt: '2026-03-28T13:30:00Z', stage: 'inspection-scheduled', feeUsd: 25, feePaid: true, events: [] },
  { id: 'app_bp_0130', reference: 'BP-2026-0130', type: 'building-plan',     title: 'Bota farmhouse expansion',         ownerId: 'u_other_2', submittedAt: '2026-04-08T10:45:00Z', stage: 'submitted',            feeUsd: 60, feePaid: false, events: [] },
  { id: 'app_bo_0004', reference: 'BO-2026-0004', type: 'burial-order',      title: 'Nyika cemetery plot request',     ownerId: 'u_other_1', submittedAt: '2026-04-14T15:20:00Z', stage: 'approved',             feeUsd: 20, feePaid: true, events: [] },
  { id: 'app_ll_0013', reference: 'LL-2026-0013', type: 'liquor-licence',    title: 'Nhema Tavern — new',              ownerId: 'u_other_2', submittedAt: '2026-04-05T12:15:00Z', stage: 'under-review',         feeUsd: 40, feePaid: true, events: [] },
  { id: 'app_rs_0090', reference: 'RS-2026-0090', type: 'residential-stand', title: 'Mupani stand application',        ownerId: 'u_other_3', submittedAt: '2026-04-01T09:10:00Z', stage: 'rejected',             feeUsd: 15, feePaid: true, events: [] },
];

export function applicationsForOwner(ownerId: string): Application[] {
  return APPLICATIONS.filter((a) => a.ownerId === ownerId);
}

export function applicationsForProperty(propertyId: string): Application[] {
  return APPLICATIONS.filter((a) => a.propertyId === propertyId);
}
