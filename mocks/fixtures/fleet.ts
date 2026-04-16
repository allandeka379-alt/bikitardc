// ─────────────────────────────────────────────
// Fleet — all council vehicles and heavy plant
// with operational state (fuel, mileage, service
// due, assigned driver).
//
// Each vehicle cross-references the Fixed Asset
// tag from fixtures/fixed-assets.ts for valuation.
// ─────────────────────────────────────────────

export type FleetKind = 'bakkie' | 'truck' | 'grader' | 'backhoe' | 'sedan' | 'generator';

export type FleetStatus = 'available' | 'in-use' | 'workshop' | 'off-road';

export interface FleetVehicle {
  id: string;
  assetTag: string;            // matches fixtures/fixed-assets
  reg: string;                 // "ABC 1234"
  kind: FleetKind;
  description: string;
  department: string;
  driver: string | null;       // current assigned driver
  odometer: number;            // km
  fuelPct: number;             // 0..100
  nextServiceAtKm: number;
  lastServiceAt: string;       // ISO
  licenceExpiry: string;       // ISO
  insuranceExpiry: string;     // ISO
  status: FleetStatus;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  refuelledAt: string;         // ISO
  litres: number;
  costUsd: number;
  odometer: number;
  station: string;
  clerk: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceDate: string;         // ISO
  kind: 'service' | 'repair' | 'inspection';
  description: string;
  costUsd: number;
  supplier: string;
}

export const KIND_LABEL: Record<FleetKind, string> = {
  bakkie:    'Bakkie',
  truck:     'Truck',
  grader:    'Motor grader',
  backhoe:   'Backhoe',
  sedan:     'Sedan',
  generator: 'Generator',
};

export const STATUS_LABEL: Record<FleetStatus, string> = {
  available: 'Available',
  'in-use':  'In use',
  workshop:  'In workshop',
  'off-road':'Off the road',
};

export const STATUS_TONE: Record<FleetStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  available: 'success',
  'in-use':  'info',
  workshop:  'warning',
  'off-road':'danger',
};

export const FLEET: FleetVehicle[] = [
  { id: 'v_001', assetTag: 'BRDC-VEH-001', reg: 'BIK 4500', kind: 'bakkie', description: 'Isuzu D-Max (CEO pool)',   department: 'Executive',       driver: 'Tendai Chirwa',       odometer: 82_420, fuelPct: 74, nextServiceAtKm: 85_000, lastServiceAt: '2026-02-14', licenceExpiry: '2026-09-30', insuranceExpiry: '2026-07-15', status: 'available' },
  { id: 'v_002', assetTag: 'BRDC-VEH-002', reg: 'BIK 4502', kind: 'bakkie', description: 'Toyota Hilux — Works',      department: 'Works',           driver: 'Munyaradzi Zvobgo',   odometer: 141_880, fuelPct: 22, nextServiceAtKm: 145_000, lastServiceAt: '2026-01-22', licenceExpiry: '2026-11-05', insuranceExpiry: '2026-10-20', status: 'in-use' },
  { id: 'v_003', assetTag: 'BRDC-VEH-003', reg: 'BIK 4504', kind: 'bakkie', description: 'Mahindra Bolero — Revenue', department: 'Revenue',         driver: 'Runako Zengeya',      odometer: 36_220, fuelPct: 58, nextServiceAtKm: 40_000, lastServiceAt: '2026-03-08', licenceExpiry: '2026-08-01', insuranceExpiry: '2026-06-30', status: 'in-use' },
  { id: 'v_004', assetTag: 'BRDC-VEH-004', reg: 'BIK 4506', kind: 'bakkie', description: 'Nissan Hardbody — Water',  department: 'Water & sanitation', driver: 'Stephen Maseko',      odometer: 209_440, fuelPct: 34, nextServiceAtKm: 212_000, lastServiceAt: '2026-02-28', licenceExpiry: '2026-05-12', insuranceExpiry: '2026-05-12', status: 'in-use' },
  { id: 'v_005', assetTag: 'BRDC-VEH-005', reg: 'BIK 4509', kind: 'truck',  description: 'Iveco 7T refuse truck',     department: 'Works',           driver: 'Wellington Charamba', odometer: 288_100, fuelPct: 45, nextServiceAtKm: 290_000, lastServiceAt: '2026-03-15', licenceExpiry: '2026-07-01', insuranceExpiry: '2026-07-01', status: 'in-use' },
  { id: 'v_010', assetTag: 'BRDC-PLT-001', reg: 'BIK P 001',kind: 'grader', description: 'CAT 120K motor grader',     department: 'Engineering',     driver: 'Wellington Charamba', odometer:  8_922, fuelPct: 18, nextServiceAtKm: 9_200, lastServiceAt: '2026-03-20', licenceExpiry: '2026-12-31', insuranceExpiry: '2026-12-31', status: 'in-use' },
  { id: 'v_011', assetTag: 'BRDC-PLT-002', reg: 'BIK P 002',kind: 'backhoe',description: 'JCB 3CX backhoe',           department: 'Engineering',     driver: 'Tendai Chirwa',       odometer:  4_560, fuelPct: 62, nextServiceAtKm: 5_000, lastServiceAt: '2026-01-29', licenceExpiry: '2026-12-31', insuranceExpiry: '2026-12-31', status: 'available' },
  { id: 'v_012', assetTag: 'BRDC-PLT-004', reg: '—',        kind: 'generator', description: 'Diesel generator 25 kVA (HQ)', department: 'ICT',   driver: null,                  odometer:       0, fuelPct: 88, nextServiceAtKm:      0, lastServiceAt: '2026-03-01', licenceExpiry: '—', insuranceExpiry: '2026-12-31', status: 'available' },
  { id: 'v_013', assetTag: 'BRDC-VEH-NEW',reg: 'BIK 4510', kind: 'sedan',  description: 'Toyota Corolla (auditor)', department: 'Finance',         driver: null,                  odometer:  12_480, fuelPct: 50, nextServiceAtKm: 15_000, lastServiceAt: '2026-02-10', licenceExpiry: '2026-06-30', insuranceExpiry: '2026-06-30', status: 'workshop' },
];

export const FUEL_LOGS: FuelLog[] = [
  { id: 'fl_001', vehicleId: 'v_005', refuelledAt: '2026-04-15', litres: 120, costUsd: 168, odometer: 288_100, station: 'Zuva Total Masvingo', clerk: 'Wellington Charamba' },
  { id: 'fl_002', vehicleId: 'v_002', refuelledAt: '2026-04-14', litres:  80, costUsd: 112, odometer: 141_820, station: 'Zuva Total Masvingo', clerk: 'Munyaradzi Zvobgo'    },
  { id: 'fl_003', vehicleId: 'v_004', refuelledAt: '2026-04-14', litres:  60, costUsd:  84, odometer: 209_400, station: 'Engen Bikita',        clerk: 'Stephen Maseko'       },
  { id: 'fl_004', vehicleId: 'v_010', refuelledAt: '2026-04-12', litres: 200, costUsd: 280, odometer:   8_870, station: 'Zuva Total Masvingo', clerk: 'Wellington Charamba' },
  { id: 'fl_005', vehicleId: 'v_001', refuelledAt: '2026-04-11', litres:  55, costUsd:  77, odometer:  82_400, station: 'Engen Bikita',        clerk: 'Tendai Chirwa'        },
  { id: 'fl_006', vehicleId: 'v_003', refuelledAt: '2026-04-10', litres:  45, costUsd:  63, odometer:  36_200, station: 'Engen Bikita',        clerk: 'Runako Zengeya'      },
];

export const MAINTENANCE_LOGS: MaintenanceLog[] = [
  { id: 'ml_001', vehicleId: 'v_005', serviceDate: '2026-03-15', kind: 'service',    description: 'Scheduled service + tyre rotation', costUsd:  380, supplier: 'Masvingo Auto Works' },
  { id: 'ml_002', vehicleId: 'v_010', serviceDate: '2026-03-20', kind: 'service',    description: 'Oil change + hydraulic filter',     costUsd:  620, supplier: 'CAT Service Centre' },
  { id: 'ml_003', vehicleId: 'v_013', serviceDate: '2026-04-08', kind: 'repair',     description: 'Gearbox overhaul',                  costUsd: 1_840, supplier: 'Masvingo Auto Works' },
  { id: 'ml_004', vehicleId: 'v_004', serviceDate: '2026-02-28', kind: 'service',    description: 'Brake pads + fuel filter',          costUsd:  215, supplier: 'Kwekwe Tyre Services' },
  { id: 'ml_005', vehicleId: 'v_001', serviceDate: '2026-02-14', kind: 'inspection', description: 'Annual VID roadworthiness',         costUsd:   40, supplier: 'VID Masvingo' },
];

export function logsForVehicle(id: string) {
  return {
    fuel:        FUEL_LOGS.filter((f) => f.vehicleId === id).sort((a, b) => (a.refuelledAt < b.refuelledAt ? 1 : -1)),
    maintenance: MAINTENANCE_LOGS.filter((m) => m.vehicleId === id).sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1)),
  };
}

export function findVehicle(id: string): FleetVehicle | undefined {
  return FLEET.find((v) => v.id === id);
}

export function totalsFleet() {
  const active = FLEET.filter((v) => v.status !== 'off-road');
  const fuelBelow25 = FLEET.filter((v) => v.fuelPct < 25).length;
  const serviceDue = FLEET.filter((v) => v.odometer >= v.nextServiceAtKm - 500 && v.nextServiceAtKm > 0).length;
  return { total: FLEET.length, active: active.length, fuelBelow25, serviceDue };
}
