// CEO — Assets & estate drill-down.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ChartShell, Donut, HorizontalBars } from '@/components/ceo/charts';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import {
  ASSET_CATEGORY_LABEL,
  FIXED_ASSETS,
  carryingAmount,
  totalsByCategory,
  type AssetCategory,
} from '@/mocks/fixtures/fixed-assets';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

export default function CeoAssetsPage() {
  const totals = totalsByCategory();
  const grand = Object.values(totals).reduce((s, c) => ({
    cost:  s.cost + c.cost,
    accum: s.accum + c.accum,
    nbv:   s.nbv + c.nbv,
  }), { cost: 0, accum: 0, nbv: 0 });

  // NBV by category donut
  const nbvDonut = (Object.keys(totals) as AssetCategory[]).map((cat, i) => ({
    name: ASSET_CATEGORY_LABEL[cat],
    value: totals[cat].nbv,
    color: [CHART_TOKENS.primary, CHART_TOKENS.accent, CHART_TOKENS.success, CHART_TOKENS.sky, CHART_TOKENS.violet][i % 5],
  }));

  // Cost vs NBV (depreciation) — horizontal bars
  const consumed = (Object.keys(totals) as AssetCategory[]).map((cat) => ({
    label: ASSET_CATEGORY_LABEL[cat],
    value: totals[cat].cost > 0 ? Math.round((totals[cat].accum / totals[cat].cost) * 100) : 0,
  })).sort((a, b) => b.value - a.value);

  const nearlyFullyDepreciated = FIXED_ASSETS.filter((a) => a.costUsd > 0 && a.accumDeprUsd / a.costUsd >= 0.85 && a.status !== 'disposed');

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/ceo" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Assets &amp; estate</h1>
          <p className="mt-1 text-small text-muted">Carrying amounts, depreciation and replacement-watch across the fixed-asset register.</p>
        </div>
      </ScrollReveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net book value"      value={formatCurrency(grand.nbv)} sub="IPSAS 17 basis" />
        <Stat label="Cost (gross)"         value={formatCurrency(grand.cost)} sub={`${FIXED_ASSETS.length} items on register`} />
        <Stat label="Accumulated depr."    value={formatCurrency(grand.accum)} sub="Straight-line" tone="warning" />
        <Stat label="Near full depr."      value={nearlyFullyDepreciated.length.toString()} sub="≥ 85% depreciated" tone={nearlyFullyDepreciated.length > 0 ? 'warning' : 'info'} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Net book value by category" subtitle="Share of NBV across asset classes">
            <Donut data={nbvDonut} valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Depreciation consumed (%)</h3>
            <HorizontalBars data={consumed} valueFormatter={(v) => `${v}%`} />
          </Card>
        </ScrollReveal>
      </div>

      {/* Replacement-watch table */}
      <div className="mt-4">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h3 className="text-body font-semibold text-ink">Replacement watchlist</h3>
            <p className="mt-0.5 text-micro text-muted">Items at 85% or more of their useful life — plan for renewal in next budget cycle.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Tag</th>
                  <th className="px-5 py-3 text-left">Description</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-right">Cost</th>
                  <th className="px-5 py-3 text-right">NBV</th>
                  <th className="px-5 py-3 text-right">% consumed</th>
                </tr>
              </thead>
              <tbody>
                {nearlyFullyDepreciated.map((a) => {
                  const pct = Math.round((a.accumDeprUsd / a.costUsd) * 100);
                  return (
                    <tr key={a.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                      <td className="px-5 py-2.5 font-mono text-micro text-ink">{a.tag}</td>
                      <td className="px-5 py-2.5 text-ink">{a.description}</td>
                      <td className="px-5 py-2.5 text-muted">{ASSET_CATEGORY_LABEL[a.category]}</td>
                      <td className="px-5 py-2.5 text-muted">{a.location}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-muted">{formatCurrency(a.costUsd)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-ink">{formatCurrency(carryingAmount(a))}</td>
                      <td className={cn('px-5 py-2.5 text-right font-semibold tabular-nums', pct >= 95 ? 'text-danger' : 'text-warning')}>
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
                {nearlyFullyDepreciated.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-small text-success">No items on the replacement watchlist.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'warning' | 'info' }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', tone === 'warning' ? 'text-warning' : 'text-ink')}>{value}</div>
      <div className="text-micro text-muted">{sub}</div>
    </Card>
  );
}
