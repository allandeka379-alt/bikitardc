// ─────────────────────────────────────────────
// Fixed asset register — cost, accumulated
// depreciation, net book value per asset. Grouped
// by category with a totals row.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  ASSET_CATEGORY_LABEL,
  FIXED_ASSETS,
  carryingAmount,
  totalsByCategory,
  type AssetCategory,
} from '@/mocks/fixtures/fixed-assets';
import { cn } from '@/lib/cn';

const CATEGORY_ORDER: AssetCategory[] = [
  'land-buildings',
  'infrastructure',
  'motor-vehicles',
  'plant-machinery',
  'office-equipment',
];

export default function FixedAssetsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<AssetCategory | 'all'>('all');

  const totals = totalsByCategory();
  const grandTotal = Object.values(totals).reduce(
    (acc, cat) => ({ cost: acc.cost + cat.cost, accum: acc.accum + cat.accum, nbv: acc.nbv + cat.nbv }),
    { cost: 0, accum: 0, nbv: 0 },
  );

  const rows = useMemo(() => {
    let r = FIXED_ASSETS.filter((a) => a.status !== 'disposed');
    if (category !== 'all') r = r.filter((a) => a.category === category);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter(
        (a) =>
          a.tag.toLowerCase().includes(ql) ||
          a.description.toLowerCase().includes(ql) ||
          a.location.toLowerCase().includes(ql),
      );
    }
    return r;
  }, [q, category]);

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
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h1 text-ink">Fixed assets register</h1>
            <p className="mt-1 text-small text-muted">
              {FIXED_ASSETS.length} items on register · straight-line depreciation under IPSAS 17.
            </p>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-2.5">
            <div className="text-micro text-muted">Net book value</div>
            <div className="text-h2 font-bold tabular-nums text-ink">{formatCurrency(grandTotal.nbv)}</div>
          </div>
        </div>
      </ScrollReveal>

      {/* Category breakdown */}
      <div className="mb-6 grid gap-3 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-lg border bg-card p-3 text-left transition-all duration-base ease-out-expo hover:shadow-card-sm',
            category === 'all' ? 'border-brand-primary shadow-ring-brand' : 'border-line',
          )}
        >
          <div className="text-micro font-semibold uppercase tracking-wide text-muted">All</div>
          <div className="mt-1 text-body font-bold tabular-nums text-ink">{formatCurrency(grandTotal.nbv)}</div>
          <div className="text-micro text-muted">{FIXED_ASSETS.length} items</div>
        </button>
        {CATEGORY_ORDER.map((cat) => {
          const t = totals[cat];
          const count = FIXED_ASSETS.filter((a) => a.category === cat && a.status !== 'disposed').length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-lg border bg-card p-3 text-left transition-all duration-base ease-out-expo hover:shadow-card-sm',
                category === cat ? 'border-brand-primary shadow-ring-brand' : 'border-line',
              )}
            >
              <div className="truncate-line text-micro font-semibold uppercase tracking-wide text-muted">
                {ASSET_CATEGORY_LABEL[cat]}
              </div>
              <div className="mt-1 text-body font-bold tabular-nums text-ink">{formatCurrency(t.nbv)}</div>
              <div className="text-micro text-muted">{count} {count === 1 ? 'item' : 'items'}</div>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="relative border-b border-line px-5 py-3">
          <Filter className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search by tag, description or location…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Tag / Description</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Acquired</th>
                <th className="px-5 py-3 text-left">Custodian</th>
                <th className="px-5 py-3 text-right">Cost</th>
                <th className="px-5 py-3 text-right">Accum. depr.</th>
                <th className="px-5 py-3 text-right">NBV</th>
                <th className="px-5 py-3 text-right">Annual depr.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const nbv = carryingAmount(a);
                const consumedPct = a.costUsd > 0 ? a.accumDeprUsd / a.costUsd : 0;
                return (
                  <tr key={a.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <div className="font-mono text-micro text-muted">{a.tag}</div>
                      <div className="font-semibold text-ink">{a.description}</div>
                      <div className="text-micro text-muted">{a.location}</div>
                    </td>
                    <td className="px-5 py-3"><Badge tone="neutral">{ASSET_CATEGORY_LABEL[a.category]}</Badge></td>
                    <td className="px-5 py-3 text-muted">{formatDate(a.acquiredAt)}</td>
                    <td className="px-5 py-3 text-muted">{a.custodian}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{formatCurrency(a.costUsd)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{formatCurrency(a.accumDeprUsd)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="font-semibold tabular-nums text-ink">{formatCurrency(nbv)}</div>
                      <div className="mt-1 ml-auto h-1 w-20 overflow-hidden rounded-full bg-line">
                        <span
                          className={cn(
                            'block h-full rounded-full',
                            consumedPct >= 0.9 ? 'bg-danger' : consumedPct >= 0.6 ? 'bg-warning' : 'bg-brand-primary',
                          )}
                          style={{ width: `${Math.min(100, consumedPct * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{formatCurrency(a.annualDeprUsd)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-surface font-semibold">
                <td className="px-5 py-3 text-small text-ink" colSpan={4}>Total · {rows.length} assets</td>
                <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(rows.reduce((s, a) => s + a.costUsd, 0))}</td>
                <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(rows.reduce((s, a) => s + a.accumDeprUsd, 0))}</td>
                <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(rows.reduce((s, a) => s + carryingAmount(a), 0))}</td>
                <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(rows.reduce((s, a) => s + a.annualDeprUsd, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
