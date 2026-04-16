// ─────────────────────────────────────────────
// Employee master — every council staff member
// with their grade, basic pay, department, ID
// numbers (national / NSSA / NEC / PAYE) and
// current employment status.
//
// Grades follow the ZLGA salary grid which the
// Ministry of Local Government uses for rural
// district councils.
// ─────────────────────────────────────────────

export type EmploymentStatus = 'active' | 'probation' | 'on-leave' | 'suspended' | 'separated';

export type Department =
  | 'executive'
  | 'finance'
  | 'revenue'
  | 'engineering'
  | 'works'
  | 'water-sanitation'
  | 'social-services'
  | 'hr'
  | 'it'
  | 'security';

export type Grade =
  | 'E1' | 'E2'        // Executive
  | 'D1' | 'D2' | 'D3' // Directors / managers
  | 'C1' | 'C2' | 'C3' // Officers / supervisors
  | 'B1' | 'B2' | 'B3' // Clerical
  | 'A1' | 'A2';       // Support / general hands

export interface Employee {
  id: string;
  employeeNumber: string;            // BRDC-EMP-0001
  fullName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;               // ISO
  nationalId: string;                // Zim national ID
  phone: string;
  email: string;
  address: string;
  department: Department;
  position: string;
  grade: Grade;
  basicMonthlyUsd: number;
  hiredAt: string;                   // ISO
  status: EmploymentStatus;
  nssaNumber: string;                // NSSA member number
  necNumber: string;                 // NEC membership
  paye: string;                      // ZIMRA BP number
  bank: string;
  bankAccount: string;               // last 4 visible
  reportsTo: string | null;          // employeeId
}

export const DEPARTMENT_LABEL: Record<Department, string> = {
  executive:         'Executive',
  finance:           'Finance',
  revenue:           'Revenue',
  engineering:       'Engineering',
  works:             'Works',
  'water-sanitation':'Water & sanitation',
  'social-services': 'Social services',
  hr:                'HR & admin',
  it:                'ICT',
  security:          'Security',
};

export const GRADE_LABEL: Record<Grade, string> = {
  E1: 'E1 — Chief Executive',
  E2: 'E2 — Chief Officer',
  D1: 'D1 — Director',
  D2: 'D2 — Deputy director',
  D3: 'D3 — Manager',
  C1: 'C1 — Senior officer',
  C2: 'C2 — Officer',
  C3: 'C3 — Supervisor',
  B1: 'B1 — Senior clerk',
  B2: 'B2 — Clerk',
  B3: 'B3 — Assistant',
  A1: 'A1 — General hand',
  A2: 'A2 — Support',
};

export const EMPLOYEES: Employee[] = [
  // Executive
  { id: 'e_001', employeeNumber: 'BRDC-EMP-0001', fullName: 'Eng. Tafadzwa Makoni',    gender: 'M', dateOfBirth: '1972-03-14', nationalId: '08-412814-Q-08', phone: '+263 77 100 0001', email: 'ceo@bikitardc.co.zw',     address: 'Chikwanda HQ',      department: 'executive',       position: 'Chief Executive Officer',      grade: 'E1', basicMonthlyUsd: 2800, hiredAt: '2015-03-16', status: 'active', nssaNumber: '30012345', necNumber: 'NEC-LG-100001', paye: 'BP-10012345', bank: 'CBZ Bank', bankAccount: '•••• 1001', reportsTo: null    },
  { id: 'e_002', employeeNumber: 'BRDC-EMP-0002', fullName: 'Nobert Chigariro',        gender: 'M', dateOfBirth: '1978-07-22', nationalId: '08-515226-B-08', phone: '+263 77 100 0002', email: 'cfo@bikitardc.co.zw',     address: 'Chikwanda HQ',      department: 'finance',         position: 'Chief Finance Officer',        grade: 'D1', basicMonthlyUsd: 2200, hiredAt: '2018-01-10', status: 'active', nssaNumber: '30012346', necNumber: 'NEC-LG-100002', paye: 'BP-10012346', bank: 'CBZ Bank', bankAccount: '•••• 1002', reportsTo: 'e_001' },
  { id: 'e_003', employeeNumber: 'BRDC-EMP-0003', fullName: 'Eng. Grace Mutema',       gender: 'F', dateOfBirth: '1980-11-05', nationalId: '08-621139-K-08', phone: '+263 77 100 0003', email: 'engineering@bikitardc.co.zw', address: 'Chikwanda HQ',  department: 'engineering',     position: 'Director of Engineering',      grade: 'D1', basicMonthlyUsd: 2100, hiredAt: '2019-06-01', status: 'active', nssaNumber: '30012347', necNumber: 'NEC-LG-100003', paye: 'BP-10012347', bank: 'CBZ Bank', bankAccount: '•••• 1003', reportsTo: 'e_001' },
  { id: 'e_004', employeeNumber: 'BRDC-EMP-0004', fullName: 'Rumbidzai Ndou',          gender: 'F', dateOfBirth: '1982-02-19', nationalId: '08-710842-T-08', phone: '+263 77 100 0004', email: 'hr@bikitardc.co.zw',      address: 'Chikwanda HQ',      department: 'hr',              position: 'Head of HR & Admin',           grade: 'D2', basicMonthlyUsd: 1800, hiredAt: '2020-02-17', status: 'active', nssaNumber: '30012348', necNumber: 'NEC-LG-100004', paye: 'BP-10012348', bank: 'CBZ Bank', bankAccount: '•••• 1004', reportsTo: 'e_001' },

  // Finance team
  { id: 'e_010', employeeNumber: 'BRDC-EMP-0010', fullName: 'Mai Moyo',                gender: 'F', dateOfBirth: '1986-09-12', nationalId: '08-813450-L-08', phone: '+263 77 100 0010', email: 'rates.clerk@bikitardc.co.zw', address: 'Chikwanda', department: 'revenue',         position: 'Rates Clerk',                  grade: 'B2', basicMonthlyUsd:  520, hiredAt: '2021-07-05', status: 'active', nssaNumber: '30020010', necNumber: 'NEC-LG-100010', paye: 'BP-10020010', bank: 'CBZ Bank', bankAccount: '•••• 1010', reportsTo: 'e_002' },
  { id: 'e_011', employeeNumber: 'BRDC-EMP-0011', fullName: 'Runako Zengeya',          gender: 'F', dateOfBirth: '1989-01-30', nationalId: '08-909210-D-08', phone: '+263 77 100 0011', email: 'zengeyar@bikitardc.co.zw', address: 'Chikwanda', department: 'revenue',         position: 'Assistant Rates Clerk',        grade: 'B3', basicMonthlyUsd:  420, hiredAt: '2023-04-03', status: 'active', nssaNumber: '30020011', necNumber: 'NEC-LG-100011', paye: 'BP-10020011', bank: 'ZB Bank',  bankAccount: '•••• 1011', reportsTo: 'e_002' },
  { id: 'e_012', employeeNumber: 'BRDC-EMP-0012', fullName: 'Taurai Chidziva',         gender: 'M', dateOfBirth: '1984-05-28', nationalId: '08-710124-M-08', phone: '+263 77 100 0012', email: 'chidzivat@bikitardc.co.zw', address: 'Chikwanda', department: 'finance',         position: 'Senior Accountant',            grade: 'C1', basicMonthlyUsd: 1150, hiredAt: '2019-10-14', status: 'active', nssaNumber: '30020012', necNumber: 'NEC-LG-100012', paye: 'BP-10020012', bank: 'CBZ Bank', bankAccount: '•••• 1012', reportsTo: 'e_002' },
  { id: 'e_013', employeeNumber: 'BRDC-EMP-0013', fullName: 'Patience Dube',           gender: 'F', dateOfBirth: '1990-08-17', nationalId: '08-822199-P-08', phone: '+263 77 100 0013', email: 'dubep@bikitardc.co.zw',   address: 'Chikwanda',      department: 'finance',         position: 'Payroll Officer',              grade: 'C2', basicMonthlyUsd:  920, hiredAt: '2022-01-12', status: 'active', nssaNumber: '30020013', necNumber: 'NEC-LG-100013', paye: 'BP-10020013', bank: 'CBZ Bank', bankAccount: '•••• 1013', reportsTo: 'e_002' },

  // Engineering + Works
  { id: 'e_020', employeeNumber: 'BRDC-EMP-0020', fullName: 'Eng. Munashe Gwatidzo',  gender: 'M', dateOfBirth: '1983-06-11', nationalId: '08-701155-R-08', phone: '+263 77 100 0020', email: 'gwatidzom@bikitardc.co.zw', address: 'Chikwanda',  department: 'engineering',     position: 'Roads Engineer',               grade: 'C1', basicMonthlyUsd: 1250, hiredAt: '2020-09-07', status: 'active', nssaNumber: '30030020', necNumber: 'NEC-LG-100020', paye: 'BP-10030020', bank: 'Stanbic',  bankAccount: '•••• 1020', reportsTo: 'e_003' },
  { id: 'e_021', employeeNumber: 'BRDC-EMP-0021', fullName: 'Fortune Marimo',          gender: 'M', dateOfBirth: '1975-12-02', nationalId: '08-604512-C-08', phone: '+263 77 100 0021', email: 'marimof@bikitardc.co.zw', address: 'Works yard',   department: 'works',           position: 'Works Foreman',                grade: 'C3', basicMonthlyUsd:  780, hiredAt: '2011-04-18', status: 'active', nssaNumber: '30030021', necNumber: 'NEC-LG-100021', paye: 'BP-10030021', bank: 'CBZ Bank', bankAccount: '•••• 1021', reportsTo: 'e_020' },
  { id: 'e_022', employeeNumber: 'BRDC-EMP-0022', fullName: 'Wellington Charamba',    gender: 'M', dateOfBirth: '1980-04-20', nationalId: '08-712810-N-08', phone: '+263 77 100 0022', email: 'charambaw@bikitardc.co.zw', address: 'Works yard', department: 'works',           position: 'Grader operator',              grade: 'B2', basicMonthlyUsd:  540, hiredAt: '2014-07-22', status: 'active', nssaNumber: '30030022', necNumber: 'NEC-LG-100022', paye: 'BP-10030022', bank: 'ZB Bank',  bankAccount: '•••• 1022', reportsTo: 'e_021' },
  { id: 'e_023', employeeNumber: 'BRDC-EMP-0023', fullName: 'Tendai Chirwa',           gender: 'M', dateOfBirth: '1978-11-14', nationalId: '08-701811-J-08', phone: '+263 77 100 0023', email: 'chirwat@bikitardc.co.zw', address: 'Works yard',   department: 'works',           position: 'Backhoe operator',             grade: 'B2', basicMonthlyUsd:  540, hiredAt: '2013-02-10', status: 'active', nssaNumber: '30030023', necNumber: 'NEC-LG-100023', paye: 'BP-10030023', bank: 'ZB Bank',  bankAccount: '•••• 1023', reportsTo: 'e_021' },
  { id: 'e_024', employeeNumber: 'BRDC-EMP-0024', fullName: 'Munyaradzi Zvobgo',       gender: 'M', dateOfBirth: '1985-02-28', nationalId: '08-731220-Z-08', phone: '+263 77 100 0024', email: 'zvobgom@bikitardc.co.zw', address: 'Works yard',   department: 'works',           position: 'Driver',                       grade: 'B3', basicMonthlyUsd:  460, hiredAt: '2017-05-03', status: 'active', nssaNumber: '30030024', necNumber: 'NEC-LG-100024', paye: 'BP-10030024', bank: 'Stanbic',  bankAccount: '•••• 1024', reportsTo: 'e_021' },
  { id: 'e_025', employeeNumber: 'BRDC-EMP-0025', fullName: 'Blessing Mpofu',          gender: 'M', dateOfBirth: '1992-06-08', nationalId: '08-901201-L-08', phone: '+263 77 100 0025', email: 'mpofub@bikitardc.co.zw',  address: 'Works yard',      department: 'works',           position: 'Mechanic',                     grade: 'B2', basicMonthlyUsd:  560, hiredAt: '2021-11-15', status: 'active', nssaNumber: '30030025', necNumber: 'NEC-LG-100025', paye: 'BP-10030025', bank: 'CBZ Bank', bankAccount: '•••• 1025', reportsTo: 'e_021' },

  // Water & sanitation
  { id: 'e_030', employeeNumber: 'BRDC-EMP-0030', fullName: 'Edgar Chimwemwe',         gender: 'M', dateOfBirth: '1981-10-18', nationalId: '08-712330-M-08', phone: '+263 77 100 0030', email: 'chimwemwee@bikitardc.co.zw', address: 'Mupani',     department: 'water-sanitation',position: 'Water Superintendent',         grade: 'C2', basicMonthlyUsd:  920, hiredAt: '2016-08-01', status: 'active', nssaNumber: '30040030', necNumber: 'NEC-LG-100030', paye: 'BP-10040030', bank: 'CBZ Bank', bankAccount: '•••• 1030', reportsTo: 'e_003' },
  { id: 'e_031', employeeNumber: 'BRDC-EMP-0031', fullName: 'Stephen Maseko',          gender: 'M', dateOfBirth: '1976-04-05', nationalId: '08-614500-S-08', phone: '+263 77 100 0031', email: 'masekos@bikitardc.co.zw',  address: 'Mupani',          department: 'water-sanitation',position: 'Plumber',                      grade: 'B2', basicMonthlyUsd:  540, hiredAt: '2012-09-13', status: 'active', nssaNumber: '30040031', necNumber: 'NEC-LG-100031', paye: 'BP-10040031', bank: 'ZB Bank',  bankAccount: '•••• 1031', reportsTo: 'e_030' },
  { id: 'e_032', employeeNumber: 'BRDC-EMP-0032', fullName: 'Chipo Mashava',           gender: 'F', dateOfBirth: '1988-12-22', nationalId: '08-812345-A-08', phone: '+263 77 100 0032', email: 'mashavac@bikitardc.co.zw', address: 'Mupani',          department: 'water-sanitation',position: 'Water Quality Officer',        grade: 'C3', basicMonthlyUsd:  720, hiredAt: '2020-06-18', status: 'on-leave', nssaNumber: '30040032', necNumber: 'NEC-LG-100032', paye: 'BP-10040032', bank: 'CBZ Bank', bankAccount: '•••• 1032', reportsTo: 'e_030' },

  // Social services
  { id: 'e_040', employeeNumber: 'BRDC-EMP-0040', fullName: 'Anna Makuwaza',           gender: 'F', dateOfBirth: '1983-05-14', nationalId: '08-711122-K-08', phone: '+263 77 100 0040', email: 'makuwazaa@bikitardc.co.zw', address: 'Nhema',        department: 'social-services', position: 'Social Development Officer',   grade: 'C2', basicMonthlyUsd:  880, hiredAt: '2017-03-20', status: 'active', nssaNumber: '30050040', necNumber: 'NEC-LG-100040', paye: 'BP-10050040', bank: 'CBZ Bank', bankAccount: '•••• 1040', reportsTo: 'e_004' },
  { id: 'e_041', employeeNumber: 'BRDC-EMP-0041', fullName: 'Lovemore Chinyani',       gender: 'M', dateOfBirth: '1977-08-09', nationalId: '08-651111-P-08', phone: '+263 77 100 0041', email: 'chinyanil@bikitardc.co.zw', address: 'Silveira',      department: 'revenue',         position: 'Beer Hall Manager — Silveira', grade: 'B1', basicMonthlyUsd:  620, hiredAt: '2015-10-01', status: 'active', nssaNumber: '30050041', necNumber: 'NEC-LG-100041', paye: 'BP-10050041', bank: 'ZB Bank',  bankAccount: '•••• 1041', reportsTo: 'e_002' },
  { id: 'e_042', employeeNumber: 'BRDC-EMP-0042', fullName: 'Tichaona Ngwena',         gender: 'M', dateOfBirth: '1980-07-11', nationalId: '08-710500-R-08', phone: '+263 77 100 0042', email: 'ngwenat@bikitardc.co.zw',  address: 'Mupani',          department: 'revenue',         position: 'Beer Hall Manager — Mupani',   grade: 'B1', basicMonthlyUsd:  620, hiredAt: '2014-02-25', status: 'active', nssaNumber: '30050042', necNumber: 'NEC-LG-100042', paye: 'BP-10050042', bank: 'CBZ Bank', bankAccount: '•••• 1042', reportsTo: 'e_002' },

  // ICT
  { id: 'e_050', employeeNumber: 'BRDC-EMP-0050', fullName: 'Kudakwashe Njanji',       gender: 'M', dateOfBirth: '1987-03-27', nationalId: '08-820100-Q-08', phone: '+263 77 100 0050', email: 'njanjik@bikitardc.co.zw',  address: 'Chikwanda',      department: 'it',              position: 'ICT Officer',                  grade: 'C1', basicMonthlyUsd: 1080, hiredAt: '2022-03-01', status: 'active', nssaNumber: '30060050', necNumber: 'NEC-LG-100050', paye: 'BP-10060050', bank: 'Stanbic',  bankAccount: '•••• 1050', reportsTo: 'e_001' },

  // Security
  { id: 'e_060', employeeNumber: 'BRDC-EMP-0060', fullName: 'Langton Kuchena',         gender: 'M', dateOfBirth: '1970-10-12', nationalId: '08-512011-H-08', phone: '+263 77 100 0060', email: 'kuchenal@bikitardc.co.zw', address: 'Chikwanda',      department: 'security',        position: 'Head of Security',             grade: 'B1', basicMonthlyUsd:  560, hiredAt: '2010-04-07', status: 'active', nssaNumber: '30070060', necNumber: 'NEC-LG-100060', paye: 'BP-10070060', bank: 'ZB Bank',  bankAccount: '•••• 1060', reportsTo: 'e_004' },
  { id: 'e_061', employeeNumber: 'BRDC-EMP-0061', fullName: 'Robert Hove',             gender: 'M', dateOfBirth: '1974-06-03', nationalId: '08-610432-B-08', phone: '+263 77 100 0061', email: 'hover@bikitardc.co.zw',    address: 'Chikwanda',       department: 'security',        position: 'Guard',                        grade: 'A1', basicMonthlyUsd:  310, hiredAt: '2013-11-08', status: 'active', nssaNumber: '30070061', necNumber: 'NEC-LG-100061', paye: 'BP-10070061', bank: 'CBZ Bank', bankAccount: '•••• 1061', reportsTo: 'e_060' },

  // General hands / support
  { id: 'e_070', employeeNumber: 'BRDC-EMP-0070', fullName: 'Mary Matondo',            gender: 'F', dateOfBirth: '1979-01-24', nationalId: '08-660221-L-08', phone: '+263 77 100 0070', email: 'matondom@bikitardc.co.zw', address: 'Chikwanda',      department: 'hr',              position: 'Office Assistant',             grade: 'A2', basicMonthlyUsd:  320, hiredAt: '2012-03-01', status: 'active', nssaNumber: '30080070', necNumber: 'NEC-LG-100070', paye: 'BP-10080070', bank: 'ZB Bank',  bankAccount: '•••• 1070', reportsTo: 'e_004' },
  { id: 'e_071', employeeNumber: 'BRDC-EMP-0071', fullName: 'Memory Zhou',             gender: 'F', dateOfBirth: '1985-09-30', nationalId: '08-722212-D-08', phone: '+263 77 100 0071', email: 'zhoum@bikitardc.co.zw',    address: 'Chikwanda',       department: 'hr',              position: 'Cleaner',                      grade: 'A1', basicMonthlyUsd:  290, hiredAt: '2019-01-15', status: 'active', nssaNumber: '30080071', necNumber: 'NEC-LG-100071', paye: 'BP-10080071', bank: 'CBZ Bank', bankAccount: '•••• 1071', reportsTo: 'e_070' },
];

export const ACTIVE_COUNT = EMPLOYEES.filter((e) => e.status === 'active').length;
export const TOTAL_MONTHLY_GROSS = EMPLOYEES
  .filter((e) => e.status !== 'separated')
  .reduce((s, e) => s + e.basicMonthlyUsd, 0);

export function findEmployee(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id);
}

export function employeesByDepartment(): Record<Department, Employee[]> {
  const out = {} as Record<Department, Employee[]>;
  for (const e of EMPLOYEES) {
    (out[e.department] ||= []).push(e);
  }
  return out;
}

export const STATUS_LABEL: Record<EmploymentStatus, string> = {
  active:     'Active',
  probation:  'Probation',
  'on-leave': 'On leave',
  suspended:  'Suspended',
  separated:  'Separated',
};

export const STATUS_TONE: Record<EmploymentStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  active:     'success',
  probation:  'info',
  'on-leave': 'warning',
  suspended:  'danger',
  separated:  'neutral',
};
