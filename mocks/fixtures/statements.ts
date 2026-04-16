// ─────────────────────────────────────────────
// Statement line items per property
//
// Spec §3.1 requires itemised charges (rates, unit
// tax, development levy, refuse, interest) with
// plain-language explanations surfaced via tooltip.
// ─────────────────────────────────────────────

export type ChargeKind =
  | 'rates'
  | 'unit-tax'
  | 'development-levy'
  | 'refuse'
  | 'interest'
  | 'adjustment';

export interface StatementLine {
  id: string;
  propertyId: string;
  kind: ChargeKind;
  description: string;
  explainer: string;
  period: string; // human label, e.g. "Apr 2026"
  periodStart: string; // ISO
  amount: number; // positive = billed, negative = credit
}

const EXPLAIN: Record<ChargeKind, string> = {
  rates:
    'Quarterly property rates — funds roads, water, refuse and street lighting in your ward.',
  'unit-tax':
    'Unit tax levied per residential unit on the stand, set by council policy.',
  'development-levy':
    'Small per-property levy ring-fenced for capital works — boreholes, clinics, roads.',
  refuse:
    'Refuse collection charge for your refuse zone. Waived for agricultural and undeveloped stands.',
  interest:
    'Interest accrued on overdue balances. Clears automatically once the arrears are settled.',
  adjustment:
    'Credit or debit adjustment raised by the council (e.g. valuation revision, dispute resolution).',
};

function makeLines(
  propertyId: string,
  entries: Omit<StatementLine, 'id' | 'propertyId' | 'explainer'>[],
): StatementLine[] {
  return entries.map((e, i) => ({
    id: `sl_${propertyId}_${i.toString().padStart(3, '0')}`,
    propertyId,
    explainer: EXPLAIN[e.kind],
    ...e,
  }));
}

// ─── Stand 4521 — Tendai, Nyika (the Journey A property) ───
// April 2026 line items sum to $87.50 on top of prior periods.
const p_4521 = makeLines('p_4521', [
  // Apr 2026 — current outstanding
  { kind: 'rates',             description: 'Property rates',           period: 'Apr 2026', periodStart: '2026-04-01', amount:  55.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Apr 2026', periodStart: '2026-04-01', amount:  12.50 },
  { kind: 'refuse',            description: 'Refuse collection',        period: 'Apr 2026', periodStart: '2026-04-01', amount:  12.00 },
  { kind: 'unit-tax',          description: 'Unit tax — residential',   period: 'Apr 2026', periodStart: '2026-04-01', amount:   8.00 },

  // Mar 2026 — paid 14 Jan + later
  { kind: 'rates',             description: 'Property rates',           period: 'Mar 2026', periodStart: '2026-03-01', amount:  55.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Mar 2026', periodStart: '2026-03-01', amount:  12.50 },
  { kind: 'refuse',            description: 'Refuse collection',        period: 'Mar 2026', periodStart: '2026-03-01', amount:  12.00 },
  { kind: 'unit-tax',          description: 'Unit tax — residential',   period: 'Mar 2026', periodStart: '2026-03-01', amount:   8.00 },

  { kind: 'rates',             description: 'Property rates',           period: 'Feb 2026', periodStart: '2026-02-01', amount:  55.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Feb 2026', periodStart: '2026-02-01', amount:  12.50 },
  { kind: 'refuse',            description: 'Refuse collection',        period: 'Feb 2026', periodStart: '2026-02-01', amount:  12.00 },
  { kind: 'unit-tax',          description: 'Unit tax — residential',   period: 'Feb 2026', periodStart: '2026-02-01', amount:   8.00 },

  { kind: 'rates',             description: 'Property rates',           period: 'Jan 2026', periodStart: '2026-01-01', amount:  55.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Jan 2026', periodStart: '2026-01-01', amount:  12.50 },
  { kind: 'refuse',            description: 'Refuse collection',        period: 'Jan 2026', periodStart: '2026-01-01', amount:  12.00 },
  { kind: 'unit-tax',          description: 'Unit tax — residential',   period: 'Jan 2026', periodStart: '2026-01-01', amount:   8.00 },
]);

// ─── Stand 2210 — Tendai, Mupani commercial ───
const p_2210 = makeLines('p_2210', [
  { kind: 'rates',             description: 'Commercial rates',         period: 'Apr 2026', periodStart: '2026-04-01', amount:  90.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Apr 2026', periodStart: '2026-04-01', amount:  18.00 },
  { kind: 'rates',             description: 'Commercial rates',         period: 'Mar 2026', periodStart: '2026-03-01', amount:  90.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Mar 2026', periodStart: '2026-03-01', amount:  18.00 },
  { kind: 'rates',             description: 'Commercial rates',         period: 'Feb 2026', periodStart: '2026-02-01', amount:  90.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Feb 2026', periodStart: '2026-02-01', amount:  18.00 },
  { kind: 'rates',             description: 'Commercial rates',         period: 'Jan 2026', periodStart: '2026-01-01', amount: 108.00 },
  { kind: 'development-levy',  description: 'Development levy',         period: 'Jan 2026', periodStart: '2026-01-01', amount:  18.00 },
  { kind: 'adjustment',        description: 'Goodwill credit — refuse', period: 'Jan 2026', periodStart: '2026-01-05', amount: -18.00 },
]);

export const STATEMENT_LINES: StatementLine[] = [...p_4521, ...p_2210];

export function linesForProperty(propertyId: string): StatementLine[] {
  return STATEMENT_LINES.filter((l) => l.propertyId === propertyId);
}

/** Sum of all line items (after credits) — used to verify the outstanding balance. */
export function outstandingFromLines(propertyId: string, paidTxIds: string[] = []): number {
  // In a real app this would subtract paid transactions per line; for the
  // demo the balance is driven by `property.balanceUsd` and lines are
  // display-only. The helper is kept for later reconciliation.
  void paidTxIds;
  return linesForProperty(propertyId).reduce((sum, l) => sum + l.amount, 0);
}
