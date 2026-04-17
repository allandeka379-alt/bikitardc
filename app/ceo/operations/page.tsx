// CEO operations drill-down.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ChartShell, Donut, FunnelPlot, Heatmap, HorizontalBars, ProgressRing, Sparkline } from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import { CONTRACTS, burnPct, daysToExpiry } from '@/mocks/fixtures/contracts';
import { countByStage as tenderStageCount, TENDERS } from '@/mocks/fixtures/procurement-tenders';
import { REQUISITIONS, STATUS_LABEL as REQ_LABEL, totalUsd as reqTotal, countByStatus as reqCountByStatus } from '@/mocks/fixtures/requisitions';
import { SERVICE_REQUESTS, CATEGORY_LABEL as SR_CAT_LABEL } from '@/mocks/fixtures/service-requests';
import { FUEL_LOGS, totalsFleet } from '@/mocks/fixtures/fleet';
import { countByStatus as woByStatus, openCount as woOpen, WORK_ORDERS, TEAMS as WO_TEAMS } from '@/mocks/fixtures/work-orders';
import { cn } from '@/lib/cn';

function synthTrend(seed: number, n = 12, base = 20, amp = 10): number[] {
  return Array.from({ length: n }, (_, i) => {
    const v = base + Math.sin((i + seed) * 0.7) * amp + (i * amp) / (n * 2);
    return Math.max(0, Math.round(v * 10) / 10);
  });
}

export default function CeoOperationsPage() {
  const wo = woByStatus();
  const fleet = totalsFleet();
  const reqs = reqCountByStatus();
  const pendingReqs = reqs.submitted + reqs.approved + reqs['po-raised'] + reqs['grv-received'];

  // ── Service requests heatmap: ward × category ──
  const srWards = [...new Set(SERVICE_REQUESTS.map((r) => r.ward))].sort();
  const srCats  = [...new Set(SERVICE_REQUESTS.map((r) => r.category))];
  const colLabels = srCats.map((c) => {
    const l = (SR_CAT_LABEL as Record<string, string>)[c] ?? c;
    return l.length > 11 ? l.slice(0, 11) + '…' : l;
  });
  const heatCells: Record<string, Record<string, number>> = {};
  for (const w of srWards) {
    heatCells[w] = {};
    for (const c of colLabels) heatCells[w][c] = 0;
  }
  for (const r of SERVICE_REQUESTS) {
    const ci = srCats.indexOf(r.category);
    if (ci < 0 || !heatCells[r.ward]) continue;
    heatCells[r.ward]![colLabels[ci]!] = (heatCells[r.ward]![colLabels[ci]!] ?? 0) + 1;
  }

  // ── Work orders by team (HB) ──
  const woByTeam = new Map<string, number>();
  for (const w of WORK_ORDERS) {
    if (w.status === 'completed' || w.status === 'cancelled') continue;
    woByTeam.set(w.team, (woByTeam.get(w.team) ?? 0) + 1);
  }
  const teamBars = WO_TEAMS.map((t) => ({ label: t, value: woByTeam.get(t) ?? 0 }));

  // ── Work order status donut ──
  const woDonut = [
    { name: 'Open',        value: wo.open,           color: CHART_TOKENS.warning },
    { name: 'Assigned',    value: wo.assigned,       color: CHART_TOKENS.sky },
    { name: 'In progress', value: wo['in-progress'], color: CHART_TOKENS.primary },
    { name: 'Blocked',     value: wo.blocked,        color: CHART_TOKENS.danger },
    { name: 'Completed',   value: wo.completed,      color: CHART_TOKENS.success },
  ];

  // ── Tender FUNNEL (proper funnel shape) ──
  const stageCounts = tenderStageCount();
  const tenderFunnel = [
    { name: 'Advertised',  value: stageCounts.advertised ?? 0 },
    { name: 'Closed',      value: stageCounts.closed ?? 0 },
    { name: 'Evaluation',  value: stageCounts.evaluation ?? 0 },
    { name: 'Recommended', value: stageCounts['award-recommended'] ?? 0 },
    { name: 'Awarded',     value: stageCounts.award ?? 0 },
    { name: 'Signed',      value: stageCounts['contract-signed'] ?? 0 },
  ].filter((r) => r.value > 0);

  const contractRows = [...CONTRACTS].sort((a, b) => burnPct(b) - burnPct(a));
  const contractsSoonExpiring = CONTRACTS.filter((c) => {
    const d = daysToExpiry(c);
    return d > 0 && d <= 60;
  }).length;

  // ── Fleet utilisation rings ──
  const fleetActivePct = Math.round((fleet.active / Math.max(1, fleet.total)) * 100);
  const srResolvedPct = Math.round((SERVICE_REQUESTS.filter((r) => r.status === 'resolved').length / Math.max(1, SERVICE_REQUESTS.length)) * 100);
  const woClosedPct   = Math.round((wo.completed / Math.max(1, WORK_ORDERS.length)) * 100);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/ceo" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Operations</h1>
          <p className="mt-1 text-small text-muted">Service requests, work orders, fleet, procurement, contracts.</p>
        </div>
      </ScrollReveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open service requests" value={SERVICE_REQUESTS.filter((r) => r.status !== 'resolved').length.toString()} sub={`${SERVICE_REQUESTS.length} total this cycle`} spark={synthTrend(1, 12, 14, 6)} sparkColor={CHART_TOKENS.primary} />
        <Stat label="Open work orders"      value={woOpen().toString()} sub={`${wo.blocked ?? 0} blocked`} tone={(wo.blocked ?? 0) > 0 ? 'warning' : 'info'} spark={synthTrend(3, 12, 12, 5)} sparkColor={CHART_TOKENS.warning} />
        <Stat label="Active fleet"          value={`${fleet.active}/${fleet.total}`} sub={`${fleet.serviceDue} due a service`} spark={synthTrend(5, 12, 14, 3)} sparkColor={CHART_TOKENS.sky} />
        <Stat label="Procurement pending"   value={pendingReqs.toString()} sub={`${reqs.submitted} awaiting CFO`} spark={synthTrend(7, 12, 10, 4)} sparkColor={CHART_TOKENS.accent} />
      </div>

      {/* Service request heatmap + operational gauges */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-3">
              <h3 className="text-body font-semibold text-ink">Service requests heatmap</h3>
              <p className="mt-0.5 text-micro text-muted">Intensity by ward × category ({SERVICE_REQUESTS.length} requests)</p>
            </div>
            <Heatmap
              rows={srWards}
              cols={colLabels}
              cells={heatCells}
              valueFormatter={(v) => v.toString()}
            />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="h-full p-5">
            <div className="mb-1">
              <h3 className="text-body font-semibold text-ink">Operational gauges</h3>
              <p className="mt-0.5 text-micro text-muted">Completion rates and utilisation</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-[140px]">
                <ProgressRing value={fleetActivePct} label="Fleet active" color={CHART_TOKENS.primary} />
              </div>
              <div className="h-[140px]">
                <ProgressRing value={srResolvedPct} label="SR resolved" color={CHART_TOKENS.success} />
              </div>
              <div className="h-[140px]">
                <ProgressRing value={woClosedPct} label="WO closed" color={CHART_TOKENS.sky} />
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Work orders by status (donut) + team (bars) + Tender funnel */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <ChartShell title="Work orders by status" subtitle={`${WORK_ORDERS.length} work orders total`}>
            <Donut data={woDonut} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Open work orders by team</h3>
            <HorizontalBars data={teamBars} valueFormatter={(v) => v.toString()} />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <ChartShell title="Tender funnel" subtitle={`${TENDERS.length} tenders across the cycle`}>
            {tenderFunnel.length > 0 ? (
              <FunnelPlot data={tenderFunnel} valueFormatter={(v) => v.toString()} />
            ) : (
              <div className="grid h-full place-items-center text-small text-muted">No tenders in pipeline.</div>
            )}
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Contract burn */}
      <div className="mt-4">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-body font-semibold text-ink">Contract burn</h3>
              <p className="mt-0.5 text-micro text-muted">Consumption against ceilings, highest first.</p>
            </div>
            {contractsSoonExpiring > 0 && (
              <Badge tone="warning">{contractsSoonExpiring} expiring ≤ 60d</Badge>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Contract</th>
                  <th className="px-5 py-3 text-left">Supplier</th>
                  <th className="px-5 py-3 text-right">Ceiling</th>
                  <th className="px-5 py-3 text-right">Consumed</th>
                  <th className="px-5 py-3 text-left">Burn</th>
                  <th className="px-5 py-3 text-right">Days to expiry</th>
                </tr>
              </thead>
              <tbody>
                {contractRows.map((c) => {
                  const pct = burnPct(c) * 100;
                  const days = daysToExpiry(c);
                  return (
                    <tr key={c.id} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-2.5 font-semibold text-ink">{c.title}</td>
                      <td className="px-5 py-2.5 text-muted">{c.supplierName}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-muted">{formatCurrency(c.ceilingUsd)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-ink">{formatCurrency(c.consumedUsd)}</td>
                      <td className="px-5 py-2.5">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                          <span className={cn('block h-full rounded-full', pct >= 90 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-brand-primary')} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <div className="mt-0.5 text-[10px] tabular-nums text-muted">{Math.round(pct)}%</div>
                      </td>
                      <td className={cn('px-5 py-2.5 text-right tabular-nums', days <= 60 && c.status !== 'expired' ? 'font-semibold text-warning' : 'text-muted')}>
                        {days > 0 ? `${days}d` : days <= 0 ? 'Expired' : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Fleet snapshot + Requisitions pipeline */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-h3 text-ink">Fleet snapshot</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <FleetTile label="Active"          value={`${fleet.active}/${fleet.total}`} />
            <FleetTile label="Service due"      value={fleet.serviceDue.toString()} tone={fleet.serviceDue > 0 ? 'warning' : undefined} />
            <FleetTile label="Under 25% fuel"   value={fleet.fuelBelow25.toString()} tone={fleet.fuelBelow25 > 0 ? 'warning' : undefined} />
            <FleetTile label="Refills MTD"      value={FUEL_LOGS.length.toString()} />
          </div>
          <div className="mt-4 rounded-md bg-surface/60 p-3 text-small text-ink">
            <div className="flex items-center justify-between">
              <span className="text-muted">Fuel spend MTD</span>
              <span className="font-semibold tabular-nums">{formatCurrency(FUEL_LOGS.reduce((s, f) => s + f.costUsd, 0))}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="text-h3 text-ink">Requisitions pipeline</h3>
          <p className="mt-1 text-micro text-muted">Spend commitments flowing through the procurement workflow.</p>
          <ul className="mt-3 divide-y divide-line text-small">
            {REQUISITIONS.slice(0, 6).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate-line font-semibold text-ink">{r.title}</div>
                  <div className="truncate-line text-micro text-muted">{r.department} · {r.requestedBy}</div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-semibold text-ink">{formatCurrency(reqTotal(r))}</div>
                  <Badge tone={r.status === 'invoiced' ? 'success' : r.status === 'rejected' ? 'danger' : r.status === 'submitted' ? 'warning' : 'info'}>{REQ_LABEL[r.status]}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone, spark, sparkColor }: { label: string; value: string; sub: string; tone?: 'warning' | 'info'; spark: number[]; sparkColor: string }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', tone === 'warning' ? 'text-warning' : 'text-ink')}>{value}</div>
      <div className="text-micro text-muted">{sub}</div>
      <div className="mt-2">
        <Sparkline data={spark} color={sparkColor} height={26} width={140} />
      </div>
    </Card>
  );
}

function FleetTile({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <div className="rounded-md border border-line bg-surface/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('mt-1 text-body font-bold tabular-nums', tone === 'warning' ? 'text-warning' : 'text-ink')}>{value}</div>
    </div>
  );
}
