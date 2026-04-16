'use client';

// ─────────────────────────────────────────────
// Arrears ageing buckets widget (spec §3.1).
// Sits on the property detail page, shows a small
// bar breakdown of how old outstanding charges are.
//
// For the demo we derive a plausible distribution
// from the property's balance + tier — a real
// implementation would bucket by statement line
// age.
// ─────────────────────────────────────────────

import { Card } from '@/components/ui/card';
import type { Property } from '@/mocks/fixtures/properties';
import { tierOf } from '@/mocks/fixtures/properties';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';

interface Bucket {
  label: string;
  days: string;
  value: number;
  color: string;
}

export function AgeingBuckets({ property }: { property: Property }) {
  const tier = tierOf(property);
  const balance = property.balanceUsd;
  const buckets = deriveBuckets(balance, tier);
  const max = Math.max(...buckets.map((b) => b.value), 1);

  if (balance === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-h3 text-ink">Arrears ageing</h3>
        <p className="mt-1 text-small text-muted">
          You're fully paid up — no arrears on this property.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-h3 text-ink">Arrears ageing</h3>
          <p className="mt-0.5 text-small text-muted">
            Split of what's owed by how long it's been outstanding.
          </p>
        </div>
        <div className="text-right">
          <div className="text-micro text-muted">Total</div>
          <div className="text-h3 font-bold tabular-nums text-ink">{formatCurrency(balance)}</div>
        </div>
      </div>

      <ul className="grid gap-2.5">
        {buckets.map((b) => {
          const pct = (b.value / max) * 100;
          const share = balance > 0 ? (b.value / balance) * 100 : 0;
          return (
            <li key={b.label}>
              <div className="flex items-baseline justify-between text-small">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: b.color }}
                    aria-hidden
                  />
                  <span className="font-medium text-ink">{b.label}</span>
                  <span className="text-micro text-muted">{b.days}</span>
                </span>
                <span className="tabular-nums text-muted">
                  {formatCurrency(b.value)}{' '}
                  <span className="text-micro">({share.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <span
                  className="block h-full rounded-full transition-[width] duration-slow ease-out-expo"
                  style={{ width: `${pct}%`, backgroundColor: b.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function deriveBuckets(
  balance: number,
  tier: ReturnType<typeof tierOf>,
): Bucket[] {
  const round = (v: number) => Math.round(v * 100) / 100;
  const split =
    tier === 'overdue'
      ? { cur: 0.40, b1: 0.30, b2: 0.20, b3: 0.10 }
      : { cur: 1.00, b1: 0.00, b2: 0.00, b3: 0.00 };

  return [
    { label: 'Current',   days: '0-30 days',  value: round(balance * split.cur), color: CHART_TOKENS.success },
    { label: '31-60',     days: '31-60 days', value: round(balance * split.b1),  color: CHART_TOKENS.warning },
    { label: '61-90',     days: '61-90 days', value: round(balance * split.b2),  color: CHART_TOKENS.accent  },
    { label: '90+',       days: '90+ days',   value: round(balance * split.b3),  color: CHART_TOKENS.danger  },
  ];
}
