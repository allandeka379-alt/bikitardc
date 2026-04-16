// Employee profile — personal / statutory / bank / leave summary.

'use client';

import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  DEPARTMENT_LABEL,
  GRADE_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  findEmployee,
} from '@/mocks/fixtures/employees';
import {
  LEAVE_LABEL,
  STATUS_LABEL as LEAVE_STATUS_LABEL,
  STATUS_TONE as LEAVE_STATUS_TONE,
  balancesFor,
  requestsFor,
} from '@/mocks/fixtures/leave';

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const employee = findEmployee(params.id);
  if (!employee) return notFound();

  const balances = balancesFor(employee.id);
  const requests = requestsFor(employee.id);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/hr/employees" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Employees
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-accent/15 text-h3 font-semibold text-[#8a6e13]">
                {employee.fullName.split(/\s+/).slice(0, 2).map((n) => n[0]).join('')}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-h2 text-ink">{employee.fullName}</h1>
                  <Badge tone={STATUS_TONE[employee.status]}>{STATUS_LABEL[employee.status]}</Badge>
                </div>
                <div className="text-small text-muted">{employee.position} · {DEPARTMENT_LABEL[employee.department]}</div>
                <div className="mt-1 font-mono text-micro text-muted">{employee.employeeNumber}</div>
                <div className="mt-3 flex flex-wrap gap-4 text-micro text-muted">
                  <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{employee.phone}</span>
                  <span className="inline-flex items-center gap-1.5"><Mail  className="h-3 w-3" />{employee.email}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" />{employee.address}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Metric label="Grade"  value={GRADE_LABEL[employee.grade]} />
              <Metric label="Basic"  value={formatCurrency(employee.basicMonthlyUsd)} emphasis />
              <Metric label="Hired"  value={formatDate(employee.hiredAt)} />
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Statutory + bank */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Statutory numbers</h2>
          <dl className="mt-3 divide-y divide-line text-small">
            <DefRow label="National ID"   value={employee.nationalId} mono />
            <DefRow label="NSSA"          value={employee.nssaNumber} mono />
            <DefRow label="NEC"           value={employee.necNumber}  mono />
            <DefRow label="ZIMRA BP (PAYE)" value={employee.paye}       mono />
            <DefRow label="Date of birth" value={formatDate(employee.dateOfBirth)} />
            <DefRow label="Gender"        value={employee.gender === 'F' ? 'Female' : 'Male'} />
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Banking &amp; reporting</h2>
          <dl className="mt-3 divide-y divide-line text-small">
            <DefRow label="Bank"            value={employee.bank} />
            <DefRow label="Account"         value={employee.bankAccount} mono />
            <DefRow label="Reports to"      value={employee.reportsTo ? findEmployee(employee.reportsTo)?.fullName ?? '—' : '— (top-level)'} />
          </dl>
        </Card>
      </div>

      {/* Leave balances */}
      <div className="mt-6">
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Leave balances</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {balances.map((b) => {
              const remaining = b.entitlementDays - b.takenDays - b.pendingDays;
              const pct = b.entitlementDays > 0 ? (b.takenDays / b.entitlementDays) * 100 : 0;
              return (
                <li key={b.type} className="rounded-md border border-line bg-surface/40 p-4">
                  <div className="text-micro font-semibold uppercase tracking-wide text-muted">{LEAVE_LABEL[b.type]}</div>
                  <div className="mt-1 text-h3 font-bold tabular-nums text-ink">{remaining} <span className="text-small font-normal text-muted">days left</span></div>
                  <div className="mt-1 text-micro text-muted">{b.takenDays} taken · {b.pendingDays} pending · {b.entitlementDays} entitled</div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-brand-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Leave requests */}
      <div className="mt-6">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Leave history</h2>
          </div>
          {requests.length === 0 ? (
            <div className="px-5 py-10 text-center text-small text-muted">No leave records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-small">
                <thead>
                  <tr className="border-b border-line bg-surface/40 text-micro font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">Period</th>
                    <th className="px-5 py-3 text-right">Days</th>
                    <th className="px-5 py-3 text-left">Reason</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.sort((a, b) => (a.startsAt < b.startsAt ? 1 : -1)).map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3 text-ink">{LEAVE_LABEL[r.type]}</td>
                      <td className="px-5 py-3 text-muted">{formatDate(r.startsAt)} → {formatDate(r.endsAt)}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-ink">{r.days}</td>
                      <td className="px-5 py-3 text-muted">{r.reason || '—'}</td>
                      <td className="px-5 py-3"><Badge tone={LEAVE_STATUS_TONE[r.status]}>{LEAVE_STATUS_LABEL[r.status]}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-md border px-4 py-2.5 ${emphasis ? 'border-brand-primary bg-brand-primary/5' : 'border-line bg-card'}`}>
      <div className="text-micro text-muted">{label}</div>
      <div className={`text-body font-bold tabular-nums ${emphasis ? 'text-brand-primary' : 'text-ink'}`}>{value}</div>
    </div>
  );
}

function DefRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-small">
      <dt className="text-muted">{label}</dt>
      <dd className={mono ? 'font-mono text-ink' : 'text-ink'}>{value}</dd>
    </div>
  );
}
