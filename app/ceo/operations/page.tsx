// CEO operations drill-down.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ChartShell, Donut, GroupedBars, HorizontalBars } from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import { CONTRACTS, burnPct, daysToExpiry } from '@/mocks/fixtures/contracts';
import { countByStage as tenderStageCount, TENDERS } from '@/mocks/fixtures/procurement-tenders';
import { REQUISITIONS, STATUS_LABEL as REQ_LABEL, totalUsd as reqTotal, countByStatus as reqCountByStatus } from '@/mocks/fixtures/requisitions';
import { SERVICE_REQUESTS, CATEGORY_LABEL as SR_CAT_LABEL } from '@/mocks/fixtures/service-requests';
import { FLEET, FUEL_LOGS, totalsFleet } from '@/mocks/fixtures/fleet';
import { countByStatus as woByStatus, openCount as woOpen, WORK_ORDERS, TEAMS as WO_TEAMS } from '@/mocks/fixtures/work-orders';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

export default function CeoOperationsPage() {
  const wo = woByStatus();
  const fleet = totalsFleet();
  const reqs = reqCountByStatus();
  const pendingReqs = reqs.submitted + reqs.approved + reqs['po-raised'] + reqs['grv-received'];

  // Service requests by ward
  const srByWard = new Map<string, number>();
  for (const r of SERVICE_REQUESTS) srByWard.set(r.ward, (srByWard.get(r.ward) ?? 0) + 1);
  const srWardBars = [...srByWard.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  // Service requests by category
  const srByCat = new Map<string, number>();
  for (const r of SERVICE_REQUESTS) srByCat.set(r.category, (srByCat.get(r.category) ?? 0) + 1);
  const srCatBars = [...srByCat.entries()].map(([k, value]) => ({ label: (SR_CAT_LABEL as Record<string, string>)[k] ?? k, value })).sort((a, b) => b.value - a.value);

  // Work orders by team
  const woByTeam = new Map<string, number>();
  for (const w of WORK_ORDERS) {
    if (w.status === 'completed' || w.status === 'cancelled') continue;
    woByTeam.set(w.team, (woByTeam.get(w.team) ?? 0) + 1);
  }
  const teamBars = WO_TEAMS.map((t) => ({ label: t, value: woByTeam.get(t) ?? 0 }));

  // Work order status donut
  const woDonut = [
    { name: 'Open',        value: wo.open,           color: CHART_TOKENS.warning },
    { name: 'Assigned',    value: wo.assigned,       color: CHART_TOKENS.sky },
    { name: 'In progress', value: wo['in-progress'], color: CHART_TOKENS.primary },
    { name: 'Blocked',     value: wo.blocked,        color: CHART_TOKENS.danger },
    { name: 'Completed',   value: wo.completed,      color: CHART_TOKENS.success },
  ];

  // Tender funnel
  const stageCounts = tenderStageCount();
  const tenderFunnel = [
    { x: 'Advertised',    value: stageCounts.advertised ?? 0 },
    { x: 'Closed',        value: stageCounts.closed ?? 0 },
    { x: 'Evaluation',    value: stageCounts.evaluation ?? 0 },
    { x: 'Recommended',   value: stageCounts['award-recommended'] ?? 0 },
    { x: 'Awarded',       value: stageCounts.award ?? 0 },
    { x: 'Signed',        value: stageCounts['contract-signed'] ?? 0 },
  ];

  // Contract burn table
  const contractRows = [...CONTRACTS].sort((a, b) => burnPct(b) - burnPct(a));

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
        <Stat label="Open service requests" value={SERVICE_REQUESTS.filter((r) => r.status !== 'resolved').length.toString()} sub={`${SERVICE_REQUESTS.length} total this cycle`} />
        <Stat label="Open work orders"      value={woOpen().toString()} sub={`${wo.blocked ?? 0} blocked`} tone={(wo.blocked ?? 0) > 0 ? 'warning' : 'info'} />
        <Stat label="Active fleet"          value={`${fleet.active}/${fleet.total}`} sub={`${fleet.serviceDue} due a service`} />
        <Stat label="Procurement pending"   value={pendingReqs.toString()} sub={`${reqs.submitted} awaiting CFO`} />
      </div>

      {/* Service requests */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Service requests by ward</h3>
            <HorizontalBars data={srWardBars} valueFormatter={(v) => v.toString()} />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Service requests by category</h3>
            <HorizontalBars data={srCatBars} valueFormatter={(v) => v.toString()} />
          </Card>
        </ScrollReveal>
      </div>

      {/* Work orders */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Work orders by status" subtitle={`${WORK_ORDERS.length} work orders total`}>
            <Donut data={woDonut} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Open work orders by team</h3>
            <HorizontalBars data={teamBars} valueFormatter={(v) => v.toString()} />
          </Card>
        </ScrollReveal>
      </div>

      {/* Tender funnel */}
      <div className="mt-4">
        <ChartShell title="Tender funnel" subtitle={`${TENDERS.length} tenders across the cycle`}>
          <GroupedBars
            data={tenderFunnel}
            bars={[{ key: 'value', label: 'Tenders', color: CHART_TOKENS.primary }]}
            valueFormatter={(v) => String(v)}
          />
        </ChartShell>
      </div>

      {/* Contract burn */}
      <div className="mt-4">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h3 className="text-body font-semibold text-ink">Contract burn</h3>
            <p className="mt-0.5 text-micro text-muted">Consumption against ceilings, highest first.</p>
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

      {/* Fleet summary */}
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

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'warning' | 'info' }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', tone === 'warning' ? 'text-warning' : 'text-ink')}>{value}</div>
      <div className="text-micro text-muted">{sub}</div>
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
