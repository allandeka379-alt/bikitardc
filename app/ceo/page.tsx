// ─────────────────────────────────────────────
// CEO executive dashboard — the landing view for
// the Chief Executive after login. Combines
// headline KPIs, cross-module charts, and an
// "attention required" panel of urgent items.
// ─────────────────────────────────────────────

'use client';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  Gavel,
  Handshake,
  HandCoins,
  Minus,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  AreaTimeSeries,
  ChartShell,
  Donut,
  GroupedBars,
  HorizontalBars,
  LineTimeSeries,
  RadialGauge,
} from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
// Data
import { BANK_ACCOUNTS, totalCashUsd } from '@/mocks/fixtures/bank-accounts';
import { BUDGET_LINES, computeVariance, totalsByKind, YTD_PRORATA } from '@/mocks/fixtures/budget-lines';
import { agingBuckets, CREDITOR_INVOICES } from '@/mocks/fixtures/creditors';
import { debtorAgingTotals, topDebtors, totalDebtors } from '@/mocks/fixtures/debtors-summary';
import { FIXED_ASSETS, totalsByCategory } from '@/mocks/fixtures/fixed-assets';
import { REVENUE_SOURCES, revenueYtdTotal, revenueTargetTotal } from '@/mocks/fixtures/revenue-sources';
import { ACTIVE_COUNT, employeesByDepartment, EMPLOYEES, DEPARTMENT_LABEL } from '@/mocks/fixtures/employees';
import { onLeaveToday, pendingLeaveCount } from '@/mocks/fixtures/leave';
import { PAYROLL_RUNS } from '@/mocks/fixtures/payroll';
import { totalsFleet, FUEL_LOGS } from '@/mocks/fixtures/fleet';
import { openCount as openWorkOrders, countByStatus } from '@/mocks/fixtures/work-orders';
import { SERVICE_REQUESTS } from '@/mocks/fixtures/service-requests';
import { CONTRACTS, burnPct, daysToExpiry } from '@/mocks/fixtures/contracts';
import { REQUISITIONS, countByStatus as reqByStatus } from '@/mocks/fixtures/requisitions';
import { TENDERS } from '@/mocks/fixtures/procurement-tenders';
import { ACTION_ITEMS, COUNCIL_MEETINGS, RESOLUTIONS, openActions } from '@/mocks/fixtures/council';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

export default function CeoDashboardPage() {
  // ─── Headline numbers ───
  const revYtd = revenueYtdTotal();
  const revTarget = revenueTargetTotal();
  const revPct = revTarget > 0 ? revYtd / revTarget : 0;
  const cash = totalCashUsd();
  const debtors = totalDebtors();
  const debtorAging = debtorAgingTotals();
  const creditorsAging = agingBuckets();
  const creditorsTotal = creditorsAging.current + creditorsAging.d30 + creditorsAging.d60 + creditorsAging.d90plus;
  const fa = totalsByCategory();
  const faNbv = Object.values(fa).reduce((s, c) => s + c.nbv, 0);
  const totals = totalsByKind();

  const byDept = employeesByDepartment();
  const latestPayroll = PAYROLL_RUNS[0]!;
  const fleet = totalsFleet();
  const wo = countByStatus();
  const openSR = SERVICE_REQUESTS.filter((r) => r.status !== 'resolved').length;
  const expiringContracts = CONTRACTS.filter((c) => c.status === 'expiring' || (daysToExpiry(c) <= 60 && daysToExpiry(c) > 0)).length;

  // ─── Chart datasets ───

  // Monthly revenue line (12 months synthetic)
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const revenueTrend = months.map((m, i) => {
    const base = 22_000 + i * 1_200;
    const jitter = Math.sin(i * 0.7) * 3_000;
    return {
      x: m,
      collected: Math.round(base + jitter),
      target: Math.round(revTarget / 12),
    };
  });

  // Revenue by source (YTD vs target)
  const revenueMix = REVENUE_SOURCES.map((s) => ({ x: s.shortCode, actual: s.ytdUsd, target: s.targetUsd }));

  // Expense composition (donut)
  const expenseByCategory = [
    { name: 'Salaries & allowances', value: 148_720, color: CHART_TOKENS.primary },
    { name: 'Goods & services',      value:  84_460, color: CHART_TOKENS.accent },
    { name: 'Transfers & grants',    value:  14_800, color: CHART_TOKENS.success },
    { name: 'Finance costs',          value:   4_820, color: CHART_TOKENS.warning },
    { name: 'Depreciation',           value:  36_250, color: CHART_TOKENS.sky },
  ];

  // Debtor aging buckets (stacked bar — single row)
  const debtorAgingBars = [{
    x: 'Debtors',
    current: debtorAging.current,
    d30: debtorAging.d30,
    d60: debtorAging.d60,
    d90plus: debtorAging.d90plus,
  }];

  // Cash trajectory (last 12 months synthetic)
  const cashTrend = months.map((m, i) => ({
    x: m,
    cash: Math.round(cash - (11 - i) * 8_000 + Math.sin(i * 0.5) * 4_000),
  }));

  // Budget consumption radial (revenue / expenses / capital)
  const budgetRadial = [
    { name: 'Revenue',  value: Math.round((totals.revenue.actual / totals.revenue.approved) * 100), fill: CHART_TOKENS.success },
    { name: 'Expenses', value: Math.round((totals.expense.actual / totals.expense.approved) * 100), fill: CHART_TOKENS.warning },
    { name: 'Capital',  value: Math.round((totals.capital.actual / totals.capital.approved) * 100), fill: CHART_TOKENS.primary },
  ];

  // Staff by department (horizontal bars)
  const staffByDept = Object.entries(byDept).map(([dept, emps]) => ({
    label: DEPARTMENT_LABEL[dept as keyof typeof DEPARTMENT_LABEL],
    value: emps.length,
  }));

  // Service request SLA (donut)
  const slaSplit = [
    { name: 'On-time',      value: SERVICE_REQUESTS.filter((r) => r.status === 'resolved').length, color: CHART_TOKENS.success },
    { name: 'In progress',  value: SERVICE_REQUESTS.filter((r) => r.status === 'in-progress' || r.status === 'assigned').length, color: CHART_TOKENS.primary },
    { name: 'Open',          value: SERVICE_REQUESTS.filter((r) => r.status === 'open').length, color: CHART_TOKENS.warning },
    { name: 'Reopened',      value: SERVICE_REQUESTS.filter((r) => r.status === 'reopened').length, color: CHART_TOKENS.danger },
  ];

  // Attention-needed items
  const attention = [
    ...ACTION_ITEMS.filter((a) => a.status === 'overdue').slice(0, 3).map((a) => ({
      kind: 'Overdue action', label: a.description, href: '/ceo/council', tone: 'danger' as const, meta: a.owner,
    })),
    ...CONTRACTS.filter((c) => c.status === 'expiring' || (daysToExpiry(c) <= 60 && daysToExpiry(c) > 0)).slice(0, 2).map((c) => ({
      kind: 'Contract expiring', label: c.title, href: '/ceo/operations', tone: 'warning' as const, meta: `${daysToExpiry(c)}d left`,
    })),
    ...REQUISITIONS.filter((r) => r.status === 'submitted').slice(0, 2).map((r) => ({
      kind: 'Requisition awaiting CFO', label: r.title, href: '/ceo/finance', tone: 'info' as const, meta: r.requestedBy,
    })),
    ...(revPct < YTD_PRORATA - 0.05 ? [{ kind: 'Revenue behind target', label: `${Math.round(revPct * 100)}% of FY target — pro-rata ${Math.round(YTD_PRORATA * 100)}%`, href: '/ceo/finance', tone: 'warning' as const, meta: '' }] : []),
  ];

  const expenseOverruns = BUDGET_LINES
    .filter((l) => l.kind === 'expense')
    .map((l) => computeVariance(l))
    .filter((v) => v.variancePct > 0.10).length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-[#8a6e13]">
              <ShieldCheck className="h-3 w-3" />
              Chief Executive
            </div>
            <h1 className="text-h1 text-ink">Executive dashboard</h1>
            <p className="mt-1 text-small text-muted">
              Every module, one screen. Drill down via the side nav to deep views.
            </p>
          </div>
          <div className="flex items-center gap-2 text-small">
            <Badge tone="success" dot>All systems operational</Badge>
            <Badge tone="brand">FY2026 Q2</Badge>
          </div>
        </div>
      </ScrollReveal>

      {/* 8 headline KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Kpi Icon={HandCoins}   label="Revenue YTD"      value={formatCurrency(revYtd)}           sub={`${Math.round(revPct * 100)}% of target`} trend={revPct >= YTD_PRORATA ? 'up' : 'down'} tone="brand" />
        <Kpi Icon={Wallet}      label="Cash at bank"     value={formatCurrency(cash)}              sub={`${BANK_ACCOUNTS.length} accounts`}        trend="up" tone="info" />
        <Kpi Icon={Users}       label="Debtors"          value={formatCurrency(debtors)}           sub={`${formatCurrency(debtorAging.d90plus)} 90+`} trend={debtorAging.d90plus > 2_000 ? 'up' : 'flat'} tone="warning" />
        <Kpi Icon={ReceiptText} label="Creditors"        value={formatCurrency(creditorsTotal)}    sub={`${CREDITOR_INVOICES.filter((i) => i.status !== 'paid').length} open`} tone="info" />
        <Kpi Icon={Users}       label="Active staff"     value={ACTIVE_COUNT.toString()}           sub={`${Object.keys(byDept).length} depts`} tone="brand" />
        <Kpi Icon={Building2}   label="Assets (NBV)"     value={formatCurrency(faNbv)}             sub={`${FIXED_ASSETS.filter((a) => a.status === 'active').length} items`} tone="success" />
        <Kpi Icon={Wrench}      label="Open WOs / SRs"   value={`${openWorkOrders()}/${openSR}`}   sub={`${wo.blocked ?? 0} blocked`} tone={(wo.blocked ?? 0) > 0 ? 'warning' : 'info'} />
        <Kpi Icon={Handshake}   label="Contract ceiling" value={formatCurrency(CONTRACTS.reduce((s, c) => s + c.ceilingUsd, 0))} sub={`${expiringContracts} expiring ≤ 60d`} tone={expiringContracts > 0 ? 'warning' : 'info'} />
      </div>

      {/* Revenue trend + Revenue mix */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell
            title="Monthly revenue"
            subtitle="Collections vs target — rolling 12 months"
            right={<TrendPill up={revPct >= YTD_PRORATA} />}
          >
            <LineTimeSeries
              data={revenueTrend}
              series={[
                { key: 'collected', label: 'Collected', color: CHART_TOKENS.primary },
                { key: 'target',     label: 'Target',    color: CHART_TOKENS.accent },
              ]}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell
            title="Revenue by source"
            subtitle="YTD against annual target"
          >
            <GroupedBars
              data={revenueMix}
              bars={[
                { key: 'target', label: 'Target',  color: CHART_TOKENS.primarySoft },
                { key: 'actual', label: 'YTD',     color: CHART_TOKENS.primary },
              ]}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Cash + Expense composition + Budget radial */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <ChartShell title="Cash at bank" subtitle="Combined balance — last 12 months">
            <AreaTimeSeries data={cashTrend} dataKey="cash" valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <ChartShell title="Expense composition" subtitle="YTD, by category">
            <Donut data={expenseByCategory} valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <ChartShell title="Budget consumption" subtitle={`Pro-rata ${Math.round(YTD_PRORATA * 100)}% · dashed ring shown as full 100%`}>
            <RadialGauge data={budgetRadial} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Debtor aging + Staff by department + SLA */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <ChartShell title="Debtor aging" subtitle="Stacked by bucket" height={220}>
            <GroupedBars
              data={debtorAgingBars}
              stacked
              bars={[
                { key: 'current', label: 'Current',  color: CHART_TOKENS.success },
                { key: 'd30',     label: '1–30 d',   color: CHART_TOKENS.sky },
                { key: 'd60',     label: '31–60 d',  color: CHART_TOKENS.warning },
                { key: 'd90plus', label: '61+ d',    color: CHART_TOKENS.danger },
              ]}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <div className="rounded-lg border border-line bg-card p-5">
            <div className="mb-4">
              <h3 className="text-body font-semibold text-ink">Staff by department</h3>
              <p className="mt-0.5 text-micro text-muted">{EMPLOYEES.length} on roll · {Object.keys(byDept).length} departments</p>
            </div>
            <HorizontalBars data={staffByDept} valueFormatter={(v) => v.toString()} maxBars={10} />
          </div>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <ChartShell title="Service request status" subtitle={`${SERVICE_REQUESTS.length} citizen issues this cycle`}>
            <Donut data={slaSplit} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Attention + Today at a glance */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wider text-danger">
                  <AlertTriangle className="h-3 w-3" /> Attention required
                </div>
                <h3 className="mt-1 text-h3 text-ink">Items needing the CEO's eye</h3>
              </div>
            </div>
            {attention.length === 0 ? (
              <div className="rounded-md border border-success/20 bg-success/5 p-4 text-small text-success">Nothing urgent. Everything is on track.</div>
            ) : (
              <ul className="divide-y divide-line">
                {attention.map((a, i) => (
                  <li key={i}>
                    <Link href={a.href} className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-surface/60">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge tone={a.tone}>{a.kind}</Badge>
                          {a.meta && <span className="text-micro text-muted">{a.meta}</span>}
                        </div>
                        <div className="mt-1 truncate-line text-small font-semibold text-ink">{a.label}</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {expenseOverruns > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 p-3 text-small text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span><span className="font-semibold">{expenseOverruns}</span> expense line{expenseOverruns === 1 ? '' : 's'} running &gt; 10 pp ahead of pro-rata.</span>
              </div>
            )}
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <Card className="h-full p-5">
            <h3 className="text-h3 text-ink">Today at a glance</h3>
            <ul className="mt-3 divide-y divide-line text-small">
              <Glance Icon={CalendarClock}  label="Scheduled meetings"   value={COUNCIL_MEETINGS.filter((m) => m.status === 'scheduled').length} href="/ceo/council" />
              <Glance Icon={CheckSquare}    label="Open action items"    value={openActions().length}                                             href="/ceo/council" />
              <Glance Icon={Gavel}          label="Resolutions passed"   value={RESOLUTIONS.filter((r) => r.status === 'passed' || r.status === 'actioned').length} href="/ceo/council" />
              <Glance Icon={ClipboardList}  label="Open service requests" value={openSR}                                                           href="/ceo/operations" />
              <Glance Icon={Wrench}          label="Open work orders"     value={openWorkOrders()}                                                 href="/ceo/operations" />
              <Glance Icon={Users}           label="Staff on leave today" value={onLeadLen()}                                                      href="/ceo/hr" />
              <Glance Icon={Handshake}       label="Tenders under eval"   value={TENDERS.filter((t) => t.stage === 'evaluation').length}          href="/ceo/operations" />
              <Glance Icon={ReceiptText}     label="Pending requisitions" value={reqByStatus().submitted}                                          href="/ceo/finance" />
            </ul>
          </Card>
        </ScrollReveal>
      </div>

      {/* Top debtors + payroll trend + fuel */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-h3 text-ink">Top 5 debtors</h3>
              <Link href="/ceo/finance" className="text-micro font-semibold text-brand-primary hover:underline">Finance →</Link>
            </div>
            <ul className="divide-y divide-line">
              {topDebtors(5).map((d) => (
                <li key={d.property.id} className="flex items-center justify-between gap-3 py-2.5 text-small">
                  <div className="min-w-0">
                    <div className="truncate-line font-semibold text-ink">{d.property.ownerName}</div>
                    <div className="truncate-line text-micro text-muted">{d.property.stand} · {d.property.ward}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="font-semibold text-danger">{formatCurrency(d.property.balanceUsd)}</div>
                    <Badge tone={d.bucket === 'd90plus' ? 'danger' : d.bucket === 'd60' ? 'warning' : d.bucket === 'd30' ? 'info' : 'success'}>
                      {d.bucket === 'd90plus' ? '90+' : d.bucket === 'd60' ? '31–60' : d.bucket === 'd30' ? '1–30' : 'Current'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={40}>
          <Card className="p-5">
            <div className="mb-2">
              <h3 className="text-h3 text-ink">Payroll trend</h3>
              <p className="text-micro text-muted">Net paid over last 3 runs</p>
            </div>
            <ul className="mt-4 space-y-3">
              {PAYROLL_RUNS.map((r, i) => {
                const pct = (r.netUsd / latestPayroll.netUsd) * 100;
                return (
                  <li key={r.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-3 text-small">
                    <div className="font-mono text-micro text-muted">{r.period}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="font-semibold tabular-nums text-ink">{formatCurrency(r.netUsd)}</div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-line pt-3 text-micro text-muted">
              Latest period status: <span className="font-semibold text-ink">{latestPayroll.status}</span> · {PAYROLL_RUNS.length} runs on file
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Card className="p-5">
            <div className="mb-2">
              <h3 className="text-h3 text-ink">Fleet & fuel</h3>
              <p className="text-micro text-muted">{fleet.active} of {fleet.total} vehicles active</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FleetTile label="Service due"        value={fleet.serviceDue} tone={fleet.serviceDue > 0 ? 'warning' : undefined} />
              <FleetTile label="Under 25% fuel"     value={fleet.fuelBelow25} tone={fleet.fuelBelow25 > 0 ? 'warning' : undefined} />
              <FleetTile label="Off the road"       value={fleet.total - fleet.active} tone="danger" />
              <FleetTile label="Refills MTD"        value={FUEL_LOGS.length} />
            </div>
            <div className="mt-4 rounded-md bg-surface/60 p-3 text-small text-ink">
              <div className="flex items-center justify-between">
                <span className="text-muted">Fuel spend MTD</span>
                <span className="font-semibold tabular-nums">{formatCurrency(FUEL_LOGS.reduce((s, f) => s + f.costUsd, 0))}</span>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Department shortcut cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AreaLink href="/ceo/finance"    tone="brand"   title="Finance & revenue" body="GL, budget execution, bank reconciliation, creditors, debtors, assets." />
        <AreaLink href="/ceo/operations" tone="success" title="Operations"         body="Service requests, work orders, fleet, procurement, contracts." />
        <AreaLink href="/ceo/hr"         tone="info"    title="People"             body="Headcount, leave balances, payroll runs, PAYE/NSSA/NEC." />
        <AreaLink href="/ceo/council"    tone="gold"    title="Governance"         body="Meetings, resolutions, action items, decision log." />
        <AreaLink href="/ceo/wards"      tone="brand"   title="Wards & projects"   body="Ward scorecard, capital programme, CAMPFIRE dividends." />
        <AreaLink href="/ceo/assets"     tone="success" title="Assets & estate"    body="Fixed asset register, carrying amounts, depreciation schedule." />
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────

function onLeadLen() { return onLeaveToday().length; }

function Kpi({ Icon, label, value, sub, trend, tone }: {
  Icon: React.ElementType; label: string; value: string; sub: string; trend?: 'up' | 'down' | 'flat';
  tone: 'brand' | 'info' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
    tone === 'success' ? 'bg-success/10       text-success' :
    tone === 'warning' ? 'bg-warning/10       text-warning' :
                         'bg-info/10          text-info';
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={cn('grid h-9 w-9 place-items-center rounded-md', toneClass)} aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        {trend === 'up'   && <ArrowUpRight   className="h-4 w-4 text-success" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-warning" />}
        {trend === 'flat' && <Minus          className="h-4 w-4 text-muted" />}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-body font-bold tabular-nums text-ink">{value}</div>
      <div className="text-[10px] text-muted">{sub}</div>
    </div>
  );
}

function TrendPill({ up }: { up: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
      up ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
    )}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? 'Ahead of plan' : 'Behind plan'}
    </span>
  );
}

function Glance({ Icon, label, value, href }: { Icon: React.ElementType; label: string; value: number; href: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 py-2.5 transition-colors hover:text-brand-primary">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 text-ink">{label}</span>
        <span className="text-body font-bold tabular-nums text-ink">{value}</span>
      </Link>
    </li>
  );
}

function FleetTile({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'danger' }) {
  const toneClass = tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-ink';
  return (
    <div className="rounded-md border border-line bg-surface/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('mt-1 text-body font-bold tabular-nums', toneClass)}>{value}</div>
    </div>
  );
}

function AreaLink({ href, title, body, tone }: { href: string; title: string; body: string; tone: 'brand' | 'success' | 'info' | 'gold' }) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
    tone === 'success' ? 'bg-success/10       text-success' :
    tone === 'gold'    ? 'bg-brand-accent/15  text-[#8a6e13]' :
                         'bg-info/10          text-info';
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-lg border border-line bg-card p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md">
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-md', toneClass)}><TrendingUp className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-body font-semibold text-ink group-hover:text-brand-primary">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="mt-1 text-small text-muted">{body}</p>
      </div>
    </Link>
  );
}
