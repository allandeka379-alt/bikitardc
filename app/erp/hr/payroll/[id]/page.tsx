// Payroll run detail — per-employee breakdown.

'use client';

import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  DEPARTMENT_LABEL,
  findEmployee,
} from '@/mocks/fixtures/employees';
import {
  RUN_STATUS_LABEL,
  RUN_STATUS_TONE,
  findPayrollRun,
  linesForRun,
} from '@/mocks/fixtures/payroll';

export default function PayrollRunDetailPage() {
  const params = useParams<{ id: string }>();
  const run = findPayrollRun(params.id);
  if (!run) return notFound();

  const lines = linesForRun(run.id);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/hr/payroll" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Payroll runs
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h1 text-ink">Payroll · {run.period}</h1>
                <Badge tone={RUN_STATUS_TONE[run.status]} dot>{RUN_STATUS_LABEL[run.status]}</Badge>
              </div>
              <div className="mt-1 text-small text-muted">
                <span className="font-mono">{run.id}</span> · created by {run.createdBy} on {formatDate(run.createdAt)}
                {run.approvedAt && <> · approved {formatDate(run.approvedAt)} by {run.approvedBy}</>}
                {run.paidAt && <> · paid {formatDate(run.paidAt)}</>}
              </div>
            </div>
            <Button variant="secondary" leadingIcon={<Download className="h-4 w-4" />}>Export</Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            <Tile label="Employees" value={run.employeeCount.toString()} />
            <Tile label="Gross" value={formatCurrency(run.grossUsd)} />
            <Tile label="PAYE" value={formatCurrency(run.payeUsd)} tone="warning" />
            <Tile label="NSSA + NEC" value={formatCurrency(run.nssaUsd + run.necUsd)} tone="warning" />
            <Tile label="Net" value={formatCurrency(run.netUsd)} emphasis />
          </div>
        </Card>
      </ScrollReveal>

      <div className="mt-6">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Per-employee breakdown</h2>
            <p className="mt-0.5 text-micro text-muted">{lines.length} lines · totals reconcile to the run header.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Employee</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-right">Basic</th>
                  <th className="px-5 py-3 text-right">Allowance</th>
                  <th className="px-5 py-3 text-right">Gross</th>
                  <th className="px-5 py-3 text-right">PAYE</th>
                  <th className="px-5 py-3 text-right">NSSA</th>
                  <th className="px-5 py-3 text-right">NEC</th>
                  <th className="px-5 py-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const e = findEmployee(l.employeeId);
                  return (
                    <tr key={l.id} className="border-b border-line last:border-b-0 hover:bg-surface/40">
                      <td className="px-5 py-2">
                        <Link href={`/erp/hr/employees/${l.employeeId}`} className="text-ink hover:text-brand-primary">{e?.fullName}</Link>
                        <div className="font-mono text-[10px] text-muted">{e?.employeeNumber}</div>
                      </td>
                      <td className="px-5 py-2 text-micro text-muted">{e && DEPARTMENT_LABEL[e.department]}</td>
                      <td className="px-5 py-2 text-right tabular-nums text-muted">{formatCurrency(l.basicUsd)}</td>
                      <td className="px-5 py-2 text-right tabular-nums text-muted">{formatCurrency(l.allowanceUsd)}</td>
                      <td className="px-5 py-2 text-right tabular-nums text-ink">{formatCurrency(l.grossUsd)}</td>
                      <td className="px-5 py-2 text-right tabular-nums text-warning">{formatCurrency(l.payeUsd)}</td>
                      <td className="px-5 py-2 text-right tabular-nums text-warning">{formatCurrency(l.nssaUsd)}</td>
                      <td className="px-5 py-2 text-right tabular-nums text-warning">{formatCurrency(l.necUsd)}</td>
                      <td className="px-5 py-2 text-right font-semibold tabular-nums text-success">{formatCurrency(l.netUsd)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line bg-surface font-semibold">
                  <td className="px-5 py-3 text-ink" colSpan={4}>Total · {lines.length} employees</td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(run.grossUsd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-warning">{formatCurrency(run.payeUsd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-warning">{formatCurrency(run.nssaUsd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-warning">{formatCurrency(run.necUsd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-success">{formatCurrency(run.netUsd)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Tile({ label, value, emphasis, tone }: { label: string; value: string; emphasis?: boolean; tone?: 'warning' }) {
  return (
    <div className={`rounded-md border p-3 ${emphasis ? 'border-brand-primary bg-brand-primary/5' : 'border-line bg-card'}`}>
      <div className="text-micro text-muted">{label}</div>
      <div className={`text-h3 font-bold tabular-nums ${emphasis ? 'text-brand-primary' : tone === 'warning' ? 'text-warning' : 'text-ink'}`}>{value}</div>
    </div>
  );
}
