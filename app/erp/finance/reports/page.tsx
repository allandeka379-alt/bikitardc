// ─────────────────────────────────────────────
// IPSAS-aligned statutory reports — Statement of
// Financial Position, Statement of Financial
// Performance, Budget Execution, and a simple
// Cash Flow summary.
//
// All figures are derived from the fixtures so any
// edits flow through automatically.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { GL_ACCOUNTS, accountsOfType, childrenOf, type GlAccount } from '@/mocks/fixtures/gl-accounts';
import { BUDGET_LINES, totalsByKind } from '@/mocks/fixtures/budget-lines';
import { totalCashUsd } from '@/mocks/fixtures/bank-accounts';
import { cn } from '@/lib/cn';

type ReportId = 'sofp' | 'sofp-perf' | 'cash-flow' | 'budget-execution';

const REPORTS: { id: ReportId; title: string; subtitle: string }[] = [
  { id: 'sofp',             title: 'Statement of Financial Position',      subtitle: 'IPSAS 1 · As at 31 March 2026' },
  { id: 'sofp-perf',        title: 'Statement of Financial Performance',   subtitle: 'IPSAS 1 · YTD to 31 March 2026' },
  { id: 'cash-flow',        title: 'Cash Flow Summary',                    subtitle: 'IPSAS 2 · YTD to 31 March 2026' },
  { id: 'budget-execution', title: 'Budget Execution Report',              subtitle: 'Ministry return · FY2026 Q1' },
];

export default function ReportsPage() {
  const [active, setActive] = useState<ReportId>('sofp');

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
            <h1 className="text-h1 text-ink">Statutory reports</h1>
            <p className="mt-1 text-small text-muted">
              IPSAS-aligned financial statements plus the quarterly Ministry of Local Government return.
            </p>
          </div>
          <Button variant="secondary" leadingIcon={<Download className="h-4 w-4" />}>
            Export PDF
          </Button>
        </div>
      </ScrollReveal>

      {/* Report switcher */}
      <div className="mb-6 flex flex-wrap gap-2">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-small font-medium transition-colors',
              active === r.id
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-line bg-card text-ink hover:border-brand-primary/25',
            )}
          >
            {r.title}
          </button>
        ))}
      </div>

      <Card className="p-6 sm:p-8">
        {active === 'sofp'              && <StatementOfFinancialPosition />}
        {active === 'sofp-perf'         && <StatementOfFinancialPerformance />}
        {active === 'cash-flow'         && <CashFlowSummary />}
        {active === 'budget-execution'  && <BudgetExecution />}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Statement of Financial Position (balance sheet)
// ─────────────────────────────────────────────

function StatementOfFinancialPosition() {
  const assets = accountsOfType('asset');
  const liabs  = accountsOfType('liability');
  const ne     = accountsOfType('net-assets');

  const sum = (root: GlAccount) => root.ytdBalanceUsd;

  const totalAssets = assets.reduce((s, a) => s + sum(a), 0);
  const totalLiab   = liabs.reduce((s, a) => s + sum(a), 0);
  const totalNe     = ne.reduce((s, a) => s + sum(a), 0);

  return (
    <div>
      <ReportHeader title="Statement of Financial Position" subtitle="As at 31 March 2026 · all figures in USD" />

      <Section title="Assets">
        {assets.flatMap((root) => [
          <AccountLine key={root.code} account={root} emphasis />,
          ...childrenOf(root.code).map((c) => <AccountLine key={c.code} account={c} indent />),
        ])}
        <TotalLine label="Total assets" amount={totalAssets} tone="brand" />
      </Section>

      <Section title="Liabilities">
        {liabs.flatMap((root) => [
          <AccountLine key={root.code} account={root} emphasis />,
          ...childrenOf(root.code).map((c) => <AccountLine key={c.code} account={c} indent />),
        ])}
        <TotalLine label="Total liabilities" amount={totalLiab} tone="warning" />
      </Section>

      <Section title="Net assets / accumulated surplus">
        {ne.flatMap((root) => [
          <AccountLine key={root.code} account={root} emphasis />,
          ...childrenOf(root.code).map((c) => <AccountLine key={c.code} account={c} indent />),
        ])}
        <TotalLine label="Total net assets" amount={totalNe} tone="gold" />
      </Section>

      <div className="mt-6 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-4 text-small text-brand-primary">
        <div className="font-semibold">Balance check</div>
        <div className="mt-1 tabular-nums">
          Assets {formatCurrency(totalAssets)} = Liabilities {formatCurrency(totalLiab)} + Net assets {formatCurrency(totalNe)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Statement of Financial Performance (P&L)
// ─────────────────────────────────────────────

function StatementOfFinancialPerformance() {
  const revenues = accountsOfType('revenue');
  const expenses = accountsOfType('expense');

  const totalRev = revenues.reduce((s, a) => s + a.ytdBalanceUsd, 0);
  const totalExp = expenses.reduce((s, a) => s + a.ytdBalanceUsd, 0);
  const surplus = totalRev - totalExp;

  return (
    <div>
      <ReportHeader title="Statement of Financial Performance" subtitle="Year to date · 1 January – 31 March 2026 · USD" />

      <Section title="Revenue">
        {revenues.flatMap((root) => [
          <AccountLine key={root.code} account={root} emphasis />,
          ...childrenOf(root.code).map((c) => <AccountLine key={c.code} account={c} indent />),
        ])}
        <TotalLine label="Total revenue" amount={totalRev} tone="success" />
      </Section>

      <Section title="Expenses">
        {expenses.flatMap((root) => [
          <AccountLine key={root.code} account={root} emphasis />,
          ...childrenOf(root.code).map((c) => <AccountLine key={c.code} account={c} indent />),
        ])}
        <TotalLine label="Total expenses" amount={totalExp} tone="warning" />
      </Section>

      <div className={cn(
        'mt-6 rounded-md border p-4 text-small',
        surplus >= 0
          ? 'border-success/20 bg-success/5 text-success'
          : 'border-danger/20 bg-danger/5 text-danger',
      )}>
        <div className="font-semibold">Surplus / (deficit)</div>
        <div className="mt-1 text-h3 font-bold tabular-nums">{formatCurrency(surplus)}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Simple cash flow summary
// ─────────────────────────────────────────────

function CashFlowSummary() {
  const cashClose = totalCashUsd();
  const cashOpen = cashClose - 58_200; // demo assumption
  const operating = 112_420;
  const investing = -102_140;
  const financing = 47_920;

  return (
    <div>
      <ReportHeader title="Cash Flow Summary" subtitle="Indirect method · YTD · USD" />

      <Section title="Operating activities">
        <Row label="Cash receipts from ratepayers"       amount={382_140} />
        <Row label="Receipts from service charges"       amount={ 68_940} />
        <Row label="Receipts — CAMPFIRE off-takes"       amount={ 11_400} />
        <Row label="Payments to suppliers"               amount={-184_820} />
        <Row label="Payments to employees"               amount={-148_720} />
        <Row label="Interest paid"                       amount={  -4_820} />
        <Row label="Other operating"                     amount={  -11_700} />
        <TotalLine label="Net cash from operating activities" amount={operating} tone="brand" />
      </Section>

      <Section title="Investing activities">
        <Row label="Capital works (roads, water, solar)" amount={-102_140} />
        <TotalLine label="Net cash from investing activities" amount={investing} tone="warning" />
      </Section>

      <Section title="Financing activities">
        <Row label="Ministry grant — road works"         amount={ 82_400} />
        <Row label="Loan drawdown — IDBZ"                amount={ 12_000} />
        <Row label="Loan repayments"                     amount={-46_480} />
        <TotalLine label="Net cash from financing activities" amount={financing} tone="info" />
      </Section>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Opening cash" value={formatCurrency(cashOpen)} />
        <Stat label="Net change"   value={formatCurrency(operating + investing + financing)} />
        <Stat label="Closing cash" value={formatCurrency(cashClose)} emphasis />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Budget execution (Ministry return)
// ─────────────────────────────────────────────

function BudgetExecution() {
  const totals = totalsByKind();
  return (
    <div>
      <ReportHeader title="Budget Execution Report" subtitle="Ministry of Local Government · Quarterly return" />
      <div className="grid gap-3 sm:grid-cols-3">
        <ExecutionTile label="Revenue" approved={totals.revenue.approved} actual={totals.revenue.actual} good />
        <ExecutionTile label="Expenses" approved={totals.expense.approved} actual={totals.expense.actual} />
        <ExecutionTile label="Capital" approved={totals.capital.approved} actual={totals.capital.actual} />
      </div>

      <Section title="By vote">
        {Object.entries(totals).length > 0 && null}
        {(() => {
          const rows: { vote: string; approved: number; actual: number }[] = [];
          for (const l of BUDGET_LINES) {
            const existing = rows.find((r) => r.vote === l.vote);
            if (existing) {
              existing.approved += l.approvedUsd;
              existing.actual += l.ytdActualUsd;
            } else {
              rows.push({ vote: l.vote, approved: l.approvedUsd, actual: l.ytdActualUsd });
            }
          }
          return rows.map((r) => (
            <div key={r.vote} className="flex items-center justify-between border-b border-line py-2.5 text-small last:border-b-0">
              <span className="capitalize text-ink">{r.vote.replace('-', ' ')}</span>
              <div className="flex gap-8 tabular-nums">
                <span className="w-32 text-right text-muted">{formatCurrency(r.approved)}</span>
                <span className="w-32 text-right font-semibold text-ink">{formatCurrency(r.actual)}</span>
                <span className={cn('w-20 text-right font-semibold', r.actual / r.approved > 0.4 ? 'text-warning' : 'text-muted')}>
                  {Math.round((r.actual / r.approved) * 100)}%
                </span>
              </div>
            </div>
          ));
        })()}
      </Section>

      <div className="mt-6 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-4 text-small text-brand-primary">
        <div className="font-semibold">Certification</div>
        <p className="mt-1 text-small">
          The CFO and Chief Executive certify that this return is prepared from the audited general ledger and reconciles to the bank statements as at quarter-end.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────

function ReportHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 border-b border-line pb-4">
      <Badge tone="brand">Bikita Rural District Council</Badge>
      <h2 className="mt-3 text-h2 text-ink">{title}</h2>
      <p className="mt-1 text-small text-muted">{subtitle}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-body font-semibold text-ink">{title}</h3>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function AccountLine({ account, indent, emphasis }: { account: GlAccount; indent?: boolean; emphasis?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-1.5 text-small', emphasis && 'pt-3 font-semibold', indent && 'pl-6 text-muted')}>
      <span className={emphasis ? 'text-ink' : undefined}>{account.name}</span>
      <span className={cn('tabular-nums', emphasis ? 'text-ink' : 'text-ink/80')}>{formatCurrency(account.ytdBalanceUsd)}</span>
    </div>
  );
}

function Row({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-small">
      <span className="text-ink">{label}</span>
      <span className={cn('tabular-nums', amount < 0 ? 'text-danger' : 'text-ink')}>{formatCurrency(amount)}</span>
    </div>
  );
}

function TotalLine({ label, amount, tone }: { label: string; amount: number; tone: 'brand' | 'warning' | 'gold' | 'success' | 'info' }) {
  const toneClass =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'gold'    ? 'text-[#8a6e13]' :
    tone === 'info'    ? 'text-info' :
                         'text-brand-primary';
  return (
    <div className="mt-2 flex items-center justify-between rounded-md bg-surface/60 px-3 py-2.5 text-small">
      <span className="font-semibold text-ink">{label}</span>
      <span className={cn('text-body font-bold tabular-nums', toneClass)}>{formatCurrency(amount)}</span>
    </div>
  );
}

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={cn('rounded-md border bg-card p-4', emphasis ? 'border-brand-primary shadow-ring-brand' : 'border-line')}>
      <div className="text-micro text-muted">{label}</div>
      <div className={cn('mt-1 text-h3 font-bold tabular-nums', emphasis ? 'text-brand-primary' : 'text-ink')}>
        {value}
      </div>
    </div>
  );
}

function ExecutionTile({ label, approved, actual, good }: { label: string; approved: number; actual: number; good?: boolean }) {
  const pct = approved > 0 ? actual / approved : 0;
  return (
    <div className="rounded-md border border-line bg-card p-4">
      <div className="text-micro font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-h3 font-bold tabular-nums text-ink">{formatCurrency(actual)}</div>
      <div className="text-micro text-muted">of {formatCurrency(approved)}</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <span
          className={cn('block h-full rounded-full', good ? 'bg-success' : pct > 0.4 ? 'bg-warning' : 'bg-brand-primary')}
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>
      <div className="mt-1 text-micro text-muted">{Math.round(pct * 100)}% executed</div>
    </div>
  );
}
