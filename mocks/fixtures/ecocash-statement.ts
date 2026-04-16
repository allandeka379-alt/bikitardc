// ─────────────────────────────────────────────
// EcoCash merchant statement fixture
//
// Journey C step 6: "see split view of our
// transactions vs EcoCash statement, two rows in
// exceptions". We produce rows that mostly match
// our own transactions by reference + amount, and
// deliberately leave 2 unmatched on each side so
// the reconciliation view has exceptions to clear.
// ─────────────────────────────────────────────

export interface EcoCashRow {
  id: string;
  merchantRef: string;
  mobile: string;
  amountUsd: number;
  postedAt: string;
  ourReference?: string; // present when EcoCash stored our reference field
}

export const ECOCASH_ROWS: EcoCashRow[] = [
  // ── Matching rows (will auto-match to our TRANSACTIONS.ts) ──
  { id: 'ec_001', merchantRef: 'EC-40931',  mobile: '+263771234567', amountUsd:  87.50, postedAt: '2026-01-14T10:23:18Z', ourReference: 'BRDC-20260114-003412' },
  { id: 'ec_002', merchantRef: 'EC-41258',  mobile: '+263771234567', amountUsd:  87.50, postedAt: '2025-12-18T09:07:44Z', ourReference: 'BRDC-20251218-001184' },
  { id: 'ec_003', merchantRef: 'EC-42177',  mobile: '+263771234567', amountUsd: 108.00, postedAt: '2026-02-25T12:32:55Z', ourReference: 'BRDC-20260225-004132' },
  { id: 'ec_004', merchantRef: 'EC-42480',  mobile: '+263771234567', amountUsd: 108.00, postedAt: '2026-01-30T08:52:10Z', ourReference: 'BRDC-20260130-003902' },
  { id: 'ec_005', merchantRef: 'EC-42502',  mobile: '+263771234567', amountUsd:  45.00, postedAt: '2026-01-12T20:09:02Z', ourReference: 'BRDC-20260112-003709' },
  { id: 'ec_006', merchantRef: 'EC-42901',  mobile: '+263773456789', amountUsd:  55.00, postedAt: '2026-04-05T08:48:55Z', ourReference: 'BRDC-20260405-005211' },

  // ── Exception rows (unmatched on EcoCash side) ──
  // A resident sent money with the wrong narration.
  { id: 'ec_007', merchantRef: 'EC-43112',  mobile: '+263778901234', amountUsd:  87.50, postedAt: '2026-04-15T18:22:10Z' },
  // EcoCash posted a second attempt as a separate entry.
  { id: 'ec_008', merchantRef: 'EC-43115',  mobile: '+263778901234', amountUsd:  87.50, postedAt: '2026-04-15T18:22:45Z' },
];

/** Two of OUR transactions are "unmatched" on the other side — the user clears these manually. */
export const UNMATCHED_OUR_TX_IDS: readonly string[] = ['tx_000014'];
