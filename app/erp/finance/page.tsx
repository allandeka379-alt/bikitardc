// ─────────────────────────────────────────────
// Finance module hub — single landing for the CFO
// and finance team. Summarises position, shows the
// headline KPIs, and routes to the detail views.
// ─────────────────────────────────────────────

'use client';

import {
  ArrowRight,
  BookOpen,
  Building2,
  FileBarChart,
  Landmark,
  ReceiptText,
  ScrollText,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { BANK_ACCOUNTS, totalCashUsd, unreconciledCount } from '@/mocks/fixtures/bank-accounts';
import { BUDGET_LINES, computeVariance, totalsByKind, YTD_PRORATA } from '@/mocks/fixtures/budget-lines';
import { agingBuckets, CREDITOR_INVOICES } from '@/mocks/fixtures/creditors';
import { debtorAgingTotals, topDebtors, totalDebtors } from '@/mocks/fixtures/debtors-summary';
import { totalsByCategory, FIXED_ASSETS } from '@/mocks/fixtures/fixed-assets';
import { cn } from '@/lib/cn';

export default function FinanceHubPage() {
  const cash = totalCashUsd();
  const bankUnrec = unreconciledCount();
  const totals = totalsByKind();
  const creditorsAging = agingBuckets();
  const creditorsTotal = creditorsAging.current + creditorsAging.d30 + creditorsAging.d60 + creditorsAging.d90plus;
  const debtors = debtorAgingTotals();
  const debtorsTotal = totalDebtors();
  const assets = totalsByCategory();
  const assetsNbv = Object.values(assets).reduce((s, c) => s + c.nbv, 0);
  const top5 = topDebtors(5);

  // Budget snapshot: how many lines are more than 10 pp over pro-rata
  const overrunning = BUDGET_LINES
    .filter((l) => l.kind === 'expense')
    .map((l) => computeVariance(l))
    .filter((v) => v.variancePct > 0.10).length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Finance</h1>
          <p className="mt-1 text-small text-muted">
            General ledger, budget, treasury, creditors, debtors and fixed assets — IPSAS-aligned.
          </p>
        </div>
      </ScrollReveal>

      {/* Headline KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Cash at bank"
          value={formatCurrency(cash)}
          sub={`${BANK_ACCOUNTS.length} accounts · ${bankUnrec} unreconciled`}
          href="/erp/finance/bank-reconciliation"
          Icon={Wallet}
          tone="brand"
        />
        <KpiTile
          label="Debtors (ratepayers)"
          value={formatCurrency(debtorsTotal)}
          sub={`${formatCurrency(debtors.d90plus)} over 60 days`}
          href="/erp/finance/debtors"
          Icon={Users}
          tone={debtors.d90plus > 2_000 ? 'warning' : 'info'}
        />
        <KpiTile
          label="Creditors (suppliers)"
          value={formatCurrency(creditorsTotal)}
          sub={`${CREDITOR_INVOICES.filter((i) => i.status !== 'paid').length} open invoices`}
          href="/erp/finance/creditors"
          Icon={ReceiptText}
          tone={creditorsAging.d90plus > 5_000 ? 'warning' : 'info'}
        />
        <KpiTile
          label="Fixed assets (NBV)"
          value={formatCurrency(assetsNbv)}
          sub={`${FIXED_ASSETS.filter((a) => a.status === 'active').length} items on register`}
          href="/erp/finance/fixed-assets"
          Icon={Building2}
          tone="info"
        />
      </div>

      {/* Budget + modules grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Budget execution snapshot */}
        <ScrollReveal delay={60} className="lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-micro font-bold uppercase tracking-wider text-muted">
                  Budget execution · FY2026
                </div>
                <h2 className="mt-1 text-h3 text-ink">Revenue vs expense vs capital, YTD</h2>
              </div>
              <Link
                href="/erp/finance/budget"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-small font-medium text-brand-primary hover:bg-brand-primary/5"
              >
                Open budget
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <BudgetProgress label="Revenue"  approved={totals.revenue.approved} actual={totals.revenue.actual} />
              <BudgetProgress label="Expenses" approved={totals.expense.approved} actual={totals.expense.actual} />
              <BudgetProgress label="Capital"  approved={totals.capital.approved} actual={totals.capital.actual} />
            </div>

            {overrunning > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 p-3 text-small text-warning">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
                <div>
                  <span className="font-semibold">{overrunning}</span>{' '}
                  expense line{overrunning === 1 ? '' : 's'} running more than 10 percentage points ahead of pro-rata (YTD {Math.round(YTD_PRORATA * 100)}%).
                </div>
              </div>
            )}
          </Card>
        </ScrollReveal>

        {/* Top debtors */}
        <ScrollReveal delay={120}>
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">Top 5 debtors</h2>
              <Link href="/erp/finance/debtors" className="text-micro font-semibold text-brand-primary hover:underline">
                See all
              </Link>
            </div>
            <ol className="divide-y divide-line">
              {top5.map((row) => (
                <li key={row.property.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href={`/erp/residents/${row.property.ownerId}`}
                      className="truncate-line block text-small font-semibold text-ink hover:text-brand-primary"
                    >
                      {row.property.ownerName}
                    </Link>
                    <div className="truncate-line text-micro text-muted">
                      {row.property.stand} · {row.property.ward}
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-small font-semibold text-danger">{formatCurrency(row.property.balanceUsd)}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted">{row.bucket === 'd90plus' ? '90+' : row.bucket === 'd60' ? '31–60' : row.bucket === 'd30' ? '1–30' : 'current'}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </ScrollReveal>
      </div>

      {/* Module tiles */}
      <div className="mt-8 mb-2 flex items-center gap-3">
        <h2 className="text-h3 text-ink">Finance modules</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ModuleTile title="General ledger"       body="Chart of accounts, trial balance and journal entries."    href="/erp/finance/gl"                Icon={BookOpen} />
        <ModuleTile title="Budget vs actual"     body="Per-vote, per-category variance against pro-rata."         href="/erp/finance/budget"            Icon={FileBarChart} />
        <ModuleTile title="Bank reconciliation"  body="Match statement lines to GL journals across 5 accounts."   href="/erp/finance/bank-reconciliation" Icon={Landmark} />
        <ModuleTile title="Creditors"            body="Supplier ledger, invoice aging and 3-way matching."        href="/erp/finance/creditors"         Icon={ReceiptText} />
        <ModuleTile title="Debtors"              body="Aging buckets, top arrears and collection campaigns."      href="/erp/finance/debtors"           Icon={Users} />
        <ModuleTile title="Fixed assets"         body="Asset register, depreciation schedule and disposals."      href="/erp/finance/fixed-assets"      Icon={Building2} />
        <ModuleTile title="Statutory reports"    body="IPSAS Statement of Financial Position, Performance, Cash Flow." href="/erp/finance/reports"     Icon={ScrollText} />
      </div>
    </div>
  );
}

// ─── Local primitives ─────────────────────────

function KpiTile({
  label,
  value,
  sub,
  href,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  href: string;
  Icon: React.ElementType;
  tone: 'brand' | 'info' | 'warning';
}) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
    tone === 'warning' ? 'bg-warning/10      text-warning' :
                         'bg-info/10         text-info';
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-lg border border-line bg-card p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md"
    >
      <div className="flex items-center justify-between">
        <span className={cn('grid h-9 w-9 place-items-center rounded-md', toneClass)} aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:text-brand-primary" />
      </div>
      <div className="text-micro font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="text-h2 font-bold tabular-nums text-ink">{value}</div>
      <div className="text-micro text-muted">{sub}</div>
    </Link>
  );
}

function BudgetProgress({ label, approved, actual }: { label: string; approved: number; actual: number }) {
  const pct = approved > 0 ? actual / approved : 0;
  return (
    <div className="rounded-md border border-line bg-surface/40 p-3">
      <div className="text-micro font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-h3 font-bold tabular-nums text-ink">{formatCurrency(actual)}</div>
      <div className="mt-0.5 text-micro text-muted">of {formatCurrency(approved)} approved</div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-[width] duration-slow"
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-muted">
        <span>{Math.round(pct * 100)}% consumed</span>
        <span>pro-rata {Math.round(YTD_PRORATA * 100)}%</span>
      </div>
    </div>
  );
}

function ModuleTile({
  title,
  body,
  href,
  Icon,
}: {
  title: string;
  body: string;
  href: string;
  Icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border border-line bg-card p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-body font-semibold text-ink group-hover:text-brand-primary">
          {title}
          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <p className="mt-1 text-small text-muted">{body}</p>
      </div>
    </Link>
  );
}
