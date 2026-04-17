// CEO finance & revenue drill-down.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  AreaTimeSeries,
  Bullet,
  ChartShell,
  ComboChart,
  Donut,
  HorizontalBars,
  ProgressRing,
  ScatterPlot,
  Sparkline,
  StackedArea,
  TreemapPlot,
} from '@/components/ceo/charts';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import { BANK_ACCOUNTS, totalCashUsd } from '@/mocks/fixtures/bank-accounts';
import { BUDGET_LINES, computeVariance, totalsByKind, VOTE_LABEL, YTD_PRORATA } from '@/mocks/fixtures/budget-lines';
import { agingBuckets, CREDITOR_INVOICES } from '@/mocks/fixtures/creditors';
import { classifyDebtors, debtorAgingTotals, totalDebtors } from '@/mocks/fixtures/debtors-summary';
import { REVENUE_SOURCES, revenueYtdTotal, revenueTargetTotal } from '@/mocks/fixtures/revenue-sources';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

function synthTrend(seed: number, n = 12, base = 20, amp = 10): number[] {
  return Array.from({ length: n }, (_, i) => {
    const v = base + Math.sin((i + seed) * 0.7) * amp + (i * amp) / (n * 2);
    return Math.max(0, Math.round(v * 10) / 10);
  });
}

export default function CeoFinancePage() {
  const revYtd = revenueYtdTotal();
  const revTarget = revenueTargetTotal();
  const revPct = revTarget > 0 ? revYtd / revTarget : 0;
  const cash = totalCashUsd();
  const debtors = totalDebtors();
  const debtorAging = debtorAgingTotals();
  const creditorsAging = agingBuckets();
  const creditorsTotal = creditorsAging.current + creditorsAging.d30 + creditorsAging.d60 + creditorsAging.d90plus;
  const totals = totalsByKind();

  // ── Cash trajectory (12 months) ──
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const cashTrend = months.map((m, i) => ({ x: m, cash: Math.round(cash - (11 - i) * 8_000 + Math.sin(i * 0.5) * 4_000) }));

  // ── Revenue mix stacked area ──
  const revenueMixStacked = months.map((m, i) => {
    const row: Record<string, number | string> = { x: m };
    for (const s of REVENUE_SOURCES) {
      const monthlyShare = s.ytdUsd / 12;
      const jitter = 1 + Math.sin((i + s.shortCode.length) * 0.9) * 0.18;
      row[s.shortCode] = Math.round(monthlyShare * jitter);
    }
    return row;
  });

  // ── Revenue vs expenses combo (revenue as bars, expenses as line) ──
  const revExpCombo = months.map((m, i) => {
    const base = 22_000 + i * 1_200 + Math.sin(i * 0.7) * 3_000;
    const exp = base * (0.78 + Math.sin(i * 0.45) * 0.12);
    return { x: m, revenue: Math.round(base), expense: Math.round(exp) };
  });

  // ── Budget execution by vote (top 8) ──
  const byVote = new Map<string, { approved: number; actual: number }>();
  for (const l of BUDGET_LINES) {
    const cur = byVote.get(l.vote) ?? { approved: 0, actual: 0 };
    cur.approved += l.approvedUsd; cur.actual += l.ytdActualUsd;
    byVote.set(l.vote, cur);
  }
  const voteBullets = [...byVote.entries()].map(([v, t]) => ({
    label: VOTE_LABEL[v as keyof typeof VOTE_LABEL],
    actual: t.actual,
    target: t.approved,
  })).sort((a, b) => b.target - a.target).slice(0, 8);

  // ── Creditors by GL-prefix bucket ──
  const creditorByCategory = new Map<string, number>();
  for (const i of CREDITOR_INVOICES) {
    if (i.status === 'paid') continue;
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
  const creditorTreemap = [...creditorByCategory.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ── Debtor aging donut ──
  const debtorDonut = [
    { name: 'Current',  value: debtorAging.current, color: CHART_TOKENS.success },
    { name: '1–30 d',   value: debtorAging.d30,     color: CHART_TOKENS.sky },
    { name: '31–60 d',  value: debtorAging.d60,     color: CHART_TOKENS.warning },
    { name: '61+ d',    value: debtorAging.d90plus, color: CHART_TOKENS.danger },
  ];

  // ── Debtor scatter: days-overdue vs balance ──
  const today = new Date('2026-04-17');
  const debtorScatter = classifyDebtors(today).slice(0, 50).map((d) => {
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

  // ── Ward collections horizontal bars ──
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

      {/* Top stats with sparklines */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue YTD"   value={formatCurrency(revYtd)} sub={`${Math.round(revPct * 100)}% of target`} tone={revPct >= YTD_PRORATA ? 'success' : 'warning'} spark={synthTrend(1, 12, 20, 8)} sparkColor={CHART_TOKENS.primary} />
        <Stat label="Cash at bank"  value={formatCurrency(cash)}   sub={`${BANK_ACCOUNTS.length} accounts`} tone="info" spark={synthTrend(3, 12, 22, 6)} sparkColor={CHART_TOKENS.sky} />
        <Stat label="Debtors"       value={formatCurrency(debtors)} sub={`${formatCurrency(debtorAging.d90plus)} 90+`} tone={debtorAging.d90plus > 2_000 ? 'warning' : 'info'} spark={synthTrend(5, 12, 18, 10)} sparkColor={CHART_TOKENS.warning} />
        <Stat label="Creditors"     value={formatCurrency(creditorsTotal)} sub={`${CREDITOR_INVOICES.filter((i) => i.status !== 'paid').length} invoices open`} tone="info" spark={synthTrend(7, 12, 16, 7)} sparkColor={CHART_TOKENS.accent} />
      </div>

      {/* Revenue vs expense combo + Budget gauges */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal>
          <ChartShell title="Revenue vs expenses" subtitle="Revenue bars, expense line — rolling 12 months" height={280}>
            <ComboChart
              data={revExpCombo}
              bars={[{ key: 'revenue', label: 'Revenue', color: CHART_TOKENS.primary }]}
              lines={[{ key: 'expense', label: 'Expense', color: CHART_TOKENS.danger }]}
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
                <ProgressRing value={Math.round((totals.revenue.actual / Math.max(1, totals.revenue.approved)) * 100)} label="Revenue" color={CHART_TOKENS.success} />
              </div>
              <div className="h-[140px]">
                <ProgressRing value={Math.round((totals.expense.actual / Math.max(1, totals.expense.approved)) * 100)} label="Expense" color={CHART_TOKENS.warning} />
              </div>
              <div className="h-[140px]">
                <ProgressRing value={Math.round((totals.capital.actual / Math.max(1, totals.capital.approved)) * 100)} label="Capital" color={CHART_TOKENS.primary} />
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Revenue mix + Cash trajectory */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Revenue mix over time" subtitle="Monthly contribution by source">
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
        <ScrollReveal delay={60}>
          <ChartShell title="Cash at bank" subtitle="Combined balance — 12 months">
            <AreaTimeSeries data={cashTrend} dataKey="cash" valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Budget bullets */}
      <div className="mt-4">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-body font-semibold text-ink">Budget execution by vote</h3>
            <p className="mt-0.5 text-micro text-muted">Bar = YTD spent · tick = approved ceiling</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {voteBullets.map((v) => {
              const ratio = v.actual / Math.max(1, v.target);
              const tone: 'success' | 'warning' | 'danger' | 'brand' =
                ratio >= 1 ? 'danger' :
                ratio >= 0.95 ? 'warning' :
                ratio >= YTD_PRORATA - 0.1 ? 'brand' :
                'success';
              return (
                <Bullet key={v.label} label={v.label} actual={v.actual} target={v.target} tone={tone} valueFormatter={money} />
              );
            })}
          </div>
        </Card>
      </div>

      {/* Debtors: donut + scatter */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
        <ScrollReveal>
          <ChartShell title="Debtor aging" subtitle="Outstanding by bucket">
            <Donut data={debtorDonut} valueFormatter={money} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell title="Debtor profile" subtitle="Balance vs days overdue — each dot is a property account" height={300}>
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
      </div>

      {/* Creditors treemap + ward bars */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Creditors by category" subtitle="Outstanding invoices by spend type">
            <TreemapPlot data={creditorTreemap} valueFormatter={(v) => money(v)} />
          </ChartShell>
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

function Stat({ label, value, sub, tone, spark, sparkColor }: { label: string; value: string; sub: string; tone: 'success' | 'info' | 'warning'; spark: number[]; sparkColor: string }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-ink';
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', toneClass)}>{value}</div>
      <div className="text-micro text-muted">{sub}</div>
      <div className="mt-2">
        <Sparkline data={spark} color={sparkColor} height={26} width={140} />
      </div>
    </Card>
  );
}
