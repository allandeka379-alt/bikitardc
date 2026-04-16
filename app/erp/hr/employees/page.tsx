// Employee register — searchable + department filter.

'use client';

import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format';
import {
  DEPARTMENT_LABEL,
  EMPLOYEES,
  GRADE_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  type Department,
} from '@/mocks/fixtures/employees';
import { onLeaveToday } from '@/mocks/fixtures/leave';

export default function EmployeesPage() {
  const [q, setQ] = useState('');
  const [dept, setDept] = useState<Department | 'all'>('all');

  const onLeave = useMemo(() => new Set(onLeaveToday()), []);

  const rows = useMemo(() => {
    let r = EMPLOYEES;
    if (dept !== 'all') r = r.filter((e) => e.department === dept);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter(
        (e) =>
          e.fullName.toLowerCase().includes(ql) ||
          e.employeeNumber.toLowerCase().includes(ql) ||
          e.position.toLowerCase().includes(ql),
      );
    }
    return r;
  }, [q, dept]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/hr" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        HR &amp; Payroll
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Employees</h1>
          <p className="mt-1 text-small text-muted">{EMPLOYEES.length} staff on the master file.</p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by name, number or position…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value as Department | 'all')}
            className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink"
          >
            <option value="all">All departments</option>
            {(Object.keys(DEPARTMENT_LABEL) as Department[]).map((d) => (
              <option key={d} value={d}>{DEPARTMENT_LABEL[d]}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Employee</th>
                <th className="px-5 py-3 text-left">Department</th>
                <th className="px-5 py-3 text-left">Position</th>
                <th className="px-5 py-3 text-left">Grade</th>
                <th className="px-5 py-3 text-right">Basic / month</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <Link href={`/erp/hr/employees/${e.id}`} className="font-semibold text-ink hover:text-brand-primary">
                      {e.fullName}
                    </Link>
                    <div className="font-mono text-micro text-muted">{e.employeeNumber}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{DEPARTMENT_LABEL[e.department]}</td>
                  <td className="px-5 py-3 text-ink">{e.position}</td>
                  <td className="px-5 py-3 text-micro text-muted">{GRADE_LABEL[e.grade]}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(e.basicMonthlyUsd)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                    {onLeave.has(e.id) && e.status === 'active' && (
                      <div className="mt-0.5 text-[10px] text-warning">on leave today</div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-small text-muted">No employees match the filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
