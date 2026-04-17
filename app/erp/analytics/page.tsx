// Executive analytics — one canvas that pulls every KPI a CEO /
// council leader would open the app for. Unifies Finance, HR,
// Works, Procurement, Council and citizen-service modules.

'use client';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  Gavel,
  Handshake,
  HandCoins,
  Landmark,
  Minus,
  ReceiptText,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
// Finance
import { BANK_ACCOUNTS, totalCashUsd } from '@/mocks/fixtures/bank-accounts';
import { BUDGET_LINES, computeVariance, totalsByKind, YTD_PRORATA } from '@/mocks/fixtures/budget-lines';
import { agingBuckets, CREDITOR_INVOICES } from '@/mocks/fixtures/creditors';
import { debtorAgingTotals, topDebtors, totalDebtors } from '@/mocks/fixtures/debtors-summary';
import { FIXED_ASSETS, totalsByCategory } from '@/mocks/fixtures/fixed-assets';
import { REVENUE_SOURCES, revenueTargetTotal, revenueYtdTotal } from '@/mocks/fixtures/revenue-sources';
// HR
import { ACTIVE_COUNT, EMPLOYEES, TOTAL_MONTHLY_GROSS, employeesByDepartment } from '@/mocks/fixtures/employees';
import { onLeaveToday, pendingLeaveCount } from '@/mocks/fixtures/leave';
// Works
import { totalsFleet, FUEL_LOGS } from '@/mocks/fixtures/fleet';
import { countByStatus as woByStatus, openCount as openWorkOrders } from '@/mocks/fixtures/work-orders';
// Service requests
import { SERVICE_REQUESTS } from '@/mocks/fixtures/service-requests';
// Procurement
import { CONTRACTS, burnPct, daysToExpiry } from '@/mocks/fixtures/contracts';
import { REQUISITIONS, countByStatus as reqByStatus } from '@/mocks/fixtures/requisitions';
import { TENDERS, countByStage } from '@/mocks/fixtures/procurement-tenders';
// Council
import { ACTION_ITEMS, COUNCIL_MEETINGS, RESOLUTIONS, openActions } from '@/mocks/fixtures/council';
// Payroll
import { PAYROLL_RUNS } from '@/mocks/fixtures/payroll';
import { cn } from '@/lib/cn';

export default function ExecutiveAnalyticsPage() {
  // ─── Finance ───
  const cash = totalCashUsd();
  const revYtd = revenueYtdTotal();
  const revTarget = revenueTargetTotal();
  const revPct = revTarget > 0 ? revYtd / revTarget : 0;
  const debtors = totalDebtors();
  const debtorAging = debtorAgingTotals();
  const creditorsAging = agingBuckets();
  const creditorsTotal = creditorsAging.current + creditorsAging.d30 + creditorsAging.d60 + creditorsAging.d90plus;
  const fa = totalsByCategory();
  const faNbv = Object.values(fa).reduce((s, c) => s + c.nbv, 0);
  const totals = totalsByKind();
  const expenseOverruns = BUDGET_LINES
    .filter((l) => l.kind === 'expense')
    .map((l) => computeVariance(l))
    .filter((v) => v.variancePct > 0.10).length;

  // ─── HR ───
  const byDept = employeesByDepartment();
  const onLeave = onLeaveToday().length;
  const pendingLeave = pendingLeaveCount();
  const latestPayroll = PAYROLL_RUNS[0]!;

  // ─── Works ───
  const fleet = totalsFleet();
  const wo = woByStatus();
  const openWo = openWorkOrders();
  const openSR = SERVICE_REQUESTS.filter((r) => r.status !== 'resolved').length;
  const fuelMtd = FUEL_LOGS.reduce((s, f) => s + f.costUsd, 0);

  // ─── Procurement ───
  const reqs = reqByStatus();
  const pendingReqs = reqs.submitted + reqs.approved + reqs['po-raised'] + reqs['grv-received'];
  const activeContracts = CONTRACTS.filter((c) => c.status === 'active').length;
  const expiringContracts = CONTRACTS.filter((c) => c.status === 'expiring' || (daysToExpiry(c) <= 60 && daysToExpiry(c) > 0)).length;
  const evaluatingTenders = countByStage().evaluation ?? 0;
  const totalContractCeiling = CONTRACTS.filter((c) => c.status === 'active').reduce((s, c) => s + c.ceilingUsd, 0);
  const totalContractBurn = CONTRACTS.reduce((s, c) => s + c.consumedUsd, 0);

  // ─── Council ───
  const open = openActions();
  const overdue = ACTION_ITEMS.filter((a) => a.status === 'overdue').length;
  const upcoming = COUNCIL_MEETINGS.filter((m) => m.status === 'scheduled').length;
  const passed = RESOLUTIONS.filter((r) => r.status === 'passed' || r.status === 'actioned').length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 text-micro font-semibold uppercase tracking-wider text-brand-accent">
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-brand-accent pulse-dot" />
            CEO view
          </div>
          <h1 className="text-h1 text-ink">Executive analytics</h1>
          <p className="mt-1 text-small text-muted">
            Every module at a glance — revenue to council actions, unified for the leadership team.
          </p>
        </div>
      </ScrollReveal>

      {/* The 6 headline KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Headline tone="brand"   Icon={HandCoins}     label="Revenue YTD"    value={formatCurrency(revYtd)} sub={`${Math.round(revPct * 100)}% of annual target`} href="/erp/finance/budget" trend={revPct >= YTD_PRORATA ? 'up' : 'down'} />
        <Headline tone="info"    Icon={Wallet}        label="Cash at bank"    value={formatCurrency(cash)}     sub={`${BANK_ACCOUNTS.length} accounts`}                                 href="/erp/finance/bank-reconciliation" />
        <Headline tone="warning" Icon={Users}         label="Debtors"          value={formatCurrency(debtors)}   sub={`${formatCurrency(debtorAging.d90plus)} over 60 days`}             href="/erp/finance/debtors" trend={debtorAging.d90plus > 2_000 ? 'up' : 'flat'} />
        <Headline tone="info"    Icon={ReceiptText}   label="Creditors"        value={formatCurrency(creditorsTotal)} sub={`${CREDITOR_INVOICES.filter((i) => i.status !== 'paid').length} open invoices`}  href="/erp/finance/creditors" />
        <Headline tone="brand"   Icon={Users}         label="Active staff"     value={ACTIVE_COUNT.toString()}   sub={`${Object.keys(byDept).length} depts · ${pendingLeave} leave pending`} href="/erp/hr" />
        <Headline tone="success" Icon={Building2}     label="Assets (NBV)"     value={formatCurrency(faNbv)}     sub={`${FIXED_ASSETS.filter((a) => a.status === 'active').length} items`}                   href="/erp/finance/fixed-assets" />
      </div>

      {/* Budget execution + Today at a glance */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-micro font-bold uppercase tracking-wider text-muted">Budget execution</div>
                <h2 className="mt-1 text-h3 text-ink">Revenue vs expense vs capital</h2>
                <p className="text-micro text-muted">Pro-rata expected at today: {Math.round(YTD_PRORATA * 100)}%</p>
              </div>
              <Link href="/erp/finance/budget" className="text-micro font-semibold text-brand-primary hover:underline">Open full budget →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <BudgetTile label="Revenue"  approved={totals.revenue.approved} actual={totals.revenue.actual} tone="success" />
              <BudgetTile label="Expenses" approved={totals.expense.approved} actual={totals.expense.actual} tone="warning" />
              <BudgetTile label="Capital"  approved={totals.capital.approved} actual={totals.capital.actual} tone="brand" />
            </div>
            {expenseOverruns > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 p-3 text-small text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div><span className="font-semibold">{expenseOverruns}</span> expense line{expenseOverruns === 1 ? '' : 's'} running more than 10 pp ahead of pro-rata.</div>
              </div>
            )}
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <Card className="h-full p-5">
            <h2 className="text-h3 text-ink">Today at a glance</h2>
            <ul className="mt-3 divide-y divide-line text-small">
              <GlanceRow Icon={CalendarClock} label="Council meetings scheduled"  value={upcoming} href="/erp/council/meetings" />
              <GlanceRow Icon={CheckSquare}   label="Action items open"           value={open.length} tone={overdue > 0 ? 'danger' : undefined} sub={`${overdue} overdue`} href="/erp/council/actions" />
              <GlanceRow Icon={ClipboardList} label="Service requests open"       value={openSR} href="/erp/requests" />
              <GlanceRow Icon={Wrench}        label="Work orders open"             value={openWo} sub={`${wo.blocked ?? 0} blocked`} href="/erp/works/work-orders" />
              <GlanceRow Icon={Truck}         label="Fleet · service due"          value={fleet.serviceDue} sub={`${fleet.fuelBelow25} under 25% fuel`} href="/erp/works/fleet" />
              <GlanceRow Icon={ShoppingCart}  label="Procurement pending"         value={pendingReqs} sub={`${reqs.submitted} awaiting CFO`} href="/erp/procurement/requisitions" />
              <GlanceRow Icon={Handshake}     label="Contracts expiring \u2264 60 days"  value={expiringContracts} tone={expiringContracts > 0 ? 'warning' : undefined} href="/erp/procurement/contracts" />
              <GlanceRow Icon={Users}         label="Staff on leave today"        value={onLeave} href="/erp/hr/leave" />
            </ul>
          </Card>
        </ScrollReveal>
      </div>

      {/* Revenue by source */}
      <div className="mt-6">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-micro font-bold uppercase tracking-wider text-muted">Revenue mix</div>
                <h2 className="mt-1 text-h3 text-ink">By source — YTD vs target</h2>
              </div>
              <Link href="/erp/billing" className="text-micro font-semibold text-brand-primary hover:underline">Open billing →</Link>
            </div>

            <ul className="space-y-2.5">
              {REVENUE_SOURCES.map((s) => {
                const pct = s.targetUsd > 0 ? s.ytdUsd / s.targetUsd : 0;
                const behind = pct < YTD_PRORATA - 0.05;
                return (
                  <li key={s.id} className="grid grid-cols-[140px_1fr_auto] items-center gap-4">
                    <div className="truncate-line text-small font-medium text-ink">{s.label}</div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-line">
                      <span
                        className={cn('block h-full rounded-full', behind ? 'bg-warning' : pct >= YTD_PRORATA + 0.05 ? 'bg-success' : 'bg-brand-primary')}
                        style={{ width: `${Math.min(100, pct * 100)}%` }}
                      />
                      {/* Pro-rata marker */}
                      <span className="absolute top-0 h-full w-[1px] bg-ink/40" style={{ left: `${YTD_PRORATA * 100}%` }} aria-hidden />
                    </div>
                    <div className="w-36 text-right tabular-nums text-small">
                      <span className="font-semibold text-ink">{formatCurrency(s.ytdUsd)}</span>
                      <span className="ml-2 text-[10px] text-muted">of {formatCurrency(s.targetUsd)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </ScrollReveal>
      </div>

      {/* Procurement + Council + HR/Payroll row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ScrollReveal delay={60}>
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">Procurement</h2>
              <Link href="/erp/procurement" className="text-micro font-semibold text-brand-primary hover:underline">Open</Link>
            </div>
            <dl className="divide-y divide-line text-small">
              <MiniRow label="Requisitions on file" value={REQUISITIONS.length} />
              <MiniRow label="Pending approval"     value={reqs.submitted} tone={reqs.submitted > 0 ? 'warning' : undefined} />
              <MiniRow label="Open tenders"         value={TENDERS.filter((t) => t.stage !== 'contract-signed' && t.stage !== 'cancelled').length} />
              <MiniRow label="Under evaluation"     value={evaluatingTenders} />
              <MiniRow label="Active contracts"     value={activeContracts} />
              <MiniRow label="Contract ceiling"     value={formatCurrency(totalContractCeiling)} wide />
              <MiniRow label="Consumed YTD"         value={formatCurrency(totalContractBurn)} wide />
            </dl>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">Council workflow</h2>
              <Link href="/erp/council" className="text-micro font-semibold text-brand-primary hover:underline">Open</Link>
            </div>
            <dl className="divide-y divide-line text-small">
              <MiniRow label="Meetings scheduled"      value={upcoming} />
              <MiniRow label="Resolutions passed"      value={passed} />
              <MiniRow label="Open action items"       value={open.length} />
              <MiniRow label="Overdue items"           value={overdue} tone={overdue > 0 ? 'danger' : undefined} />
              <MiniRow label="Total meetings YTD"      value={COUNCIL_MEETINGS.length} />
            </dl>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">HR &amp; Payroll</h2>
              <Link href="/erp/hr" className="text-micro font-semibold text-brand-primary hover:underline">Open</Link>
            </div>
            <dl className="divide-y divide-line text-small">
              <MiniRow label="Staff on roll"           value={EMPLOYEES.length} />
              <MiniRow label="Active"                   value={ACTIVE_COUNT} />
              <MiniRow label="On leave today"           value={onLeave} />
              <MiniRow label="Leave awaiting approval" value={pendingLeave} tone={pendingLeave > 0 ? 'warning' : undefined} />
              <MiniRow label="Monthly gross bill"      value={formatCurrency(TOTAL_MONTHLY_GROSS)} wide />
              <MiniRow label="Latest payroll net"      value={formatCurrency(latestPayroll.netUsd)} wide />
            </dl>
          </Card>
        </ScrollReveal>
      </div>

      {/* Top debtors */}
      <div className="mt-6">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">Top 5 debtors</h2>
              <Link href="/erp/finance/debtors" className="text-micro font-semibold text-brand-primary hover:underline">Full debtor ledger →</Link>
            </div>
            <ul className="divide-y divide-line">
              {topDebtors(5).map((d) => (
                <li key={d.property.id} className="flex items-center justify-between gap-3 py-2.5 text-small">
                  <div className="min-w-0">
                    <Link href={`/erp/residents/${d.property.ownerId}`} className="truncate-line block font-semibold text-ink hover:text-brand-primary">{d.property.ownerName}</Link>
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
      </div>

      {/* Footnote links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <FootLink href="/erp/cadastre"            Icon={Landmark}      label="Cadastral map" />
        <FootLink href="/erp/finance/gl"          Icon={BookOpen}      label="General ledger" />
        <FootLink href="/erp/finance/reports"     Icon={ReceiptText}   label="IPSAS reports" />
        <FootLink href="/erp/hr/payroll"          Icon={Wallet}        label="Payroll runs" />
        <FootLink href="/erp/procurement/tenders" Icon={Handshake}     label="Tenders" />
        <FootLink href="/erp/council/resolutions" Icon={Gavel}         label="Resolutions" />
      </div>
    </div>
  );
}

function Headline({ Icon, label, value, sub, href, tone, trend }: {
  Icon: React.ElementType; label: string; value: string; sub: string; href: string;
  tone: 'brand' | 'info' | 'success' | 'warning'; trend?: 'up' | 'down' | 'flat';
}) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
    tone === 'success' ? 'bg-success/10       text-success' :
    tone === 'warning' ? 'bg-warning/10       text-warning' :
                         'bg-info/10          text-info';
  return (
    <Link href={href} className="group flex flex-col gap-2 rounded-lg border border-line bg-card p-4 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
      <div className="flex items-center justify-between">
        <span className={cn('grid h-9 w-9 place-items-center rounded-md', toneClass)}><Icon className="h-4 w-4" /></span>
        {trend === 'up'   && <ArrowUpRight   className="h-4 w-4 text-success" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-warning" />}
        {trend === 'flat' && <Minus          className="h-4 w-4 text-muted" />}
      </div>
      <div className="text-micro font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="text-h3 font-bold tabular-nums text-ink">{value}</div>
      <div className="text-[10px] text-muted">{sub}</div>
    </Link>
  );
}

function BudgetTile({ label, approved, actual, tone }: { label: string; approved: number; actual: number; tone: 'success' | 'warning' | 'brand' }) {
  const pct = approved > 0 ? actual / approved : 0;
  return (
    <div className="rounded-md border border-line bg-surface/40 p-3">
      <Badge tone={tone}>{label}</Badge>
      <div className="mt-2 text-h3 font-bold tabular-nums text-ink">{formatCurrency(actual)}</div>
      <div className="text-micro text-muted">of {formatCurrency(approved)}</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <span className={cn('block h-full rounded-full', tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : 'bg-brand-primary')} style={{ width: `${Math.min(100, pct * 100)}%` }} />
      </div>
      <div className="mt-1 text-[10px] tabular-nums text-muted">{Math.round(pct * 100)}% consumed</div>
    </div>
  );
}

function GlanceRow({ Icon, label, value, sub, tone, href }: { Icon: React.ElementType; label: string; value: number; sub?: string; tone?: 'warning' | 'danger'; href: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 py-2.5 transition-colors hover:text-brand-primary">
        <span className={cn('grid h-7 w-7 place-items-center rounded-md', tone === 'danger' ? 'bg-danger/10 text-danger' : tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-brand-primary/10 text-brand-primary')} aria-hidden>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-ink">{label}</span>
          {sub && <span className="block text-micro text-muted">{sub}</span>}
        </span>
        <span className={cn('text-body font-bold tabular-nums', tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-ink')}>{value}</span>
      </Link>
    </li>
  );
}

function MiniRow({ label, value, tone, wide }: { label: string; value: string | number; tone?: 'warning' | 'danger'; wide?: boolean }) {
  const toneClass = tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-ink';
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className={cn('font-semibold tabular-nums', toneClass, wide && 'text-small')}>{value}</dd>
    </div>
  );
}

function FootLink({ href, Icon, label }: { href: string; Icon: React.ElementType; label: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2 rounded-md border border-line bg-card px-3 py-2 text-small transition-colors hover:border-brand-primary/25 hover:bg-brand-primary/5">
      <Icon className="h-3.5 w-3.5 text-brand-primary" />
      <span className="text-ink group-hover:text-brand-primary">{label}</span>
    </Link>
  );
}
