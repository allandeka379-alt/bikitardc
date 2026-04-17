// CEO finance & revenue drill-down.

'use client';

import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  AreaTimeSeries,
  ChartShell,
  Donut,
  GroupedBars,
  HorizontalBars,
  LineTimeSeries,
} from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import { BANK_ACCOUNTS, totalCashUsd } from '@/mocks/fixtures/bank-accounts';
import { BUDGET_LINES, computeVariance, totalsByKind, VOTE_LABEL, YTD_PRORATA } from '@/mocks/fixtures/budget-lines';
import { agingBuckets, CREDITOR_INVOICES, CATEGORY_LABEL } from '@/mocks/fixtures/creditors';
import { debtorAgingTotals, totalDebtors } from '@/mocks/fixtures/debtors-summary';
import { REVENUE_SOURCES, revenueYtdTotal, revenueTargetTotal } from '@/mocks/fixtures/revenue-sources';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

export default function CeoFinancePage() {
  const revYtd = revenueYtdTotal();
  const revTarget = revenueTargetTotal();
  const revPct = revTarget > 0 ? revYtd / revTarget : 0;
  const cash = totalCashUsd();
  const debtors = totalDebtors();
  const debtorAging = debtorAgingTotals();
  const creditorsAging = agingBuckets();
  const totals = totalsByKind();

  // Revenue mix
  const revenueMix = REVENUE_SOURCES.map((s) => ({ x: s.shortCode, actual: s.ytdUsd, target: s.targetUsd }));

  // Cash trajectory synthetic
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const cashTrend = months.map((m, i) => ({ x: m, cash: Math.round(cash - (11 - i) * 8_000 + Math.sin(i * 0.5) * 4_000) }));

  // Budget execution by vote (top 10)
  const byVote = new Map<string, { approved: number; actual: number }>();
  for (const l of BUDGET_LINES) {
    const cur = byVote.get(l.vote) ?? { approved: 0, actual: 0 };
    cur.approved += l.approvedUsd; cur.actual += l.ytdActualUsd;
    byVote.set(l.vote, cur);
  }
  const voteBars = [...byVote.entries()].map(([v, t]) => ({
    x: VOTE_LABEL[v as keyof typeof VOTE_LABEL],
    approved: t.approved,
    actual: t.actual,
  })).sort((a, b) => b.approved - a.approved);

  // Creditors by category (horizontal bars)
  const creditorByCategory = new Map<string, number>();
  for (const i of CREDITOR_INVOICES) {
    if (i.status === 'paid') continue;
    const cat = (CATEGORY_LABEL as Record<string, string>)[Object.values(CATEGORY_LABEL).includes(i.glAccount) ? i.glAccount : ''] ?? '';
    // Fallback: bucket by GL account prefix
    const k = i.glAccount.startsWith('15') ? 'Capital works' :
              i.glAccount.startsWith('61') ? 'Fuel & lubricants' :
              i.glAccount.startsWith('62') ? 'Maintenance' :
              i.glAccount.startsWith('63') ? 'Utilities' :
              i.glAccount.startsWith('64') ? 'Stationery' :
              i.glAccount.startsWith('65') ? 'Communications' :
              i.glAccount.startsWith('66') ? 'Professional fees' :
                                             'Other';
    creditorByCategory.set(k, (creditorByCategory.get(k) ?? 0) + (i.totalUsd - i.paidUsd));
  }
  const creditorByCategoryData = [...creditorByCategory.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Debtor aging donut
  const debtorDonut = [
    { name: 'Current',  value: debtorAging.current, color: CHART_TOKENS.success },
    { name: '1–30 d',   value: debtorAging.d30,     color: CHART_TOKENS.sky },
    { name: '31–60 d',  value: debtorAging.d60,     color: CHART_TOKENS.warning },
    { name: '61+ d',    value: debtorAging.d90plus, color: CHART_TOKENS.danger },
  ];

  // Collections by ward synthetic (use revenue sources lol)
  const wardCollections = ['Nyika', 'Mupani', 'Nhema', 'Bota', 'Silveira', 'Chikwanda'].map((w, i) => ({
    label: w,
    value: Math.round((revYtd / 6) * (1 + Math.sin(i) * 0.3)),
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/ceo" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Finance &amp; revenue</h1>
          <p className="mt-1 text-small text-muted">Revenue execution, cash, budget consumption, debtors and creditors.</p>
        </div>
      </ScrollReveal>

      {/* Top stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue YTD"     value={formatCurrency(revYtd)}     sub={`${Math.round(revPct * 100)}% of target`} tone={revPct >= YTD_PRORATA ? 'success' : 'warning'} />
        <Stat label="Cash at bank"    value={formatCurrency(cash)}        sub={`${BANK_ACCOUNTS.length} accounts`}        tone="info" />
        <Stat label="Debtors"         value={formatCurrency(debtors)}     sub={`${formatCurrency(debtorAging.d90plus)} 90+`} tone={debtorAging.d90plus > 2_000 ? 'warning' : 'info'} />
        <Stat label="Creditors"       value={formatCurrency(creditorsAging.current + creditorsAging.d30 + creditorsAging.d60 + creditorsAging.d90plus)} sub={`${CREDITOR_INVOICES.filter((i) => i.status !== 'paid').length} invoices open`} tone="info" />
      </div>

      {/* Revenue charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Revenue by source" subtitle="YTD vs annual target">
            <GroupedBars
              data={revenueMix}
              bars={[
                { key: 'target', label: 'Target', color: CHART_TOKENS.primarySoft },
                { key: 'actual', label: 'YTD',    color: CHART_TOKENS.primary },
              ]}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell title="Cash at bank" subtitle="Combined balance — 12 months">
            <AreaTimeSeries data={cashTrend} dataKey="cash" valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Budget by vote */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal>
          <ChartShell title="Budget execution by vote" subtitle={`Approved vs YTD — pro-rata ${Math.round(YTD_PRORATA * 100)}%`} height={320}>
            <GroupedBars
              data={voteBars}
              bars={[
                { key: 'approved', label: 'Approved', color: CHART_TOKENS.primarySoft },
                { key: 'actual',   label: 'YTD',      color: CHART_TOKENS.primary },
              ]}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell title="Debtor aging" subtitle="Outstanding by bucket">
            <Donut data={debtorDonut} valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Creditor + ward collections */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-body font-semibold text-ink">Creditors by category</h3>
              <p className="mt-0.5 text-micro text-muted">Outstanding invoices by spend category</p>
            </div>
            <HorizontalBars data={creditorByCategoryData} valueFormatter={money} />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-body font-semibold text-ink">Collections by ward</h3>
              <p className="mt-0.5 text-micro text-muted">Proxy distribution of YTD revenue</p>
            </div>
            <HorizontalBars data={wardCollections} valueFormatter={money} />
          </Card>
        </ScrollReveal>
      </div>

      {/* Expense line flags */}
      <div className="mt-4">
        <Card className="p-5">
          <h3 className="text-h3 text-ink">Expense lines over pro-rata by &gt;10pp</h3>
          <p className="mt-1 text-micro text-muted">Variance signals where spend is running ahead of the cycle pace.</p>
          <ul className="mt-3 divide-y divide-line">
            {BUDGET_LINES
              .filter((l) => l.kind === 'expense')
              .map((l) => computeVariance(l))
              .filter((v) => v.variancePct > 0.10)
              .sort((a, b) => b.variancePct - a.variancePct)
              .map((v) => (
                <li key={v.line.id} className="flex items-center justify-between gap-3 py-2.5 text-small">
                  <div className="min-w-0">
                    <div className="truncate-line font-semibold text-ink">{v.line.category}</div>
                    <div className="text-micro text-muted">{VOTE_LABEL[v.line.vote]}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="font-semibold text-warning">+{Math.round(v.variancePct * 100)} pp</div>
                    <div className="text-micro text-muted">{formatCurrency(v.line.ytdActualUsd)} / {formatCurrency(v.line.approvedUsd)}</div>
                  </div>
                </li>
              ))}
            {BUDGET_LINES.filter((l) => l.kind === 'expense').map(computeVariance).filter((v) => v.variancePct > 0.10).length === 0 && (
              <li className="py-4 text-center text-small text-success">All expense lines within tolerance.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: 'success' | 'info' | 'warning' }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-ink';
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', toneClass)}>{value}</div>
      <div className="text-micro text-muted">{sub}</div>
    </Card>
  );
}
