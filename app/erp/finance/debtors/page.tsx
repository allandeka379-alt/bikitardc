// ─────────────────────────────────────────────
// Debtors — aging summary (property balances) with
// per-ward breakdown and a filterable list.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format';
import {
  BUCKET_LABEL,
  classifyDebtors,
  debtorAgingTotals,
  type DebtorRow,
} from '@/mocks/fixtures/debtors-summary';
import { cn } from '@/lib/cn';

const BUCKET_ORDER: DebtorRow['bucket'][] = ['current', 'd30', 'd60', 'd90plus'];

const BUCKET_TONE: Record<DebtorRow['bucket'], 'success' | 'info' | 'warning' | 'danger'> = {
  current: 'success',
  d30:     'info',
  d60:     'warning',
  d90plus: 'danger',
};

export default function DebtorsPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<DebtorRow['bucket'] | 'all'>('all');

  const aging = debtorAgingTotals();
  const total = aging.current + aging.d30 + aging.d60 + aging.d90plus;
  const rows = useMemo(() => {
    let r = classifyDebtors();
    if (filter !== 'all') r = r.filter((d) => d.bucket === filter);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter(
        (d) =>
          d.property.ownerName.toLowerCase().includes(ql) ||
          d.property.stand.toLowerCase().includes(ql) ||
          d.property.ward.toLowerCase().includes(ql),
      );
    }
    return r.sort((a, b) => b.property.balanceUsd - a.property.balanceUsd);
  }, [q, filter]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/finance"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Finance
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Debtors</h1>
          <p className="mt-1 text-small text-muted">
            Property balances by aging bucket — ratepayers owing the council {formatCurrency(total)} in total.
          </p>
        </div>
      </ScrollReveal>

      {/* Aging buckets (clickable filters) */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {BUCKET_ORDER.map((b) => {
          const amt = aging[b];
          const pct = total > 0 ? (amt / total) * 100 : 0;
          const selected = filter === b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => setFilter(selected ? 'all' : b)}
              className={cn(
                'rounded-lg border bg-card p-4 text-left transition-all duration-base ease-out-expo hover:-translate-y-0.5',
                selected ? 'border-brand-primary shadow-ring-brand' : 'border-line hover:shadow-card-sm',
              )}
            >
              <div className="text-micro font-semibold uppercase tracking-wide text-muted">
                {BUCKET_LABEL[b]}
              </div>
              <div className={cn(
                'mt-1 text-h3 font-bold tabular-nums',
                BUCKET_TONE[b] === 'success' ? 'text-success' :
                BUCKET_TONE[b] === 'info'    ? 'text-info'    :
                BUCKET_TONE[b] === 'warning' ? 'text-warning' : 'text-danger',
              )}>
                {formatCurrency(amt)}
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
                <span
                  className={cn(
                    'block h-full rounded-full',
                    BUCKET_TONE[b] === 'success' ? 'bg-success' :
                    BUCKET_TONE[b] === 'info'    ? 'bg-info' :
                    BUCKET_TONE[b] === 'warning' ? 'bg-warning' : 'bg-danger',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-micro text-muted">{pct.toFixed(0)}% of debt</div>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search by ratepayer, stand or ward…"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="text-micro font-semibold text-brand-primary hover:underline"
            >
              Clear bucket filter
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Ratepayer</th>
                <th className="px-5 py-3 text-left">Stand</th>
                <th className="px-5 py-3 text-left">Ward</th>
                <th className="px-5 py-3 text-left">Bucket</th>
                <th className="px-5 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.property.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <Link href={`/erp/crm/${d.property.ownerId}`} className="font-semibold text-ink hover:text-brand-primary">
                      {d.property.ownerName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-micro text-muted">{d.property.stand}</td>
                  <td className="px-5 py-3 text-muted">{d.property.ward}</td>
                  <td className="px-5 py-3">
                    <Badge tone={BUCKET_TONE[d.bucket]}>{BUCKET_LABEL[d.bucket]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-danger">
                    {formatCurrency(d.property.balanceUsd)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-small text-muted">
                    No debtors match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
