// ─────────────────────────────────────────────
// Internal work orders — the operational queue
// driving the works / water & sanitation / fleet
// teams. Separate from citizen service-requests
// (which live in service-requests.ts) although
// many work orders are spawned from a service
// request.
// ─────────────────────────────────────────────

export type WorkOrderStatus = 'open' | 'assigned' | 'in-progress' | 'blocked' | 'completed' | 'cancelled';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkOrderTeam =
  | 'Roads'
  | 'Water & Sanitation'
  | 'Refuse'
  | 'Electrical'
  | 'Fleet workshop'
  | 'Public Health'
  | 'Building & Works';

export interface WorkOrder {
  id: string;
  reference: string;         // BRDC-WO-2026-0001
  title: string;
  description: string;
  team: WorkOrderTeam;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  location: string;
  ward: string;
  raisedAt: string;          // ISO
  raisedBy: string;
  assignedTo: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  /** If it came from a citizen request, link back. */
  linkedRequestId?: string;
  estimatedHours: number;
  assetTag?: string;         // the fleet or fixed-asset it concerns
  partsCostUsd: number;
}

export const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  open:          'Open',
  assigned:      'Assigned',
  'in-progress': 'In progress',
  blocked:       'Blocked',
  completed:     'Completed',
  cancelled:     'Cancelled',
};

export const STATUS_TONE: Record<WorkOrderStatus, 'warning' | 'info' | 'brand' | 'danger' | 'success' | 'neutral'> = {
  open:          'warning',
  assigned:      'info',
  'in-progress': 'brand',
  blocked:       'danger',
  completed:     'success',
  cancelled:     'neutral',
};

export const PRIORITY_TONE: Record<WorkOrderPriority, 'neutral' | 'info' | 'warning' | 'danger'> = {
  low:    'neutral',
  medium: 'info',
  high:   'warning',
  urgent: 'danger',
};

export const WORK_ORDERS: WorkOrder[] = [
  // ── Open / unassigned ──
  {
    id: 'wo_001', reference: 'BRDC-WO-2026-0001',
    title: 'Pothole patch — Chikwanda main road', description: 'Series of potholes between Chikwanda shops and the council offices. Needs cold-mix patch plus compaction.',
    team: 'Roads', priority: 'high', status: 'open',
    location: 'Chikwanda main road (km 3.2)', ward: 'Chikwanda',
    raisedAt: '2026-04-15T07:12:00Z', raisedBy: 'Runako Zengeya', assignedTo: null,
    scheduledAt: null, completedAt: null, linkedRequestId: undefined,
    estimatedHours: 8, partsCostUsd: 180,
  },
  {
    id: 'wo_002', reference: 'BRDC-WO-2026-0002',
    title: 'Burst pipe — Nyika primary school', description: 'Mains reticulation burst near the gate, water flowing onto the road. Isolation required plus new section of pipe.',
    team: 'Water & Sanitation', priority: 'urgent', status: 'open',
    location: 'Nyika primary school', ward: 'Nyika',
    raisedAt: '2026-04-16T05:30:00Z', raisedBy: 'Memory Chauke (citizen)', assignedTo: null,
    scheduledAt: null, completedAt: null, linkedRequestId: 'sr_0042',
    estimatedHours: 6, partsCostUsd: 240,
  },
  {
    id: 'wo_003', reference: 'BRDC-WO-2026-0003',
    title: 'Refuse skip request — Mupani market', description: 'Traders report overflowing skip. Needs emptying and sanitisation.',
    team: 'Refuse', priority: 'medium', status: 'open',
    location: 'Mupani Main Market', ward: 'Mupani',
    raisedAt: '2026-04-16T09:00:00Z', raisedBy: 'Gift Makoni (stall holder)', assignedTo: null,
    scheduledAt: null, completedAt: null,
    estimatedHours: 3, partsCostUsd: 0,
  },

  // ── Assigned ──
  {
    id: 'wo_010', reference: 'BRDC-WO-2026-0010',
    title: 'Streetlight repair — Kamungoma T-junction', description: 'Two lamps out on the east arm of the new junction. Confirm solar charge controller + lamp head.',
    team: 'Electrical', priority: 'medium', status: 'assigned',
    location: 'Kamungoma junction', ward: 'Kamungoma',
    raisedAt: '2026-04-14T06:50:00Z', raisedBy: 'Blessing Mpofu', assignedTo: 'Blessing Mpofu',
    scheduledAt: '2026-04-18T07:00:00Z', completedAt: null,
    estimatedHours: 4, partsCostUsd: 65,
  },
  {
    id: 'wo_011', reference: 'BRDC-WO-2026-0011',
    title: 'Grader scheduled service', description: 'CAT 120K due at 9,200 km. Needs oil, hydraulic filter and a tyre inspection.',
    team: 'Fleet workshop', priority: 'medium', status: 'assigned',
    location: 'Works yard', ward: 'Chikwanda',
    raisedAt: '2026-04-13T09:10:00Z', raisedBy: 'Fortune Marimo', assignedTo: 'Blessing Mpofu',
    scheduledAt: '2026-04-22T08:00:00Z', completedAt: null, assetTag: 'BRDC-PLT-001',
    estimatedHours: 10, partsCostUsd: 620,
  },

  // ── In progress ──
  {
    id: 'wo_020', reference: 'BRDC-WO-2026-0020',
    title: 'Road grading — Nhema–Mazungunye feeder', description: 'Fourth pass scheduled. Team deployed since 14 April. Approx 2 km remaining.',
    team: 'Roads', priority: 'high', status: 'in-progress',
    location: 'Nhema – Mazungunye feeder', ward: 'Nhema',
    raisedAt: '2026-04-10T08:00:00Z', raisedBy: 'Eng. Munashe Gwatidzo', assignedTo: 'Fortune Marimo',
    scheduledAt: '2026-04-14T07:00:00Z', completedAt: null, assetTag: 'BRDC-PLT-001',
    estimatedHours: 36, partsCostUsd: 0,
  },
  {
    id: 'wo_021', reference: 'BRDC-WO-2026-0021',
    title: 'Water tank cleaning — Silveira Mission', description: 'Quarterly cleaning and chlorination of 20 000 L tank. Crew on-site since yesterday.',
    team: 'Water & Sanitation', priority: 'medium', status: 'in-progress',
    location: 'Silveira Mission', ward: 'Silveira',
    raisedAt: '2026-04-14T07:30:00Z', raisedBy: 'Edgar Chimwemwe', assignedTo: 'Stephen Maseko',
    scheduledAt: '2026-04-16T06:00:00Z', completedAt: null,
    estimatedHours: 12, partsCostUsd: 45,
  },

  // ── Blocked ──
  {
    id: 'wo_030', reference: 'BRDC-WO-2026-0030',
    title: 'Iveco gearbox — parts back-order', description: 'Iveco 7T in workshop awaiting Masvingo Auto Works to release gearbox parts.',
    team: 'Fleet workshop', priority: 'high', status: 'blocked',
    location: 'Works yard', ward: 'Chikwanda',
    raisedAt: '2026-04-05T07:00:00Z', raisedBy: 'Fortune Marimo', assignedTo: 'Blessing Mpofu',
    scheduledAt: '2026-04-09T07:00:00Z', completedAt: null, assetTag: 'BRDC-VEH-NEW',
    estimatedHours: 20, partsCostUsd: 1_840,
  },

  // ── Completed (recent) ──
  {
    id: 'wo_090', reference: 'BRDC-WO-2026-0090',
    title: 'Borehole pump replacement — Bota', description: 'Replaced submersible pump at the Bota ward office borehole. Flow restored.',
    team: 'Water & Sanitation', priority: 'high', status: 'completed',
    location: 'Bota ward office', ward: 'Bota',
    raisedAt: '2026-03-28T07:00:00Z', raisedBy: 'Eng. Grace Mutema', assignedTo: 'Stephen Maseko',
    scheduledAt: '2026-03-30T07:00:00Z', completedAt: '2026-04-02T16:00:00Z',
    estimatedHours: 18, partsCostUsd: 820,
  },
  {
    id: 'wo_091', reference: 'BRDC-WO-2026-0091',
    title: 'Refuse collection — Nyika route', description: 'Weekly refuse sweep for Nyika township completed.',
    team: 'Refuse', priority: 'low', status: 'completed',
    location: 'Nyika township', ward: 'Nyika',
    raisedAt: '2026-04-11T05:30:00Z', raisedBy: 'System', assignedTo: 'Munyaradzi Zvobgo',
    scheduledAt: '2026-04-11T06:00:00Z', completedAt: '2026-04-11T14:00:00Z',
    estimatedHours: 8, partsCostUsd: 0,
  },
];

export const TEAMS: WorkOrderTeam[] = [
  'Roads', 'Water & Sanitation', 'Refuse', 'Electrical', 'Fleet workshop', 'Public Health', 'Building & Works',
];

export function findWorkOrder(id: string): WorkOrder | undefined {
  return WORK_ORDERS.find((w) => w.id === id);
}

export function countByStatus(): Record<WorkOrderStatus, number> {
  const out = { open: 0, assigned: 0, 'in-progress': 0, blocked: 0, completed: 0, cancelled: 0 } as Record<WorkOrderStatus, number>;
  for (const w of WORK_ORDERS) out[w.status]++;
  return out;
}

export function openCount(): number {
  return WORK_ORDERS.filter((w) => w.status !== 'completed' && w.status !== 'cancelled').length;
}
