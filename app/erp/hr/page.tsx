// HR & Payroll module hub.

'use client';

import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Landmark,
  ReceiptText,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import {
  ACTIVE_COUNT,
  DEPARTMENT_LABEL,
  EMPLOYEES,
  TOTAL_MONTHLY_GROSS,
  employeesByDepartment,
} from '@/mocks/fixtures/employees';
import {
  LEAVE_REQUESTS,
  onLeaveToday,
  pendingLeaveCount,
} from '@/mocks/fixtures/leave';
import { PAYROLL_RUNS } from '@/mocks/fixtures/payroll';
import { cn } from '@/lib/cn';

export default function HrHubPage() {
  const byDept = employeesByDepartment();
  const deptCount = Object.keys(byDept).length;
  const pending = pendingLeaveCount();
  const onLeave = onLeaveToday().length;
  const latestRun = PAYROLL_RUNS[0]!;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">HR &amp; Payroll</h1>
          <p className="mt-1 text-small text-muted">
            Employee records, leave management and monthly payroll with PAYE / NSSA / NEC withholdings.
          </p>
        </div>
      </ScrollReveal>

      {/* Headline KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Active staff"
          value={ACTIVE_COUNT.toString()}
          sub={`Across ${deptCount} departments`}
          href="/erp/hr/employees"
          Icon={Users}
          tone="brand"
        />
        <KpiTile
          label="On leave today"
          value={onLeave.toString()}
          sub={`${pending} leave requests pending review`}
          href="/erp/hr/leave"
          Icon={CalendarDays}
          tone={pending > 2 ? 'warning' : 'info'}
        />
        <KpiTile
          label="Latest payroll"
          value={formatCurrency(latestRun.netUsd)}
          sub={`${latestRun.period} · ${latestRun.status}`}
          href={`/erp/hr/payroll/${latestRun.id}`}
          Icon={Wallet}
          tone="success"
        />
        <KpiTile
          label="Monthly gross"
          value={formatCurrency(TOTAL_MONTHLY_GROSS)}
          sub={`Paybill across ${EMPLOYEES.length} positions`}
          href="/erp/hr/payroll"
          Icon={ReceiptText}
          tone="info"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Department breakdown */}
        <ScrollReveal delay={60} className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="text-h3 text-ink">Staff by department</h2>
            <ul className="mt-4 divide-y divide-line">
              {Object.entries(byDept).map(([dept, emps]) => {
                const gross = emps.reduce((s, e) => s + e.basicMonthlyUsd, 0);
                return (
                  <li key={dept} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-small font-semibold text-ink">
                        {DEPARTMENT_LABEL[dept as keyof typeof DEPARTMENT_LABEL]}
                      </div>
                      <div className="text-micro text-muted">{emps.length} staff</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="text-small font-semibold text-ink">{formatCurrency(gross)}</div>
                      <div className="text-micro text-muted">basic / month</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </ScrollReveal>

        {/* Recent leave requests */}
        <ScrollReveal delay={120}>
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">Leave queue</h2>
              <Link href="/erp/hr/leave" className="text-micro font-semibold text-brand-primary hover:underline">
                See all
              </Link>
            </div>
            <ul className="divide-y divide-line text-small">
              {LEAVE_REQUESTS.filter((r) => r.status === 'pending').slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="truncate-line font-semibold text-ink">
                      {EMPLOYEES.find((e) => e.id === r.employeeId)?.fullName}
                    </div>
                    <div className="truncate-line text-micro text-muted">
                      {r.type} · {r.days} days
                    </div>
                  </div>
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
                    Pending
                  </span>
                </li>
              ))}
              {LEAVE_REQUESTS.filter((r) => r.status === 'pending').length === 0 && (
                <li className="py-6 text-center text-micro text-muted">No pending leave requests.</li>
              )}
            </ul>
          </Card>
        </ScrollReveal>
      </div>

      {/* Module tiles */}
      <div className="mt-8 mb-2 flex items-center gap-3">
        <h2 className="text-h3 text-ink">HR modules</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ModuleTile title="Employee register"  body={`${EMPLOYEES.length} staff — profiles, grades and bank details.`} href="/erp/hr/employees" Icon={Users} />
        <ModuleTile title="Leave management"   body="Balances, requests and approvals." href="/erp/hr/leave"      Icon={CalendarDays} />
        <ModuleTile title="Payroll"            body="Monthly runs with PAYE / NSSA / NEC." href="/erp/hr/payroll" Icon={Wallet} />
        <ModuleTile title="Performance"        body="Review cycles, KPIs and scorecards (coming soon)." href="/erp/hr" Icon={BadgeCheck} disabled />
        <ModuleTile title="Org & structure"    body="Reporting lines, grades and positions." href="/erp/hr/employees" Icon={Landmark} />
      </div>
    </div>
  );
}

function KpiTile({ label, value, sub, href, Icon, tone }: {
  label: string; value: string; sub: string; href: string; Icon: React.ElementType;
  tone: 'brand' | 'info' | 'warning' | 'success';
}) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
    tone === 'success' ? 'bg-success/10       text-success'       :
    tone === 'warning' ? 'bg-warning/10       text-warning'       :
                         'bg-info/10          text-info';
  return (
    <Link href={href} className="group flex flex-col gap-2 rounded-lg border border-line bg-card p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
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

function ModuleTile({ title, body, href, Icon, disabled }: { title: string; body: string; href: string; Icon: React.ElementType; disabled?: boolean }) {
  const content = (
    <span className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-body font-semibold text-ink">
          {title}
          {!disabled && <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />}
        </span>
        <span className="mt-1 block text-small text-muted">{body}</span>
      </span>
    </span>
  );
  if (disabled) {
    return <div className="rounded-lg border border-line bg-card p-5 opacity-60">{content}</div>;
  }
  return (
    <Link href={href} className="group rounded-lg border border-line bg-card p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md">
      {content}
    </Link>
  );
}
