// ─────────────────────────────────────────────
// Bank accounts held by the council + recent
// statement lines that need reconciliation against
// the general ledger.
//
// Powers /erp/finance/bank-reconciliation (a
// richer sibling of the existing payments
// reconciliation queue).
// ─────────────────────────────────────────────

export type BankAccountKind = 'operations' | 'revenue-collection' | 'capital' | 'campfire' | 'payroll';

export interface BankAccount {
  id: string;
  bank: string;
  branch: string;
  accountNumber: string;    // last 4 visible only
  kind: BankAccountKind;
  glAccount: string;        // GL account code used for this bank
  currentBalanceUsd: number;
  reconciledBalanceUsd: number;
  lastStatementAt: string;  // ISO
}

export interface StatementLine {
  id: string;
  accountId: string;
  postedAt: string;         // ISO
  reference: string;        // bank reference
  description: string;
  debitUsd: number;         // money OUT of the account
  creditUsd: number;        // money INTO the account
  /** null until reconciled; otherwise points to a GL entry id. */
  matchedJournalId: string | null;
  /** Suggested GL entry (heuristic). */
  suggestedMatch?: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba_cbz_ops',
    bank: 'CBZ Bank',
    branch: 'Masvingo',
    accountNumber: '•••• 4821',
    kind: 'operations',
    glAccount: '1110',
    currentBalanceUsd: 288_310,
    reconciledBalanceUsd: 283_190,
    lastStatementAt: '2026-04-16',
  },
  {
    id: 'ba_cbz_rev',
    bank: 'CBZ Bank',
    branch: 'Masvingo',
    accountNumber: '•••• 7142',
    kind: 'revenue-collection',
    glAccount: '1110',
    currentBalanceUsd: 58_420,
    reconciledBalanceUsd: 58_420,
    lastStatementAt: '2026-04-16',
  },
  {
    id: 'ba_stanbic_cap',
    bank: 'Stanbic Bank',
    branch: 'Masvingo',
    accountNumber: '•••• 1084',
    kind: 'capital',
    glAccount: '1110',
    currentBalanceUsd: 92_110,
    reconciledBalanceUsd: 92_110,
    lastStatementAt: '2026-04-15',
  },
  {
    id: 'ba_zb_campfire',
    bank: 'ZB Bank',
    branch: 'Masvingo',
    accountNumber: '•••• 6255',
    kind: 'campfire',
    glAccount: '1110',
    currentBalanceUsd: 38_940,
    reconciledBalanceUsd: 38_940,
    lastStatementAt: '2026-04-10',
  },
  {
    id: 'ba_nmb_payroll',
    bank: 'NMB Bank',
    branch: 'Masvingo',
    accountNumber: '•••• 3377',
    kind: 'payroll',
    glAccount: '1110',
    currentBalanceUsd: 22_100,
    reconciledBalanceUsd: 22_100,
    lastStatementAt: '2026-04-14',
  },
];

// Unreconciled statement lines — these drive the queue.
export const STATEMENT_LINES: StatementLine[] = [
  // Operations account — 3 unreconciled
  { id: 'sl_001', accountId: 'ba_cbz_ops', postedAt: '2026-04-14', reference: 'FT20260414-01829',  description: 'EFT Solarez Zimbabwe',       debitUsd:  4_820, creditUsd: 0,       matchedJournalId: null, suggestedMatch: 'inv_sz_01' },
  { id: 'sl_002', accountId: 'ba_cbz_ops', postedAt: '2026-04-15', reference: 'FT20260415-00812',  description: 'Receipt — Masvingo Civil refund', debitUsd: 0, creditUsd: 1_200, matchedJournalId: null },
  { id: 'sl_003', accountId: 'ba_cbz_ops', postedAt: '2026-04-16', reference: 'CHG-BANK-0416',    description: 'Monthly bank charges',       debitUsd:     95, creditUsd: 0,       matchedJournalId: null },

  // Revenue collection — all posted via daily sweep (reconciled), nothing outstanding
  // Capital — 1 deposit awaiting grant letter
  { id: 'sl_010', accountId: 'ba_stanbic_cap', postedAt: '2026-04-12', reference: 'CREDIT-MoLGPW', description: 'Grant — Min. of Local Govt (road grant)', debitUsd: 0, creditUsd: 82_400, matchedJournalId: null },

  // CAMPFIRE — 2 unreconciled
  { id: 'sl_020', accountId: 'ba_zb_campfire', postedAt: '2026-04-02', reference: 'BVUMBA-PAYMENT-0401', description: 'Bvumba Hunting — leopard levy', debitUsd: 0, creditUsd: 4_200, matchedJournalId: null, suggestedMatch: 'je_000108' },
  { id: 'sl_021', accountId: 'ba_zb_campfire', postedAt: '2026-04-04', reference: 'TRF-NYIKA-Q1',        description: 'CAMPFIRE dividend — Nyika',  debitUsd: 2_075, creditUsd: 0,    matchedJournalId: null, suggestedMatch: 'je_000110' },

  // Payroll — 0 outstanding (payroll settled same day)
];

export const KIND_LABEL: Record<BankAccountKind, string> = {
  operations:          'Operations',
  'revenue-collection':'Revenue collection',
  capital:             'Capital works',
  campfire:            'CAMPFIRE restricted',
  payroll:             'Payroll',
};

export function totalCashUsd(): number {
  return BANK_ACCOUNTS.reduce((s, a) => s + a.currentBalanceUsd, 0);
}

export function linesForAccount(accountId: string): StatementLine[] {
  return STATEMENT_LINES.filter((l) => l.accountId === accountId);
}

export function unreconciledCount(): number {
  return STATEMENT_LINES.filter((l) => !l.matchedJournalId).length;
}
