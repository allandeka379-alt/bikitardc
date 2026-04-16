// ─────────────────────────────────────────────
// Service requests fixture — spec §9.1 requires
// 25 geotagged requests across the district.
//
// Coordinates sit inside a realistic bounding box
// around Bikita town (−20.10, 31.60). Mix of
// categories, statuses and ages so the map, list
// and kanban all have something interesting.
// ─────────────────────────────────────────────

export type RequestCategory =
  | 'water'
  | 'road'
  | 'refuse'
  | 'drainage'
  | 'illegal-structure'
  | 'streetlight'
  | 'health';

export type RequestStatus =
  | 'open'
  | 'assigned'
  | 'in-progress'
  | 'resolved'
  | 'reopened';

export type SlaHealth = 'on-track' | 'at-risk' | 'breached';

export interface ServiceRequest {
  id: string;
  reference: string;
  category: RequestCategory;
  title: string;
  description: string;
  reporterName: string;
  reporterPhone: string;
  ward: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  status: RequestStatus;
  assignedTeam?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  slaHours: number;
  createdAt: string;
  resolvedAt?: string;
  satisfaction?: 1 | 2 | 3 | 4 | 5;
}

export const CATEGORY_LABEL: Record<RequestCategory, string> = {
  water: 'Water / borehole',
  road: 'Road / pothole',
  refuse: 'Refuse / illegal dumping',
  drainage: 'Drainage / flooding',
  'illegal-structure': 'Illegal structure',
  streetlight: 'Streetlight / safety',
  health: 'Public health',
};

export const CATEGORY_COLOR: Record<RequestCategory, string> = {
  water:             '#0369A1',
  road:              '#C77700',
  refuse:            '#7C3AED',
  drainage:          '#1E5AAA',
  'illegal-structure': '#B42318',
  streetlight:       '#C9A227',
  health:            '#1E7F4F',
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  'in-progress': 'In progress',
  resolved: 'Resolved',
  reopened: 'Re-opened',
};

export const STATUS_COLOR: Record<RequestStatus, { bg: string; text: string; dot: string }> = {
  open:          { bg: 'bg-danger/10',         text: 'text-danger',         dot: '#B42318' },
  assigned:      { bg: 'bg-warning/10',        text: 'text-warning',        dot: '#C77700' },
  'in-progress': { bg: 'bg-info/10',           text: 'text-info',           dot: '#1E5AAA' },
  resolved:      { bg: 'bg-success/10',        text: 'text-success',        dot: '#1E7F4F' },
  reopened:      { bg: 'bg-brand-accent/15',   text: 'text-[#8a6e13]',      dot: '#C9A227' },
};

const TEAMS = ['Water & Sanitation', 'Roads', 'Refuse', 'Public Health', 'Urban Planning', 'Electrical'];

export const SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'sr_0001',
    reference: 'SR-2026-0001',
    category: 'water',
    title: 'Broken borehole — Nyika Ward',
    description: 'Community borehole at Nyika Primary School has been dry for 4 days. Estimated 400 households affected.',
    reporterName: 'Tendai Moyo',
    reporterPhone: '+263771234567',
    ward: 'Nyika',
    lat: -20.0780,
    lng: 31.6060,
    photoUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=70&auto=format&fit=crop',
    status: 'open',
    priority: 'high',
    slaHours: 24,
    createdAt: '2026-04-15T08:40:00Z',
  },
  { id: 'sr_0002', reference: 'SR-2026-0002', category: 'road',            title: 'Pothole cluster on Bikita–Nyika road',  description: 'Series of large potholes near the 4km marker — dangerous for motorbikes.', reporterName: 'Rudo Sibanda', reporterPhone: '+263772345678', ward: 'Nyika',  lat: -20.0845, lng: 31.6188, status: 'assigned',   assignedTeam: 'Roads',                priority: 'high',     slaHours: 48, createdAt: '2026-04-14T07:10:00Z' },
  { id: 'sr_0003', reference: 'SR-2026-0003', category: 'refuse',          title: 'Illegal dumping near market',           description: 'Large pile of household refuse blocking pedestrian access to Mupani market.',   reporterName: 'Kudzai Nyatanga', reporterPhone: '+263773456789', ward: 'Mupani', lat: -20.1812, lng: 31.5482, status: 'in-progress', assignedTeam: 'Refuse',              priority: 'normal',   slaHours: 72, createdAt: '2026-04-12T14:02:00Z' },
  { id: 'sr_0004', reference: 'SR-2026-0004', category: 'drainage',        title: 'Blocked drain on High St',              description: 'Drainage channel completely blocked by sediment, water pooling after light rain.', reporterName: 'Farai Murwisi', reporterPhone: '+263774567890', ward: 'Mupani', lat: -20.1798, lng: 31.5501, status: 'open',       priority: 'normal',   slaHours: 72, createdAt: '2026-04-16T06:25:00Z' },
  { id: 'sr_0005', reference: 'SR-2026-0005', category: 'streetlight',     title: 'Streetlight out — Nyika shops',         description: 'Two streetlights dark near Stand 1177; safety concern after dark.',                reporterName: 'Netsai Kwenda', reporterPhone: '+263775678901', ward: 'Nyika',  lat: -20.0762, lng: 31.6095, status: 'resolved',   assignedTeam: 'Electrical',           priority: 'low',      slaHours: 96, createdAt: '2026-04-08T18:40:00Z', resolvedAt: '2026-04-13T10:20:00Z', satisfaction: 4 },
  { id: 'sr_0006', reference: 'SR-2026-0006', category: 'water',           title: 'Burst main — Mupani Rd',                description: 'Water main rupture, significant water loss reported by neighbours.',              reporterName: 'Privilege Shop', reporterPhone: '+263776789012', ward: 'Mupani', lat: -20.1820, lng: 31.5550, status: 'assigned',   assignedTeam: 'Water & Sanitation',   priority: 'critical', slaHours: 12, createdAt: '2026-04-15T22:18:00Z' },
  { id: 'sr_0007', reference: 'SR-2026-0007', category: 'road',            title: 'Bridge culvert damage — Bota',          description: 'Minor culvert collapse on Bota feeder road after heavy rain.',                     reporterName: 'Mai Moyo',      reporterPhone: '+263777890123', ward: 'Bota',   lat: -20.1950, lng: 31.5720, status: 'open',       priority: 'high',     slaHours: 48, createdAt: '2026-04-14T16:30:00Z' },
  { id: 'sr_0008', reference: 'SR-2026-0008', category: 'refuse',          title: 'Missed refuse collection — zone 3',     description: 'Collection skipped for 2 consecutive weeks in Chikuku zone 3.',                     reporterName: 'Anon',          reporterPhone: '+263778901234', ward: 'Chikuku', lat: -20.1305, lng: 31.6482, status: 'in-progress', assignedTeam: 'Refuse',               priority: 'normal',   slaHours: 72, createdAt: '2026-04-10T09:15:00Z' },
  { id: 'sr_0009', reference: 'SR-2026-0009', category: 'health',          title: 'Overflow pit latrine — school',         description: 'Reported by teacher — risk of outbreak if not addressed.',                        reporterName: 'Mr Mhlanga',    reporterPhone: '+263779012345', ward: 'Nhema',  lat: -20.0520, lng: 31.7120, status: 'assigned',   assignedTeam: 'Public Health',        priority: 'high',     slaHours: 24, createdAt: '2026-04-13T11:42:00Z' },
  { id: 'sr_0010', reference: 'SR-2026-0010', category: 'illegal-structure', title: 'Unauthorised stall extension',         description: 'Hawker extended stall onto pavement, blocking pedestrian traffic.',                reporterName: 'Cllr. Muchena', reporterPhone: '+263770123456', ward: 'Mupani', lat: -20.1780, lng: 31.5460, status: 'open',       priority: 'low',      slaHours: 120, createdAt: '2026-04-11T13:05:00Z' },
  { id: 'sr_0011', reference: 'SR-2026-0011', category: 'water',           title: 'Tap leaking — public standpipe',        description: 'Constant drip at public standpipe, losing ~200L/day.',                            reporterName: 'Memory Chipoka', reporterPhone: '+263771122334', ward: 'Nyika',   lat: -20.0810, lng: 31.6122, status: 'resolved',   assignedTeam: 'Water & Sanitation',   priority: 'low',      slaHours: 96, createdAt: '2026-04-03T08:00:00Z', resolvedAt: '2026-04-07T12:00:00Z', satisfaction: 5 },
  { id: 'sr_0012', reference: 'SR-2026-0012', category: 'road',            title: 'Washed-out shoulder',                   description: 'Road shoulder washed away by flooding, narrowing usable lane.',                    reporterName: 'Kudakwashe',    reporterPhone: '+263772233445', ward: 'Bota',   lat: -20.1988, lng: 31.5628, status: 'in-progress', assignedTeam: 'Roads',                priority: 'high',     slaHours: 48, createdAt: '2026-04-12T05:50:00Z' },
  { id: 'sr_0013', reference: 'SR-2026-0013', category: 'drainage',        title: 'Stormwater pooling in yard',            description: 'Stand yard flooded after rain, run-off not draining to main channel.',             reporterName: 'Tafadzwa',      reporterPhone: '+263773344556', ward: 'Chikuku', lat: -20.1320, lng: 31.6510, status: 'open',       priority: 'normal',   slaHours: 72, createdAt: '2026-04-14T20:05:00Z' },
  { id: 'sr_0014', reference: 'SR-2026-0014', category: 'streetlight',     title: 'Vandalised streetlight pole',           description: 'Pole knocked over by vehicle; wiring exposed — urgent safety concern.',             reporterName: 'Anon',          reporterPhone: '+263774455667', ward: 'Chikwanda', lat: -20.1120, lng: 31.6798, status: 'assigned',   assignedTeam: 'Electrical',           priority: 'critical', slaHours: 12, createdAt: '2026-04-15T23:14:00Z' },
  { id: 'sr_0015', reference: 'SR-2026-0015', category: 'refuse',          title: 'Public bin overflowing',                description: 'Bin at bus stop overflowing for 3 days, attracting flies.',                        reporterName: 'Tinashe',       reporterPhone: '+263775566778', ward: 'Nhema',  lat: -20.0460, lng: 31.7040, status: 'resolved',   assignedTeam: 'Refuse',               priority: 'low',      slaHours: 72, createdAt: '2026-04-05T10:12:00Z', resolvedAt: '2026-04-07T14:50:00Z', satisfaction: 3 },
  { id: 'sr_0016', reference: 'SR-2026-0016', category: 'water',           title: 'Well collapse risk',                    description: 'Communal well walls cracking, risk of collapse — 80 households depend on it.',     reporterName: 'Headman Chari', reporterPhone: '+263776677889', ward: 'Bota',   lat: -20.2030, lng: 31.5790, status: 'open',       priority: 'critical', slaHours: 12, createdAt: '2026-04-16T04:30:00Z' },
  { id: 'sr_0017', reference: 'SR-2026-0017', category: 'road',            title: 'Missing road sign',                     description: 'Stop sign removed at junction — accident risk.',                                    reporterName: 'Cllr. Chari',   reporterPhone: '+263777788990', ward: 'Mupani', lat: -20.1760, lng: 31.5518, status: 'assigned',   assignedTeam: 'Roads',                priority: 'high',     slaHours: 24, createdAt: '2026-04-15T11:00:00Z' },
  { id: 'sr_0018', reference: 'SR-2026-0018', category: 'drainage',        title: 'Clogged culvert under bridge',          description: 'Culvert under school bridge blocked by debris; upstream pooling.',                 reporterName: 'Mrs Zvomuya',   reporterPhone: '+263778899001', ward: 'Chikuku', lat: -20.1290, lng: 31.6466, status: 'in-progress', assignedTeam: 'Water & Sanitation',   priority: 'normal',   slaHours: 72, createdAt: '2026-04-11T07:35:00Z' },
  { id: 'sr_0019', reference: 'SR-2026-0019', category: 'health',          title: 'Mosquito breeding site',                description: 'Stagnant pool on abandoned stand; dense mosquito activity.',                        reporterName: 'Clinic Sister', reporterPhone: '+263779900112', ward: 'Nyika',   lat: -20.0848, lng: 31.6150, status: 'assigned',   assignedTeam: 'Public Health',        priority: 'normal',   slaHours: 72, createdAt: '2026-04-13T15:20:00Z' },
  { id: 'sr_0020', reference: 'SR-2026-0020', category: 'refuse',          title: 'Refuse truck not arrived',              description: 'Weekly truck missed for Chikwanda central — spec SLA breached.',                    reporterName: 'Stand 452',     reporterPhone: '+263770011223', ward: 'Chikwanda', lat: -20.1082, lng: 31.6770, status: 'open',       priority: 'normal',   slaHours: 72, createdAt: '2026-04-09T09:00:00Z' },
  { id: 'sr_0021', reference: 'SR-2026-0021', category: 'illegal-structure', title: 'Unauthorised boundary wall',           description: 'Wall built beyond stand boundary onto road reserve.',                              reporterName: 'Neighbour',     reporterPhone: '+263771122445', ward: 'Mupani', lat: -20.1740, lng: 31.5440, status: 'in-progress', assignedTeam: 'Urban Planning',       priority: 'low',      slaHours: 120, createdAt: '2026-04-06T12:45:00Z' },
  { id: 'sr_0022', reference: 'SR-2026-0022', category: 'streetlight',     title: 'Streetlight timer failure',             description: 'Lights stuck on during the day — wasting power.',                                  reporterName: 'ZESA rep',      reporterPhone: '+263772233556', ward: 'Nhema',  lat: -20.0510, lng: 31.7085, status: 'resolved',   assignedTeam: 'Electrical',           priority: 'low',      slaHours: 96, createdAt: '2026-04-04T17:00:00Z', resolvedAt: '2026-04-08T09:30:00Z', satisfaction: 4 },
  { id: 'sr_0023', reference: 'SR-2026-0023', category: 'water',           title: 'Cholera outbreak concern',              description: 'Clinic reports uptick in diarrhoea cases, suspect contaminated source.',            reporterName: 'Dr Ndlovu',     reporterPhone: '+263773344667', ward: 'Chikwanda', lat: -20.1105, lng: 31.6745, status: 'assigned',   assignedTeam: 'Public Health',        priority: 'critical', slaHours: 8, createdAt: '2026-04-16T02:40:00Z' },
  { id: 'sr_0024', reference: 'SR-2026-0024', category: 'road',            title: 'Bus stop shelter damaged',              description: 'Shelter roof blown off in last storm.',                                            reporterName: 'Mrs Mugari',    reporterPhone: '+263774455778', ward: 'Bota',   lat: -20.1960, lng: 31.5680, status: 'reopened',   assignedTeam: 'Roads',                priority: 'low',      slaHours: 120, createdAt: '2026-04-02T08:20:00Z' },
  { id: 'sr_0025', reference: 'SR-2026-0025', category: 'drainage',        title: 'Pit toilet overflow — clinic',          description: 'Clinic staff pit toilet overflowing, sanitation urgent.',                          reporterName: 'Sr Takaindisa', reporterPhone: '+263775566889', ward: 'Chikuku', lat: -20.1275, lng: 31.6445, status: 'assigned',   assignedTeam: 'Public Health',        priority: 'high',     slaHours: 24, createdAt: '2026-04-14T13:00:00Z' },
];

export function slaHealth(req: ServiceRequest, now: Date = new Date()): SlaHealth {
  if (req.resolvedAt) return 'on-track';
  const ageHr = (now.getTime() - new Date(req.createdAt).getTime()) / 36e5;
  if (ageHr > req.slaHours) return 'breached';
  if (ageHr > req.slaHours * 0.8) return 'at-risk';
  return 'on-track';
}

export const TEAM_LIST = TEAMS;
