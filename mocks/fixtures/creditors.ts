// ─────────────────────────────────────────────
// Trade creditors — supplier master + open
// invoices outstanding to the council.
//
// Fed into /erp/finance/creditors. Each creditor
// has an aged balance; invoices link to the goods-
// and-services GL account they were coded to.
// ─────────────────────────────────────────────

export type CreditorCategory =
  | 'fuel'
  | 'maintenance'
  | 'utilities'
  | 'stationery'
  | 'it'
  | 'legal'
  | 'engineering'
  | 'construction'
  | 'other';

export interface Creditor {
  id: string;
  name: string;
  category: CreditorCategory;
  praz: string;             // PRAZ supplier registration number
  vat: string;              // ZIMRA VAT number
  email: string;
  phone: string;
  paymentTermsDays: number; // Net-30, Net-14 etc.
  /** Total open balance in USD. */
  openBalanceUsd: number;
}

export interface CreditorInvoice {
  id: string;
  creditorId: string;
  invoiceNumber: string;
  reference: string;        // our internal reference / PO
  issuedAt: string;         // ISO
  dueAt: string;
  totalUsd: number;
  paidUsd: number;
  glAccount: string;
  status: 'open' | 'part-paid' | 'paid' | 'disputed';
  /** ISO date of the GRV (goods received voucher). Required for three-way matching. */
  grvDate?: string;
}

export const CATEGORY_LABEL: Record<CreditorCategory, string> = {
  fuel:         'Fuel & lubricants',
  maintenance:  'Maintenance',
  utilities:    'Utilities',
  stationery:   'Stationery',
  it:           'IT & telecoms',
  legal:        'Legal & professional',
  engineering:  'Engineering',
  construction: 'Construction',
  other:        'Other',
};

export const CREDITORS: Creditor[] = [
  { id: 'cr_zuva',    name: 'Zuva Total Services',          category: 'fuel',         praz: 'PRAZ-0042-18', vat: '10012345', email: 'ap@zuvatotal.co.zw',   phone: '+263 4 700 100', paymentTermsDays: 30, openBalanceUsd:  3_840 },
  { id: 'cr_zesa',    name: 'ZESA Holdings',                category: 'utilities',    praz: 'PRAZ-0002-01', vat: '10000001', email: 'recv@zesa.co.zw',      phone: '+263 4 700 200', paymentTermsDays: 30, openBalanceUsd:  5_120 },
  { id: 'cr_telone',  name: 'TelOne',                       category: 'it',           praz: 'PRAZ-0002-05', vat: '10000005', email: 'ap@telone.co.zw',      phone: '+263 4 700 300', paymentTermsDays: 30, openBalanceUsd:  1_420 },
  { id: 'cr_econet',  name: 'Econet Business',              category: 'it',           praz: 'PRAZ-0081-09', vat: '10040081', email: 'business@econet.co.zw',phone: '+263 77 200 1000', paymentTermsDays: 14, openBalanceUsd:  1_820 },
  { id: 'cr_masvhard',name: 'Masvingo Hardware',            category: 'maintenance',  praz: 'PRAZ-0319-04', vat: '10017319', email: 'sales@masvhard.co.zw', phone: '+263 39 264 212', paymentTermsDays: 30, openBalanceUsd:  4_620 },
  { id: 'cr_kwekwe',  name: 'Kwekwe Tyre Services',         category: 'maintenance',  praz: 'PRAZ-0442-07', vat: '10024488', email: 'ap@kwetyre.co.zw',     phone: '+263 55 265 212', paymentTermsDays: 30, openBalanceUsd:    920 },
  { id: 'cr_willdoc', name: 'Willowvale Doc & Print',       category: 'stationery',   praz: 'PRAZ-0611-02', vat: '10032611', email: 'orders@willdoc.co.zw',phone: '+263 4 700 410', paymentTermsDays: 15, openBalanceUsd:    640 },
  { id: 'cr_gutu_law',name: 'Gutu & Associates Legal',      category: 'legal',        praz: 'PRAZ-0812-11', vat: '10041812', email: 'accounts@gutulaw.co.zw',phone: '+263 39 262 111', paymentTermsDays: 30, openBalanceUsd:  7_200 },
  { id: 'cr_masv_civ',name: 'Masvingo Civil Works',         category: 'construction', praz: 'PRAZ-1021-18', vat: '10052102', email: 'ap@masvcivil.co.zw',   phone: '+263 39 264 500', paymentTermsDays: 45, openBalanceUsd: 24_800 },
  { id: 'cr_solarez', name: 'Solarez Zimbabwe',             category: 'engineering',  praz: 'PRAZ-1218-22', vat: '10062181', email: 'ap@solarez.co.zw',     phone: '+263 4 700 600', paymentTermsDays: 30, openBalanceUsd: 28_500 },
];

export const CREDITOR_INVOICES: CreditorInvoice[] = [
  // Zuva fuel
  { id: 'inv_zuva_01', creditorId: 'cr_zuva',    invoiceNumber: 'ZTS-2026-00418', reference: 'PO-BRDC-2026-0091', issuedAt: '2026-04-06', dueAt: '2026-05-06', totalUsd: 3_840,  paidUsd: 0,     glAccount: '6100', status: 'open',      grvDate: '2026-04-06' },

  // ZESA
  { id: 'inv_zesa_01', creditorId: 'cr_zesa',    invoiceNumber: 'ZESA-20260331',  reference: 'UTIL-2026-03',     issuedAt: '2026-03-31', dueAt: '2026-04-30', totalUsd: 2_820,  paidUsd: 0,     glAccount: '6300', status: 'open',      grvDate: '2026-03-31' },
  { id: 'inv_zesa_02', creditorId: 'cr_zesa',    invoiceNumber: 'ZESA-20260228',  reference: 'UTIL-2026-02',     issuedAt: '2026-02-28', dueAt: '2026-03-31', totalUsd: 2_300,  paidUsd: 0,     glAccount: '6300', status: 'open',      grvDate: '2026-02-28' },

  // TelOne
  { id: 'inv_tel_01',  creditorId: 'cr_telone',  invoiceNumber: 'TO-2026-00812',  reference: 'COMMS-2026-03',    issuedAt: '2026-03-31', dueAt: '2026-04-30', totalUsd: 1_420,  paidUsd: 0,     glAccount: '6500', status: 'open',      grvDate: '2026-03-31' },

  // Econet
  { id: 'inv_eco_01',  creditorId: 'cr_econet',  invoiceNumber: 'EC-2026-01221',  reference: 'COMMS-2026-03-BLK',issuedAt: '2026-03-31', dueAt: '2026-04-14', totalUsd: 1_820,  paidUsd: 0,     glAccount: '6500', status: 'open',      grvDate: '2026-03-31' },

  // Masvingo Hardware
  { id: 'inv_mh_01',   creditorId: 'cr_masvhard',invoiceNumber: 'MH-2026-0244',   reference: 'PO-BRDC-2026-0087',issuedAt: '2026-04-08', dueAt: '2026-05-08', totalUsd: 2_320,  paidUsd: 0,     glAccount: '6200', status: 'open',      grvDate: '2026-04-08' },
  { id: 'inv_mh_02',   creditorId: 'cr_masvhard',invoiceNumber: 'MH-2026-0218',   reference: 'PO-BRDC-2026-0079',issuedAt: '2026-03-21', dueAt: '2026-04-21', totalUsd: 2_300,  paidUsd: 0,     glAccount: '6200', status: 'open',      grvDate: '2026-03-22' },

  // Kwekwe Tyres
  { id: 'inv_kw_01',   creditorId: 'cr_kwekwe',  invoiceNumber: 'KW-2026-0081',   reference: 'PO-BRDC-2026-0065',issuedAt: '2026-03-12', dueAt: '2026-04-11', totalUsd:   920,  paidUsd: 0,     glAccount: '6200', status: 'open',      grvDate: '2026-03-12' },

  // Willowvale
  { id: 'inv_wd_01',   creditorId: 'cr_willdoc', invoiceNumber: 'WD-2026-1022',   reference: 'PO-BRDC-2026-0081',issuedAt: '2026-04-04', dueAt: '2026-04-19', totalUsd:   640,  paidUsd: 0,     glAccount: '6400', status: 'open',      grvDate: '2026-04-04' },

  // Gutu Law — disputed
  { id: 'inv_gl_01',   creditorId: 'cr_gutu_law',invoiceNumber: 'GA-2026-041',    reference: 'LEGAL-NYIKA-DISP', issuedAt: '2026-03-18', dueAt: '2026-04-17', totalUsd: 7_200,  paidUsd: 0,     glAccount: '6600', status: 'disputed',  grvDate: '2026-03-18' },

  // Masvingo Civil — partly paid, carriageway works
  { id: 'inv_mc_01',   creditorId: 'cr_masv_civ',invoiceNumber: 'MCW-2026-0012',  reference: 'CAP-KAMUNGOMA-RD', issuedAt: '2026-02-15', dueAt: '2026-04-01', totalUsd: 120_000,paidUsd:95_200, glAccount: '1520', status: 'part-paid', grvDate: '2026-02-28' },

  // Solarez — street-lighting + rural electrification open invoices
  { id: 'inv_sz_01',   creditorId: 'cr_solarez', invoiceNumber: 'SZ-2026-00821',  reference: 'CAP-STREETLITE-01',issuedAt: '2026-04-02', dueAt: '2026-05-02', totalUsd: 14_800, paidUsd: 0,     glAccount: '1530', status: 'open',      grvDate: '2026-04-05' },
  { id: 'inv_sz_02',   creditorId: 'cr_solarez', invoiceNumber: 'SZ-2026-00843',  reference: 'CAP-RURAL-ELEC-02',issuedAt: '2026-04-10', dueAt: '2026-05-10', totalUsd: 13_700, paidUsd: 0,     glAccount: '1530', status: 'open' },
];

export function invoicesForCreditor(creditorId: string): CreditorInvoice[] {
  return CREDITOR_INVOICES.filter((i) => i.creditorId === creditorId);
}

/** Simple aging buckets based on today + dueAt. */
export function agingBuckets(today: Date = new Date('2026-04-17')): {
  current: number;
  d30: number;
  d60: number;
  d90plus: number;
} {
  const out = { current: 0, d30: 0, d60: 0, d90plus: 0 };
  for (const i of CREDITOR_INVOICES) {
    if (i.status === 'paid') continue;
    const open = i.totalUsd - i.paidUsd;
    const overdueDays = Math.floor((today.getTime() - new Date(i.dueAt).getTime()) / (1000 * 60 * 60 * 24));
    if (overdueDays <= 0) out.current += open;
    else if (overdueDays <= 30) out.d30 += open;
    else if (overdueDays <= 60) out.d60 += open;
    else out.d90plus += open;
  }
  return out;
}
