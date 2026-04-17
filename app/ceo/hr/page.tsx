// CEO — People / HR drill-down.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ChartShell, ComboChart, Donut, HorizontalBars, ProgressRing, RadarPlot, Sparkline, TreemapPlot } from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  ACTIVE_COUNT,
  DEPARTMENT_LABEL,
  EMPLOYEES,
  GRADE_LABEL,
  TOTAL_MONTHLY_GROSS,
  employeesByDepartment,
} from '@/mocks/fixtures/employees';
import { LEAVE_REQUESTS, onLeaveToday, pendingLeaveCount, LEAVE_LABEL } from '@/mocks/fixtures/leave';
import { PAYROLL_RUNS } from '@/mocks/fixtures/payroll';
import { cn } from '@/lib/cn';

const money = (v: number | string) => (typeof v === 'number' ? `$${Math.round(v / 1000)}k` : String(v));

function synthTrend(seed: number, n = 12, base = 20, amp = 10): number[] {
  return Array.from({ length: n }, (_, i) => {
    const v = base + Math.sin((i + seed) * 0.7) * amp + (i * amp) / (n * 2);
    return Math.max(0, Math.round(v * 10) / 10);
  });
}

export default function CeoHrPage() {
  const byDept = employeesByDepartment();
  const onLeave = onLeaveToday().length;
  const pending = pendingLeaveCount();
  const leaveUtilisationPct = Math.min(100, Math.round((onLeave / Math.max(1, ACTIVE_COUNT)) * 100 * 10));

  // Gross paybill by department (treemap — nice for cost composition)
  const paybillTreemap = Object.entries(byDept).map(([d, emps]) => ({
    name: DEPARTMENT_LABEL[d as keyof typeof DEPARTMENT_LABEL],
    value: emps.reduce((s, e) => s + e.basicMonthlyUsd, 0),
  })).sort((a, b) => b.value - a.value);

  // Staff by department (horizontal bars — kept)
  const deptBars = Object.entries(byDept).map(([d, emps]) => ({
    label: DEPARTMENT_LABEL[d as keyof typeof DEPARTMENT_LABEL],
    value: emps.length,
  })).sort((a, b) => b.value - a.value);

  // Grade distribution donut
  const gradeCount = new Map<string, number>();
  for (const e of EMPLOYEES) gradeCount.set(e.grade, (gradeCount.get(e.grade) ?? 0) + 1);
  const gradeDonut = [...gradeCount.entries()].map(([g, value]) => ({
    name: GRADE_LABEL[g as keyof typeof GRADE_LABEL].split(' — ')[0] ?? g,
    value,
  }));

  // Leave type distribution donut
  const leaveByType = new Map<string, number>();
  for (const l of LEAVE_REQUESTS) leaveByType.set(l.type, (leaveByType.get(l.type) ?? 0) + 1);
  const leaveDonut = [...leaveByType.entries()].map(([k, value]) => ({
    name: LEAVE_LABEL[k as keyof typeof LEAVE_LABEL],
    value,
  }));

  // ── Payroll: combo chart
  //    bars = stacked gross components (PAYE / NSSA / NEC)
  //    line = Net paid
  // Previously these were co-stacked which double-counts (net excludes PAYE/NSSA/NEC)
  const payrollTrend = [...PAYROLL_RUNS].reverse().map((r) => ({
    x: r.period,
    paye: r.payeUsd,
    nssa: r.nssaUsd,
    nec:  r.necUsd,
    net:  r.netUsd,
  }));

  // ── Department radar — multi-dimensional comparison
  const topDepts = Object.entries(byDept).sort((a, b) => b[1].length - a[1].length).slice(0, 4);
  const radarAxes: { axis: string; get: (emps: typeof EMPLOYEES, code: string) => number }[] = [
    { axis: 'Headcount',         get: (emps) => emps.length },
    { axis: 'Avg monthly ($k)',  get: (emps) => emps.length ? Math.round(emps.reduce((s, e) => s + e.basicMonthlyUsd, 0) / emps.length / 1000 * 10) / 10 : 0 },
    { axis: 'Senior staff',      get: (emps) => emps.filter((e) => ['ZLGA-1', 'ZLGA-2', 'ZLGA-3'].includes(e.grade)).length },
    { axis: 'On leave',          get: (emps) => onLeaveToday().filter((empId) => emps.some((e) => e.id === empId)).length },
    { axis: 'Pending leave',     get: (emps) => LEAVE_REQUESTS.filter((r) => r.status === 'pending' && emps.some((e) => e.id === r.employeeId)).length },
  ];
  const radarData = radarAxes.map(({ axis, get }) => {
    const row: Record<string, number | string> = { axis };
    topDepts.forEach(([code, emps]) => {
      row[code] = get(emps, code);
    });
    return row;
  });

  const latestRun = PAYROLL_RUNS[0]!;
  const payrollRunPct = Math.round((latestRun.netUsd / Math.max(1, latestRun.grossUsd)) * 100);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/ceo" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">People</h1>
          <p className="mt-1 text-small text-muted">Headcount, compensation, leave and payroll — leadership view.</p>
        </div>
      </ScrollReveal>

      {/* Stats + sparklines */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active staff"       value={ACTIVE_COUNT.toString()} sub={`${Object.keys(byDept).length} departments`} spark={synthTrend(2, 12, 18, 3)} sparkColor={CHART_TOKENS.primary} />
        <Stat label="On leave today"     value={onLeave.toString()} sub={`${pending} leave pending`} tone={pending > 0 ? 'warning' : 'info'} spark={synthTrend(4, 12, 8, 5)} sparkColor={CHART_TOKENS.warning} />
        <Stat label="Monthly gross"      value={formatCurrency(TOTAL_MONTHLY_GROSS)} sub="All active positions" spark={synthTrend(6, 12, 22, 4)} sparkColor={CHART_TOKENS.accent} />
        <Stat label="Latest payroll net" value={formatCurrency(latestRun.netUsd)} sub={`${latestRun.period} · ${latestRun.status}`} spark={synthTrend(8, 12, 20, 6)} sparkColor={CHART_TOKENS.success} />
      </div>

      {/* Paybill treemap + Net-of-gross gauge + leave gauge */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal>
          <ChartShell title="Gross paybill by department" subtitle="Treemap area ∝ monthly gross">
            <TreemapPlot data={paybillTreemap} valueFormatter={(v) => money(v)} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="h-full p-5">
            <div className="mb-1">
              <h3 className="text-body font-semibold text-ink">Payroll headline</h3>
              <p className="mt-0.5 text-micro text-muted">{latestRun.period}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-[140px]">
                <ProgressRing value={payrollRunPct} label="Net / Gross" color={CHART_TOKENS.success} />
              </div>
              <div className="h-[140px]">
                <ProgressRing value={Math.min(100, Math.round((onLeave / Math.max(1, ACTIVE_COUNT)) * 100))} label="On leave" color={CHART_TOKENS.warning} sublabel={`of ${ACTIVE_COUNT}`} />
              </div>
            </div>
            <div className="mt-4 rounded-md bg-surface/60 p-3 text-small">
              <div className="flex items-center justify-between">
                <span className="text-muted">PAYE</span>
                <span className="font-semibold tabular-nums text-ink">{formatCurrency(latestRun.payeUsd)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted">NSSA + NEC</span>
                <span className="font-semibold tabular-nums text-ink">{formatCurrency(latestRun.nssaUsd + latestRun.necUsd)}</span>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Headcount HB + Grade donut + Leave donut */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ScrollReveal>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Staff by department</h3>
            <HorizontalBars data={deptBars} valueFormatter={(v) => v.toString()} />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <ChartShell title="Grade distribution" subtitle="ZLGA grid">
            <Donut data={gradeDonut} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <ChartShell title="Leave requests by type" subtitle={`${LEAVE_REQUESTS.length} requests this cycle`}>
            <Donut data={leaveDonut} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Payroll combo + Department radar */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Payroll breakdown" subtitle="Deduction bars (PAYE / NSSA / NEC) + Net line" height={280}>
            <ComboChart
              data={payrollTrend}
              bars={[
                { key: 'paye', label: 'PAYE', color: CHART_TOKENS.warning, stack: true },
                { key: 'nssa', label: 'NSSA', color: CHART_TOKENS.sky, stack: true },
                { key: 'nec',  label: 'NEC',  color: CHART_TOKENS.accent, stack: true },
              ]}
              lines={[{ key: 'net', label: 'Net paid', color: CHART_TOKENS.success }]}
              valueFormatter={money}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell title="Department comparison" subtitle="Top 4 departments across 5 dimensions" height={320}>
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

      {/* Pending leave queue */}
      <div className="mt-4">
        <Card className="p-5">
          <h3 className="text-h3 text-ink">Pending leave decisions</h3>
          <p className="mt-1 text-micro text-muted">Approvals still blocking the CEO / HR queue.</p>
          <ul className="mt-3 divide-y divide-line text-small">
            {LEAVE_REQUESTS.filter((r) => r.status === 'pending').map((r) => {
              const e = EMPLOYEES.find((x) => x.id === r.employeeId);
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate-line font-semibold text-ink">{e?.fullName}</div>
                    <div className="truncate-line text-micro text-muted">
                      {LEAVE_LABEL[r.type]} · {r.days} days · {formatDate(r.startsAt)} → {formatDate(r.endsAt)}
                    </div>
                  </div>
                  <Badge tone="warning">Pending</Badge>
                </li>
              );
            })}
            {LEAVE_REQUESTS.filter((r) => r.status === 'pending').length === 0 && (
              <li className="py-4 text-center text-small text-success">No pending leave requests.</li>
            )}
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
