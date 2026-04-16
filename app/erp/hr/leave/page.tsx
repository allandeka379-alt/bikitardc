// Leave management — queue of requests with approve/reject toggles.

'use client';

import { ArrowLeft, Check, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/format';
import { EMPLOYEES, findEmployee } from '@/mocks/fixtures/employees';
import {
  LEAVE_LABEL,
  LEAVE_REQUESTS,
  STATUS_LABEL,
  STATUS_TONE,
  type LeaveStatus,
} from '@/mocks/fixtures/leave';

const STATUS_ORDER: LeaveStatus[] = ['pending', 'approved', 'taken', 'rejected', 'cancelled'];

export default function LeavePage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<LeaveStatus | 'all'>('pending');
  const [overrides, setOverrides] = useState<Record<string, LeaveStatus>>({});

  const rows = useMemo(() => {
    let r = LEAVE_REQUESTS.map((x) => ({ ...x, status: overrides[x.id] ?? x.status }));
    if (status !== 'all') r = r.filter((x) => x.status === status);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter((x) => {
        const emp = findEmployee(x.employeeId);
        return (emp?.fullName ?? '').toLowerCase().includes(ql) || (x.reason ?? '').toLowerCase().includes(ql);
      });
    }
    return r.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  }, [q, status, overrides]);

  const approve = (id: string) => {
    setOverrides((o) => ({ ...o, [id]: 'approved' }));
    toast({ title: 'Leave approved', tone: 'success' });
  };
  const reject = (id: string) => {
    setOverrides((o) => ({ ...o, [id]: 'rejected' }));
    toast({ title: 'Leave rejected', tone: 'danger' });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/hr" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        HR &amp; Payroll
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Leave management</h1>
          <p className="mt-1 text-small text-muted">
            {LEAVE_REQUESTS.filter((r) => r.status === 'pending').length} pending requests · {EMPLOYEES.length} staff eligible.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by employee or reason…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeaveStatus | 'all')}
            className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink"
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Employee</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Period</th>
                <th className="px-5 py-3 text-right">Days</th>
                <th className="px-5 py-3 text-left">Reason</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const emp = findEmployee(r.employeeId);
                return (
                  <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <Link href={`/erp/hr/employees/${r.employeeId}`} className="font-semibold text-ink hover:text-brand-primary">
                        {emp?.fullName}
                      </Link>
                      <div className="text-micro text-muted">{emp?.position}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{LEAVE_LABEL[r.type]}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(r.startsAt)} → {formatDate(r.endsAt)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{r.days}</td>
                    <td className="px-5 py-3 text-muted">{r.reason || '—'}</td>
                    <td className="px-5 py-3"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
                    <td className="px-5 py-3">
                      {r.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" leadingIcon={<X     className="h-3 w-3" />} onClick={() => reject(r.id)}>Reject</Button>
                          <Button size="sm"                  leadingIcon={<Check className="h-3 w-3" />} onClick={() => approve(r.id)}>Approve</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-small text-muted">No leave requests match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
