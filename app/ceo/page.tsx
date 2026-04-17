// ─────────────────────────────────────────────
// CEO executive dashboard — the landing view for
// the Chief Executive after login. Combines
// headline KPIs (with sparklines), a varied mix
// of chart types (line, stacked area, bullet,
// treemap, radar, scatter, heatmap) and an
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
  Bullet,
  ChartShell,
  ComboChart,
  Donut,
  FunnelPlot,
  Heatmap,
  HorizontalBars,
  LineTimeSeries,
  ProgressRing,
  RadarPlot,
  ScatterPlot,
  Sparkline,
  StackedArea,
  TreemapPlot,
} from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
// Data
import { BANK_ACCOUNTS, totalCashUsd } from '@/mocks/fixtures/bank-accounts';
import { BUDGET_LINES, computeVariance, totalsByKind, YTD_PRORATA } from '@/mocks/fixtures/budget-lines';
import { agingBuckets, CREDITOR_INVOICES } from '@/mocks/fixtures/creditors';
import { classifyDebtors, debtorAgingTotals, topDebtors, totalDebtors } from '@/mocks/fixtures/debtors-summary';
import { FIXED_ASSETS, totalsByCategory } from '@/mocks/fixtures/fixed-assets';
import { REVENUE_SOURCES, revenueYtdTotal, revenueTargetTotal } from '@/mocks/fixtures/revenue-sources';
import { ACTIVE_COUNT, employeesByDepartment, EMPLOYEES, DEPARTMENT_LABEL } from '@/mocks/fixtures/employees';
import { onLeaveToday } from '@/mocks/fixtures/leave';
import { PAYROLL_RUNS } from '@/mocks/fixtures/payroll';
import { totalsFleet, FUEL_LOGS } from '@/mocks/fixtures/fleet';
import { openCount as openWorkOrders, countByStatus } from '@/mocks/fixtures/work-orders';
import { SERVICE_REQUESTS, CATEGORY_LABEL as SR_CAT_LABEL } from '@/mocks/fixtures/service-requests';
import { CONTRACTS, daysToExpiry } from '@/mocks/fixtures/contracts';
import { REQUISITIONS, countByStatus as reqByStatus } from '@/mocks/fixtures/requisitions';
import { TENDERS, countByStage as tenderCountByStage } from '@/mocks/fixtures/procurement-tenders';
import { ACTION_ITEMS, COUNCIL_MEETINGS, RESOLUTIONS, openActions } from '@/mocks/fixtures/council';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

// Deterministic "synthetic" trend generator — keeps sparkline shapes varied
// without introducing runtime randomness (would hydrate-mismatch).
function synthTrend(seed: number, n = 12, base = 20, amp = 10): number[] {
  return Array.from({ length: n }, (_, i) => {
    const v = base + Math.sin((i + seed) * 0.7) * amp + (i * amp) / (n * 2);
    return Math.max(0, Math.round(v * 10) / 10);
  });
}

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

  // Monthly revenue — combo chart (target as bar, collected as line)
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

  // Revenue mix as stacked area over 12 months (synthetic monthly split)
  const revenueMixStacked = months.map((m, i) => {
    const row: Record<string, number | string> = { x: m };
    for (const s of REVENUE_SOURCES) {
      const monthlyShare = s.ytdUsd / 12;
      const jitter = 1 + Math.sin((i + s.shortCode.length) * 0.9) * 0.18;
      row[s.shortCode] = Math.round(monthlyShare * jitter);
    }
    return row;
  });

  // Expense composition → treemap (better than donut for 5+ slices)
  const expenseByCategory = [
    { name: 'Salaries',             value: 148_720, color: CHART_TOKENS.primary },
    { name: 'Goods & services',     value:  84_460, color: CHART_TOKENS.accent },
    { name: 'Transfers & grants',   value:  14_800, color: CHART_TOKENS.success },
    { name: 'Finance costs',        value:   4_820, color: CHART_TOKENS.warning },
    { name: 'Depreciation',         value:  36_250, color: CHART_TOKENS.sky },
  ];

  // Cash trajectory (last 12 months synthetic)
  const cashTrend = months.map((m, i) => ({
    x: m,
    cash: Math.round(cash - (11 - i) * 8_000 + Math.sin(i * 0.5) * 4_000),
  }));

  // Service request SLA donut (kept — this one is well-suited to a donut)
  const slaSplit = [
    { name: 'On-time',      value: SERVICE_REQUESTS.filter((r) => r.status === 'resolved').length, color: CHART_TOKENS.success },
    { name: 'In progress',  value: SERVICE_REQUESTS.filter((r) => r.status === 'in-progress' || r.status === 'assigned').length, color: CHART_TOKENS.primary },
    { name: 'Open',          value: SERVICE_REQUESTS.filter((r) => r.status === 'open').length, color: CHART_TOKENS.warning },
    { name: 'Reopened',      value: SERVICE_REQUESTS.filter((r) => r.status === 'reopened').length, color: CHART_TOKENS.danger },
  ];

  // Scatter: debtor aging — balance (y) vs days overdue (x), bubble size = balance
  const today = new Date('2026-04-17');
  const debtorScatter = classifyDebtors(today).slice(0, 40).map((d) => {
    const overdueDays = Math.max(
      0,
      Math.floor((today.getTime() - new Date(d.property.nextDueAt).getTime()) / (1000 * 60 * 60 * 24)),
    );
    return {
      x: overdueDays,
      y: d.property.balanceUsd,
      z: d.property.balanceUsd,
      label: d.property.ownerName,
    };
  });

  // Radar: multi-dim department comparison
  const radarDimensions = [
    { axis: 'Headcount',       scale: 20 },
    { axis: 'Paybill ($k)',    scale: 40 },
    { axis: 'Open SRs',        scale: 15 },
    { axis: 'Open WOs',        scale: 15 },
    { axis: 'Overdue actions', scale: 6 },
  ];
  const topDepts = Object.entries(byDept)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);
  const radarData = radarDimensions.map((dim) => {
    const row: Record<string, number | string> = { axis: dim.axis };
    topDepts.forEach(([code, emps]) => {
      let v = 0;
      if (dim.axis === 'Headcount') v = emps.length;
      else if (dim.axis === 'Paybill ($k)') v = Math.round(emps.reduce((s, e) => s + e.basicMonthlyUsd, 0) / 1000);
      else if (dim.axis === 'Open SRs') v = SERVICE_REQUESTS.filter((r) => r.status !== 'resolved').length / topDepts.length; // proxy
      else if (dim.axis === 'Open WOs') v = (wo['in-progress'] ?? 0) / topDepts.length;
      else if (dim.axis === 'Overdue actions') v = ACTION_ITEMS.filter((a) => a.status === 'overdue' && a.department === code).length;
      row[code] = Math.round(v);
    });
    return row;
  });

  // Heatmap: service requests by ward × category
  const srWards = [...new Set(SERVICE_REQUESTS.map((r) => r.ward))].sort().slice(0, 10);
  const srCats = [...new Set(SERVICE_REQUESTS.map((r) => r.category))];
  const heatCells: Record<string, Record<string, number>> = {};
  for (const w of srWards) {
    heatCells[w] = {};
    for (const c of srCats) heatCells[w][c] = 0;
  }
  for (const r of SERVICE_REQUESTS) {
    if (heatCells[r.ward] && r.category in heatCells[r.ward]!) {
      heatCells[r.ward]![r.category] = (heatCells[r.ward]![r.category] ?? 0) + 1;
    }
  }
  const heatColLabels = srCats.map((c) => {
    const label = (SR_CAT_LABEL as Record<string, string>)[c] ?? c;
    return label.length > 10 ? label.slice(0, 10) + '…' : label;
  });
  const heatCellsRelabelled: Record<string, Record<string, number>> = {};
  for (const w of srWards) {
    heatCellsRelabelled[w] = {};
    srCats.forEach((c, i) => {
      heatCellsRelabelled[w]![heatColLabels[i]!] = heatCells[w]![c] ?? 0;
    });
  }

  // Tender funnel (proper funnel)
  const tenderStageCounts = tenderCountByStage();
  const tenderFunnel = [
    { name: 'Advertised',  value: tenderStageCounts.advertised ?? 0 },
    { name: 'Closed',      value: tenderStageCounts.closed ?? 0 },
    { name: 'Evaluation',  value: tenderStageCounts.evaluation ?? 0 },
    { name: 'Recommended', value: tenderStageCounts['award-recommended'] ?? 0 },
    { name: 'Awarded',     value: tenderStageCounts.award ?? 0 },
    { name: 'Signed',      value: tenderStageCounts['contract-signed'] ?? 0 },
  ].filter((r) => r.value > 0);

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

      {/* 8 headline KPIs with sparklines */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Kpi Icon={HandCoins}   label="Revenue YTD"      value={formatCurrency(revYtd)}           sub={`${Math.round(revPct * 100)}% of target`} trend={revPct >= YTD_PRORATA ? 'up' : 'down'} tone="brand"   sparkSeed={1} sparkColor={CHART_TOKENS.primary} />
        <Kpi Icon={Wallet}      label="Cash at bank"     value={formatCurrency(cash)}              sub={`${BANK_ACCOUNTS.length} accounts`}        trend="up"  tone="info"    sparkSeed={3} sparkColor={CHART_TOKENS.sky} />
        <Kpi Icon={Users}       label="Debtors"          value={formatCurrency(debtors)}           sub={`${formatCurrency(debtorAging.d90plus)} 90+`} trend={debtorAging.d90plus > 2_000 ? 'up' : 'flat'} tone="warning" sparkSeed={5} sparkColor={CHART_TOKENS.warning} />
        <Kpi Icon={ReceiptText} label="Creditors"        value={formatCurrency(creditorsTotal)}    sub={`${CREDITOR_INVOICES.filter((i) => i.status !== 'paid').length} open`} tone="info"    sparkSeed={7} sparkColor={CHART_TOKENS.accent} />
        <Kpi Icon={Users}       label="Active staff"     value={ACTIVE_COUNT.toString()}           sub={`${Object.keys(byDept).length} depts`} tone="brand"   sparkSeed={9}  sparkColor={CHART_TOKENS.primary} />
        <Kpi Icon={Building2}   label="Assets (NBV)"     value={formatCurrency(faNbv)}             sub={`${FIXED_ASSETS.filter((a) => a.status === 'active').length} items`} tone="success" sparkSeed={11} sparkColor={CHART_TOKENS.success} />
        <Kpi Icon={Wrench}      label="Open WOs / SRs"   value={`${openWorkOrders()}/${openSR}`}   sub={`${wo.blocked ?? 0} blocked`} tone={(wo.blocked ?? 0) > 0 ? 'warning' : 'info'} sparkSeed={13} sparkColor={CHART_TOKENS.danger} />
        <Kpi Icon={Handshake}   label="Contract ceiling" value={formatCurrency(CONTRACTS.reduce((s, c) => s + c.ceilingUsd, 0))} sub={`${expiringContracts} expiring ≤ 60d`} tone={expiringContracts > 0 ? 'warning' : 'info'} sparkSeed={15} sparkColor={CHART_TOKENS.violet} />
      </div>

      {/* Revenue combo + Budget gauges */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal>
          <ChartShell
            title="Monthly revenue"
            subtitle="Collections vs monthly target — rolling 12 months"
            right={<TrendPill up={revPct >= YTD_PRORATA} />}
            height={280}
          >
            <ComboChart
              data={revenueTrend}
              bars={[{ key: 'target', label: 'Monthly target', color: CHART_TOKENS.primarySoft }]}
              lines={[{ key: 'collected', label: 'Collected', color: CHART_TOKENS.primary }]}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="h-full p-5">
            <div className="mb-1">
              <h3 className="text-body font-semibold text-ink">Budget consumption</h3>
              <p className="mt-0.5 text-micro text-muted">Pro-rata {Math.round(YTD_PRORATA * 100)}%</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-[140px]">
                <ProgressRing
                  value={Math.round((totals.revenue.actual / Math.max(1, totals.revenue.approved)) * 100)}
                  label="Revenue"
                  color={CHART_TOKENS.success}
                />
              </div>
              <div className="h-[140px]">
                <ProgressRing
                  value={Math.round((totals.expense.actual / Math.max(1, totals.expense.approved)) * 100)}
                  label="Expense"
                  color={CHART_TOKENS.warning}
                />
              </div>
              <div className="h-[140px]">
                <ProgressRing
                  value={Math.round((totals.capital.actual / Math.max(1, totals.capital.approved)) * 100)}
                  label="Capital"
                  color={CHART_TOKENS.primary}
                />
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Revenue mix stacked area + Expense treemap + Cash area */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <ChartShell title="Revenue mix" subtitle="Monthly contribution by source">
            <StackedArea
              data={revenueMixStacked}
              series={REVENUE_SOURCES.slice(0, 5).map((s, i) => ({
                key: s.shortCode,
                label: s.shortCode,
                color: [CHART_TOKENS.primary, CHART_TOKENS.accent, CHART_TOKENS.success, CHART_TOKENS.sky, CHART_TOKENS.violet][i],
              }))}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <ChartShell title="Expense composition" subtitle="YTD, by category">
            <TreemapPlot data={expenseByCategory} valueFormatter={(v) => money(v)} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <ChartShell title="Cash at bank" subtitle="Combined balance — 12 months">
            <AreaTimeSeries data={cashTrend} dataKey="cash" valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Revenue bullets + SLA donut + Dept radar */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-body font-semibold text-ink">Revenue vs target</h3>
              <p className="mt-0.5 text-micro text-muted">Bar = YTD collected · tick = annual target</p>
            </div>
            <div className="flex flex-col gap-3">
              {REVENUE_SOURCES.slice(0, 6).map((s) => {
                const ratio = s.ytdUsd / Math.max(1, s.targetUsd);
                const tone: 'success' | 'warning' | 'danger' | 'brand' =
                  ratio >= YTD_PRORATA ? 'success' :
                  ratio >= YTD_PRORATA - 0.1 ? 'brand' :
                  ratio >= YTD_PRORATA - 0.25 ? 'warning' :
                  'danger';
                return (
                  <Bullet
                    key={s.shortCode}
                    label={s.shortCode}
                    actual={s.ytdUsd}
                    target={s.targetUsd}
                    tone={tone}
                    valueFormatter={money}
                  />
                );
              })}
            </div>
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <ChartShell title="Service request status" subtitle={`${SERVICE_REQUESTS.length} citizen issues this cycle`}>
            <Donut data={slaSplit} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <ChartShell title="Department comparison" subtitle="Top 3 departments across 5 dimensions">
            <RadarPlot
              data={radarData}
              series={topDepts.map(([code]) => ({
                label: DEPARTMENT_LABEL[code as keyof typeof DEPARTMENT_LABEL],
                key: code,
              }))}
            />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Scatter + Heatmap + Funnel */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <ChartShell title="Debtor profile" subtitle="Balance vs days overdue — each dot is an account">
            <ScatterPlot
              data={debtorScatter}
              xLabel="Days overdue"
              yLabel="Balance"
              xFormatter={(v) => `${v}d`}
              yFormatter={money}
              color={CHART_TOKENS.danger}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <Card className="p-5">
            <div className="mb-3">
              <h3 className="text-body font-semibold text-ink">Service requests</h3>
              <p className="mt-0.5 text-micro text-muted">Intensity by ward × category</p>
            </div>
            <Heatmap
              rows={srWards}
              cols={heatColLabels}
              cells={heatCellsRelabelled}
              valueFormatter={(v) => v.toString()}
            />
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

      {/* Attention + Today at a glance */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wider text-danger">
                  <AlertTriangle className="h-3 w-3" /> Attention required
                </div>
                <h3 className="mt-1 text-h3 text-ink">Items needing the CEO&apos;s eye</h3>
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
              <Glance Icon={Users}           label="Staff on leave today" value={onLeaveToday().length}                                            href="/ceo/hr" />
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
              {PAYROLL_RUNS.map((r) => {
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
              <h3 className="text-h3 text-ink">Fleet &amp; fuel</h3>
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

function Kpi({ Icon, label, value, sub, trend, tone, sparkSeed, sparkColor }: {
  Icon: React.ElementType; label: string; value: string; sub: string; trend?: 'up' | 'down' | 'flat';
  tone: 'brand' | 'info' | 'success' | 'warning';
  sparkSeed: number;
  sparkColor: string;
}) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
    tone === 'success' ? 'bg-success/10       text-success' :
    tone === 'warning' ? 'bg-warning/10       text-warning' :
                         'bg-info/10          text-info';
  const spark = synthTrend(sparkSeed, 12, 18, 9);
  return (
    <div className="flex flex-col rounded-lg border border-line bg-card p-4">
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
      <div className="mt-2">
        <Sparkline data={spark} color={sparkColor} height={24} width={120} />
      </div>
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
