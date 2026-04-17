// CEO — Wards & projects drill-down.

'use client';

import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Bullet, ChartShell, Heatmap, HorizontalBars, RadarPlot, ScatterPlot, Sparkline, TreemapPlot } from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import { BUDGET_LINES } from '@/mocks/fixtures/budget-lines';
import { CAMPFIRE_OFFTAKES, CAMPFIRE_QUOTAS, campfireYtdLevies } from '@/mocks/fixtures/campfire';
import { PROPERTIES, tierOf } from '@/mocks/fixtures/properties';
import { SERVICE_REQUESTS, CATEGORY_LABEL as SR_CAT_LABEL } from '@/mocks/fixtures/service-requests';
import { WORK_ORDERS } from '@/mocks/fixtures/work-orders';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

function synthTrend(seed: number, n = 12, base = 20, amp = 10): number[] {
  return Array.from({ length: n }, (_, i) => {
    const v = base + Math.sin((i + seed) * 0.7) * amp + (i * amp) / (n * 2);
    return Math.max(0, Math.round(v * 10) / 10);
  });
}

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

  // Wards list
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

  // Scatter: per-ward debtor balance vs service-request volume
  const wardScatter = wardSnapshot
    .filter((w) => w.propCount > 0 || w.srs > 0)
    .map((w) => ({
      x: w.srs,
      y: w.debtorTotal,
      z: Math.max(1, w.propCount),
      label: w.ward,
    }));

  // Radar: top 4 wards compared across 5 dimensions
  const topWards = [...wardSnapshot].sort((a, b) => (b.debtorTotal + b.srs * 500) - (a.debtorTotal + a.srs * 500)).slice(0, 4);
  const maxProps = Math.max(1, ...wardSnapshot.map((w) => w.propCount));
  const maxDebt  = Math.max(1, ...wardSnapshot.map((w) => w.debtorTotal));
  const maxSR    = Math.max(1, ...wardSnapshot.map((w) => w.srs));
  const maxOvd   = Math.max(1, ...wardSnapshot.map((w) => w.overdue));
  const maxWO    = Math.max(1, ...wardSnapshot.map((w) => w.wos));
  const radarAxes = [
    { axis: 'Properties',     get: (w: typeof wardSnapshot[number]) => Math.round((w.propCount / maxProps) * 100) },
    { axis: 'Debtor ($)',     get: (w: typeof wardSnapshot[number]) => Math.round((w.debtorTotal / maxDebt) * 100) },
    { axis: 'Service reqs',   get: (w: typeof wardSnapshot[number]) => Math.round((w.srs / maxSR) * 100) },
    { axis: 'Overdue',        get: (w: typeof wardSnapshot[number]) => Math.round((w.overdue / maxOvd) * 100) },
    { axis: 'Open WOs',       get: (w: typeof wardSnapshot[number]) => Math.round((w.wos / maxWO) * 100) },
  ];
  const radarData = radarAxes.map(({ axis, get }) => {
    const row: Record<string, number | string> = { axis };
    for (const w of topWards) row[w.ward] = get(w);
    return row;
  });

  // Heatmap: ward × SR category
  const srCats = [...new Set(SERVICE_REQUESTS.map((r) => r.category))];
  const colLabels = srCats.map((c) => {
    const l = (SR_CAT_LABEL as Record<string, string>)[c] ?? c;
    return l.length > 11 ? l.slice(0, 11) + '…' : l;
  });
  const heatCells: Record<string, Record<string, number>> = {};
  for (const w of wards) {
    heatCells[w] = {};
    for (const c of colLabels) heatCells[w][c] = 0;
  }
  for (const r of SERVICE_REQUESTS) {
    const ci = srCats.indexOf(r.category);
    if (ci < 0 || !heatCells[r.ward]) continue;
    heatCells[r.ward]![colLabels[ci]!] = (heatCells[r.ward]![colLabels[ci]!] ?? 0) + 1;
  }

  // Capital treemap
  const capitalTreemap = capital.slice(0, 10).map((c) => ({ name: c.label, value: c.approved }));

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

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active wards"         value={wards.length.toString()} sub={`${PROPERTIES.length} properties on roll`} spark={synthTrend(1, 12, 14, 3)} sparkColor={CHART_TOKENS.primary} />
        <Stat label="Capital projects"     value={capital.length.toString()} sub={`${capital.filter((c) => c.value >= 90).length} ≥ 90% consumed`} spark={synthTrend(3, 12, 12, 5)} sparkColor={CHART_TOKENS.success} />
        <Stat label="CAMPFIRE YTD"          value={formatCurrency(totalCampfireYtd)} sub={`${CAMPFIRE_OFFTAKES.length} off-takes · ${CAMPFIRE_QUOTAS.length} quotas`} spark={synthTrend(5, 12, 16, 6)} sparkColor={CHART_TOKENS.accent} />
        <Stat label="Open service reqs"    value={SERVICE_REQUESTS.filter((r) => r.status !== 'resolved').length.toString()} sub={`across ${wards.length} wards`} spark={synthTrend(7, 12, 10, 4)} sparkColor={CHART_TOKENS.warning} />
      </div>

      {/* Capital bullets */}
      <div className="mt-6">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-body font-semibold text-ink">Capital programme</h3>
            <p className="mt-0.5 text-micro text-muted">Bar = YTD spent · tick = approved budget</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {capital.slice(0, 10).map((c) => {
              const ratio = c.actual / Math.max(1, c.approved);
              const tone: 'success' | 'warning' | 'danger' | 'brand' =
                ratio >= 1 ? 'danger' :
                ratio >= 0.95 ? 'warning' :
                ratio >= 0.7 ? 'success' :
                'brand';
              return (
                <Bullet key={c.label} label={c.label} actual={c.actual} target={c.approved} tone={tone} valueFormatter={money} />
              );
            })}
          </div>
        </Card>
      </div>

      {/* CAMPFIRE + Capital treemap */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-body font-semibold text-ink">CAMPFIRE levies by ward</h3>
              <p className="mt-0.5 text-micro text-muted">{formatCurrency(totalCampfireYtd)} YTD</p>
            </div>
            <HorizontalBars data={campfireBars} valueFormatter={money} />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell title="Capital allocation" subtitle="Approved amounts across projects">
            <TreemapPlot data={capitalTreemap} valueFormatter={(v) => money(v)} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Radar + Scatter */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Ward profile comparison" subtitle="Top 4 wards on 5 normalised dimensions (%)" height={320}>
            <RadarPlot
              data={radarData}
              series={topWards.map((w) => ({ key: w.ward, label: w.ward }))}
              max={100}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell title="Ward distribution" subtitle="Service requests (x) vs debtor balance (y) · bubble = properties" height={320}>
            <ScatterPlot
              data={wardScatter}
              xLabel="Service requests"
              yLabel="Debtor balance"
              xFormatter={(v) => v.toString()}
              yFormatter={money}
              color={CHART_TOKENS.primary}
            />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Heatmap */}
      <div className="mt-4">
        <Card className="p-5">
          <div className="mb-3">
            <h3 className="text-body font-semibold text-ink">Service request heatmap</h3>
            <p className="mt-0.5 text-micro text-muted">Intensity of citizen issues by ward × category</p>
          </div>
          <Heatmap
            rows={wards}
            cols={colLabels}
            cells={heatCells}
            valueFormatter={(v) => v.toString()}
          />
        </Card>
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

function Stat({ label, value, sub, spark, sparkColor }: { label: string; value: string; sub: string; spark: number[]; sparkColor: string }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-h2 font-bold tabular-nums text-ink">{value}</div>
      <div className="text-micro text-muted">{sub}</div>
      <div className="mt-2">
        <Sparkline data={spark} color={sparkColor} height={26} width={140} />
      </div>
    </Card>
  );
}
