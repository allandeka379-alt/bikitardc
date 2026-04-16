// ─────────────────────────────────────────────
// Sample general-ledger journal entries. Each
// entry is a balanced pair of debit/credit postings
// referencing the GL chart of accounts.
//
// The fixture purposely covers a mix of sources
// (billing runs, payroll, supplier payments,
// depreciation) so the GL detail view has enough
// variety to showcase filters.
// ─────────────────────────────────────────────

export interface GlEntryLine {
  accountCode: string;
  debitUsd: number;
  creditUsd: number;
  memo: string;
}

export interface GlEntry {
  id: string;
  date: string; // ISO
  reference: string;
  source: 'billing' | 'payroll' | 'ap' | 'ar' | 'manual' | 'depreciation' | 'bank';
  description: string;
  lines: GlEntryLine[];
  postedBy: string;
}

export const GL_ENTRIES: GlEntry[] = [
  // Billing run postings — April rates
  {
    id: 'je_000101',
    date: '2026-04-01',
    reference: 'BRDC-BR-2026-04-RATES',
    source: 'billing',
    description: 'April property rates billing run — 4,128 accounts',
    postedBy: 'Mai Moyo',
    lines: [
      { accountCode: '1140', debitUsd: 184_220, creditUsd: 0,       memo: 'Debit rates debtors' },
      { accountCode: '4100', debitUsd: 0,       creditUsd: 184_220, memo: 'Credit property rates revenue' },
    ],
  },
  {
    id: 'je_000102',
    date: '2026-04-02',
    reference: 'BRDC-BR-2026-04-UTAX',
    source: 'billing',
    description: 'April unit tax billing run — 2,750 accounts',
    postedBy: 'Mai Moyo',
    lines: [
      { accountCode: '1130', debitUsd: 41_250, creditUsd: 0,      memo: 'Debit receivables (unit tax)' },
      { accountCode: '4110', debitUsd: 0,      creditUsd: 41_250, memo: 'Credit unit tax revenue' },
    ],
  },

  // Mobile-money receipt (daily sweep)
  {
    id: 'je_000103',
    date: '2026-04-05',
    reference: 'ECO-SETTLEMENT-20260405',
    source: 'bank',
    description: 'EcoCash daily settlement — 284 rate payments',
    postedBy: 'System',
    lines: [
      { accountCode: '1110', debitUsd: 12_840, creditUsd: 0,      memo: 'Debit cash at bank (EcoCash)' },
      { accountCode: '1140', debitUsd: 0,      creditUsd: 12_840, memo: 'Credit rates debtors' },
    ],
  },
  {
    id: 'je_000104',
    date: '2026-04-05',
    reference: 'PAYNOW-SETTLEMENT-20260405',
    source: 'bank',
    description: 'Paynow daily settlement — 61 transactions',
    postedBy: 'System',
    lines: [
      { accountCode: '1110', debitUsd: 4_120, creditUsd: 0,     memo: 'Debit cash at bank (Paynow)' },
      { accountCode: '1140', debitUsd: 0,     creditUsd: 4_120, memo: 'Credit rates debtors' },
    ],
  },

  // Fuel supplier invoice
  {
    id: 'je_000105',
    date: '2026-04-06',
    reference: 'INV-ZTS-20260406',
    source: 'ap',
    description: 'Zuva Total Services — bulk diesel for fleet',
    postedBy: 'N. Chigariro',
    lines: [
      { accountCode: '6100', debitUsd: 3_840, creditUsd: 0,     memo: 'Debit fuel & lubricants' },
      { accountCode: '2110', debitUsd: 0,     creditUsd: 3_840, memo: 'Credit trade payables' },
    ],
  },

  // Monthly payroll
  {
    id: 'je_000106',
    date: '2026-04-25',
    reference: 'PAYROLL-202604',
    source: 'payroll',
    description: 'April 2026 payroll — 142 staff',
    postedBy: 'HR / Finance batch',
    lines: [
      { accountCode: '5100', debitUsd: 31_120, creditUsd: 0,      memo: 'Gross salaries' },
      { accountCode: '5200', debitUsd:  3_210, creditUsd: 0,      memo: 'Allowances' },
      { accountCode: '5300', debitUsd:  2_060, creditUsd: 0,      memo: 'Employer NSSA/NEC' },
      { accountCode: '2130', debitUsd: 0,      creditUsd:  3_420, memo: 'PAYE withheld' },
      { accountCode: '2140', debitUsd: 0,      creditUsd:  2_030, memo: 'NSSA withheld' },
      { accountCode: '2150', debitUsd: 0,      creditUsd:  1_120, memo: 'NEC withheld' },
      { accountCode: '1110', debitUsd: 0,      creditUsd: 29_820, memo: 'Net pay disbursed' },
    ],
  },

  // Beer hall deposit
  {
    id: 'je_000107',
    date: '2026-03-31',
    reference: 'BEER-MUP-202603',
    source: 'ar',
    description: 'Mupani beer hall — March 2026 takings deposited',
    postedBy: 'T. Ngwena',
    lines: [
      { accountCode: '1110', debitUsd: 14_820, creditUsd: 0,      memo: 'Debit cash at bank' },
      { accountCode: '4320', debitUsd: 0,      creditUsd: 14_820, memo: 'Credit beer hall revenue' },
    ],
  },

  // CAMPFIRE offtake fee
  {
    id: 'je_000108',
    date: '2026-04-01',
    reference: 'CAMPFIRE-BOTA-LEO-001',
    source: 'ar',
    description: 'CAMPFIRE leopard off-take levy — Bota ward',
    postedBy: 'Runako Zengeya',
    lines: [
      { accountCode: '1110', debitUsd: 4_200, creditUsd: 0,     memo: 'Debit cash at bank' },
      { accountCode: '4400', debitUsd: 0,     creditUsd: 4_200, memo: 'Credit CAMPFIRE levy revenue' },
    ],
  },

  // Depreciation (monthly run)
  {
    id: 'je_000109',
    date: '2026-03-31',
    reference: 'DEPR-202603',
    source: 'depreciation',
    description: 'Monthly depreciation charge',
    postedBy: 'System',
    lines: [
      { accountCode: '9100', debitUsd: 1_420, creditUsd: 0,     memo: 'Depreciation — buildings' },
      { accountCode: '9200', debitUsd:   820, creditUsd: 0,     memo: 'Depreciation — vehicles' },
      { accountCode: '9300', debitUsd: 1_100, creditUsd: 0,     memo: 'Depreciation — plant' },
      { accountCode: '9400', debitUsd:   115, creditUsd: 0,     memo: 'Depreciation — office equipment' },
      { accountCode: '1590', debitUsd: 0,     creditUsd: 3_455, memo: 'Accumulated depreciation' },
    ],
  },

  // Ward dividend transfer
  {
    id: 'je_000110',
    date: '2026-04-04',
    reference: 'CAMPFIRE-DIV-NYIKA-Q1',
    source: 'manual',
    description: 'CAMPFIRE Q1 dividend transfer — Nyika ward',
    postedBy: 'N. Chigariro',
    lines: [
      { accountCode: '7100', debitUsd: 2_075, creditUsd: 0,     memo: 'Ward dividend expense' },
      { accountCode: '1110', debitUsd: 0,     creditUsd: 2_075, memo: 'Credit cash at bank' },
    ],
  },
];

export function entriesForAccount(accountCode: string): GlEntry[] {
  return GL_ENTRIES.filter((e) => e.lines.some((l) => l.accountCode === accountCode));
}

export const SOURCE_LABEL: Record<GlEntry['source'], string> = {
  billing:      'Billing run',
  payroll:      'Payroll',
  ap:           'Accounts payable',
  ar:           'Accounts receivable',
  manual:       'Manual journal',
  depreciation: 'Depreciation',
  bank:         'Bank receipt',
};
