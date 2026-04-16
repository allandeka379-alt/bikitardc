// ─────────────────────────────────────────────
// Debtor aging summary for the Finance dashboard.
//
// The canonical debtor records live in the existing
// PROPERTIES fixture (each property has a
// balanceUsd). This file layers aging buckets and
// top-debtor snapshots on top for the Finance
// module's Debtors view and for the Top-5 debtors
// card on the Finance hub.
// ─────────────────────────────────────────────

import { PROPERTIES, type Property } from './properties';

export interface DebtorRow {
  property: Property;
  bucket: 'current' | 'd30' | 'd60' | 'd90plus';
}

/** Classify each property's balance into an aging bucket using its dueAt. */
export function classifyDebtors(today: Date = new Date('2026-04-17')): DebtorRow[] {
  const out: DebtorRow[] = [];
  for (const p of PROPERTIES) {
    if (p.balanceUsd <= 0) continue;
    const overdueDays = Math.floor((today.getTime() - new Date(p.nextDueAt).getTime()) / (1000 * 60 * 60 * 24));
    let bucket: DebtorRow['bucket'];
    if (overdueDays <= 0) bucket = 'current';
    else if (overdueDays <= 30) bucket = 'd30';
    else if (overdueDays <= 60) bucket = 'd60';
    else bucket = 'd90plus';
    out.push({ property: p, bucket });
  }
  return out;
}

export function debtorAgingTotals(today?: Date): Record<DebtorRow['bucket'], number> {
  const out = { current: 0, d30: 0, d60: 0, d90plus: 0 };
  for (const row of classifyDebtors(today)) {
    out[row.bucket] += row.property.balanceUsd;
  }
  return out;
}

export function totalDebtors(today?: Date): number {
  const t = debtorAgingTotals(today);
  return t.current + t.d30 + t.d60 + t.d90plus;
}

export function topDebtors(n = 5, today?: Date): DebtorRow[] {
  return [...classifyDebtors(today)]
    .sort((a, b) => b.property.balanceUsd - a.property.balanceUsd)
    .slice(0, n);
}

export const BUCKET_LABEL: Record<DebtorRow['bucket'], string> = {
  current: 'Current (not overdue)',
  d30:     '1 – 30 days',
  d60:     '31 – 60 days',
  d90plus: '61+ days',
};
