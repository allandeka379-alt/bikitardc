// Payroll runs list.

'use client';

import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  PAYROLL_RUNS,
  RUN_STATUS_LABEL,
  RUN_STATUS_TONE,
} from '@/mocks/fixtures/payroll';

export default function PayrollPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/hr" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        HR &amp; Payroll
      </Link>

      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Payroll runs</h1>
            <p className="mt-1 text-small text-muted">
              Monthly runs with PAYE, NSSA and NEC withheld. Finance must approve before payout.
            </p>
          </div>
          <Button asChild leadingIcon={<Plus className="h-4 w-4" />} disabled>
            <Link href="/erp/hr/payroll">New run</Link>
          </Button>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Period</th>
                <th className="px-5 py-3 text-right">Employees</th>
                <th className="px-5 py-3 text-right">Gross</th>
                <th className="px-5 py-3 text-right">PAYE</th>
                <th className="px-5 py-3 text-right">NSSA</th>
                <th className="px-5 py-3 text-right">NEC</th>
                <th className="px-5 py-3 text-right">Net</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {PAYROLL_RUNS.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <Link href={`/erp/hr/payroll/${r.id}`} className="font-semibold text-ink hover:text-brand-primary">
                      {r.period}
                    </Link>
                    <div className="font-mono text-micro text-muted">{r.id}</div>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted">{r.employeeCount}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(r.grossUsd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-warning">{formatCurrency(r.payeUsd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-warning">{formatCurrency(r.nssaUsd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-warning">{formatCurrency(r.necUsd)}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-success">{formatCurrency(r.netUsd)}</td>
                  <td className="px-5 py-3"><Badge tone={RUN_STATUS_TONE[r.status]} dot>{RUN_STATUS_LABEL[r.status]}</Badge></td>
                  <td className="px-5 py-3 text-muted">
                    <div>{formatDate(r.createdAt)}</div>
                    <div className="text-micro">{r.createdBy}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
