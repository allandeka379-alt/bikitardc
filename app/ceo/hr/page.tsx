// CEO — People / HR drill-down.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ChartShell, Donut, GroupedBars, HorizontalBars, LineTimeSeries } from '@/components/ceo/charts';
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

export default function CeoHrPage() {
  const byDept = employeesByDepartment();
  const onLeave = onLeaveToday().length;
  const pending = pendingLeaveCount();

  // Staff by department (bar)
  const deptBars = Object.entries(byDept).map(([d, emps]) => ({
    label: DEPARTMENT_LABEL[d as keyof typeof DEPARTMENT_LABEL],
    value: emps.length,
  })).sort((a, b) => b.value - a.value);

  // Gross paybill by department
  const payByDept = Object.entries(byDept).map(([d, emps]) => ({
    label: DEPARTMENT_LABEL[d as keyof typeof DEPARTMENT_LABEL],
    value: emps.reduce((s, e) => s + e.basicMonthlyUsd, 0),
  })).sort((a, b) => b.value - a.value);

  // Grade distribution
  const gradeCount = new Map<string, number>();
  for (const e of EMPLOYEES) gradeCount.set(e.grade, (gradeCount.get(e.grade) ?? 0) + 1);
  const gradeDonut = [...gradeCount.entries()].map(([g, value], i) => ({
    name: GRADE_LABEL[g as keyof typeof GRADE_LABEL].split(' — ')[0] ?? g,
    value,
  }));

  // Leave type distribution
  const leaveByType = new Map<string, number>();
  for (const l of LEAVE_REQUESTS) leaveByType.set(l.type, (leaveByType.get(l.type) ?? 0) + 1);
  const leaveDonut = [...leaveByType.entries()].map(([k, value]) => ({
    name: LEAVE_LABEL[k as keyof typeof LEAVE_LABEL],
    value,
  }));

  // Payroll trend (net per run, oldest → newest)
  const payrollTrend = [...PAYROLL_RUNS].reverse().map((r) => ({
    x: r.period,
    net:  r.netUsd,
    paye: r.payeUsd,
    nssa: r.nssaUsd,
    nec:  r.necUsd,
  }));

  const latestRun = PAYROLL_RUNS[0]!;

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active staff"       value={ACTIVE_COUNT.toString()} sub={`${Object.keys(byDept).length} departments`} />
        <Stat label="On leave today"     value={onLeave.toString()} sub={`${pending} leave pending`} tone={pending > 0 ? 'warning' : 'info'} />
        <Stat label="Monthly gross"      value={formatCurrency(TOTAL_MONTHLY_GROSS)} sub="All active positions" />
        <Stat label="Latest payroll net" value={formatCurrency(latestRun.netUsd)} sub={`${latestRun.period} · ${latestRun.status}`} />
      </div>

      {/* Headcount + compensation */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Staff by department</h3>
            <HorizontalBars data={deptBars} valueFormatter={(v) => v.toString()} />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Gross paybill by department</h3>
            <HorizontalBars data={payByDept} valueFormatter={money} />
          </Card>
        </ScrollReveal>
      </div>

      {/* Grade + leave distribution */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Grade distribution" subtitle="ZLGA grid">
            <Donut data={gradeDonut} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ChartShell title="Leave requests by type" subtitle={`${LEAVE_REQUESTS.length} requests this cycle`}>
            <Donut data={leaveDonut} />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Payroll breakdown chart */}
      <div className="mt-4">
        <ChartShell title="Payroll — last runs" subtitle="Net, PAYE, NSSA, NEC" height={280}>
          <GroupedBars
            data={payrollTrend}
            stacked
            bars={[
              { key: 'net',  label: 'Net paid', color: CHART_TOKENS.success },
              { key: 'paye', label: 'PAYE',     color: CHART_TOKENS.warning },
              { key: 'nssa', label: 'NSSA',     color: CHART_TOKENS.sky },
              { key: 'nec',  label: 'NEC',      color: CHART_TOKENS.accent },
            ]}
            valueFormatter={money}
          />
        </ChartShell>
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

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'warning' | 'info' }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', tone === 'warning' ? 'text-warning' : 'text-ink')}>{value}</div>
      <div className="text-micro text-muted">{sub}</div>
    </Card>
  );
}
