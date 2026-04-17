// CEO — Wards & projects drill-down.

'use client';

import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ChartShell, GroupedBars, HorizontalBars } from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import { BUDGET_LINES } from '@/mocks/fixtures/budget-lines';
import { CAMPFIRE_OFFTAKES, CAMPFIRE_QUOTAS, campfireYtdLevies, SPECIES_LABEL } from '@/mocks/fixtures/campfire';
import { PROPERTIES, tierOf } from '@/mocks/fixtures/properties';
import { SERVICE_REQUESTS } from '@/mocks/fixtures/service-requests';
import { WORK_ORDERS } from '@/mocks/fixtures/work-orders';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

export default function CeoWardsPage() {
  // Capital works progress (from budget-lines)
  const capital = BUDGET_LINES.filter((l) => l.kind === 'capital').map((l) => ({
    label: l.category,
    value: l.approvedUsd > 0 ? Math.round((l.ytdActualUsd / l.approvedUsd) * 100) : 0,
    approved: l.approvedUsd,
    actual: l.ytdActualUsd,
  })).sort((a, b) => b.value - a.value);

  // CAMPFIRE levies by ward
  const campfireByWard = new Map<string, number>();
  for (const o of CAMPFIRE_OFFTAKES) {
    if (o.status === 'completed' || o.status === 'paid') {
      campfireByWard.set(o.ward, (campfireByWard.get(o.ward) ?? 0) + o.levyUsd);
    }
  }
  const campfireBars = [...campfireByWard.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  // Per-ward operational snapshot
  const wards = [...new Set([
    ...PROPERTIES.map((p) => p.ward),
    ...SERVICE_REQUESTS.map((r) => r.ward),
    ...WORK_ORDERS.map((w) => w.ward),
  ])].sort();

  const wardSnapshot = wards.map((w) => {
    const props = PROPERTIES.filter((p) => p.ward === w);
    const debtorTotal = props.reduce((s, p) => s + p.balanceUsd, 0);
    const overdue = props.filter((p) => tierOf(p) === 'overdue').length;
    const srs = SERVICE_REQUESTS.filter((r) => r.ward === w).length;
    const wos = WORK_ORDERS.filter((x) => x.ward === w && x.status !== 'completed' && x.status !== 'cancelled').length;
    return { ward: w, propCount: props.length, debtorTotal, overdue, srs, wos };
  });

  // Capital spend by project (grouped bar)
  const capitalProgress = capital.map((c) => ({ x: c.label.slice(0, 12), approved: c.approved, actual: c.actual }));

  const totalCampfireYtd = campfireYtdLevies();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/ceo" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Wards &amp; projects</h1>
          <p className="mt-1 text-small text-muted">Ward scorecard, capital programme progress and CAMPFIRE dividends.</p>
        </div>
      </ScrollReveal>

      {/* Capital spend */}
      <ScrollReveal>
        <ChartShell title="Capital programme" subtitle="Approved vs YTD, by project" height={300}>
          <GroupedBars
            data={capitalProgress}
            bars={[
              { key: 'approved', label: 'Approved', color: CHART_TOKENS.primarySoft },
              { key: 'actual',   label: 'YTD',      color: CHART_TOKENS.primary },
            ]}
            valueFormatter={money}
          />
        </ChartShell>
      </ScrollReveal>

      {/* CAMPFIRE + capital list */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-body font-semibold text-ink">CAMPFIRE levies by ward</h3>
              <p className="mt-0.5 text-micro text-muted">{formatCurrency(totalCampfireYtd)} YTD · {CAMPFIRE_OFFTAKES.length} off-takes · {CAMPFIRE_QUOTAS.length} quotas</p>
            </div>
            <HorizontalBars data={campfireBars} valueFormatter={money} />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <div className="mb-3">
              <h3 className="text-body font-semibold text-ink">Capital projects · consumption</h3>
              <p className="mt-0.5 text-micro text-muted">Highest consumption first</p>
            </div>
            <ul className="divide-y divide-line text-small">
              {capital.slice(0, 8).map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate-line font-semibold text-ink">{c.label}</div>
                    <div className="text-micro text-muted">{formatCurrency(c.actual)} / {formatCurrency(c.approved)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-body font-bold tabular-nums text-ink">{c.value}%</div>
                    <div className="mt-0.5 h-1 w-24 overflow-hidden rounded-full bg-line">
                      <span className={cn('block h-full rounded-full', c.value >= 90 ? 'bg-success' : c.value >= 70 ? 'bg-brand-primary' : 'bg-warning')} style={{ width: `${Math.min(100, c.value)}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </ScrollReveal>
      </div>

      {/* Ward scorecard */}
      <div className="mt-4">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h3 className="text-body font-semibold text-ink">Ward scorecard</h3>
            <p className="mt-0.5 text-micro text-muted">Per-ward operational health across the district.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Ward</th>
                  <th className="px-5 py-3 text-right">Properties</th>
                  <th className="px-5 py-3 text-right">Debtor balance</th>
                  <th className="px-5 py-3 text-right">Overdue</th>
                  <th className="px-5 py-3 text-right">Service requests</th>
                  <th className="px-5 py-3 text-right">Open work orders</th>
                </tr>
              </thead>
              <tbody>
                {wardSnapshot.map((w) => (
                  <tr key={w.ward} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                        <span className="font-semibold text-ink">{w.ward}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{w.propCount || '—'}</td>
                    <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', w.debtorTotal > 0 ? 'text-danger' : 'text-muted')}>
                      {w.debtorTotal > 0 ? formatCurrency(w.debtorTotal) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {w.overdue > 0
                        ? <Badge tone="danger">{w.overdue}</Badge>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{w.srs || '—'}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{w.wos || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
