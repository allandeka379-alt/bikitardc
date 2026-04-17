// Requisition detail with line items + lifecycle.

'use client';

import { ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/format';
import { CREDITORS } from '@/mocks/fixtures/creditors';
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  findRequisition,
  totalUsd,
  type RequisitionStatus,
} from '@/mocks/fixtures/requisitions';
import { cn } from '@/lib/cn';

const STAGES: RequisitionStatus[] = ['draft', 'submitted', 'approved', 'po-raised', 'grv-received', 'invoiced'];

export default function RequisitionDetailPage() {
  const params = useParams<{ id: string }>();
  const seed = findRequisition(params.id);
  const [status, setStatus] = useState<RequisitionStatus>(seed?.status ?? 'draft');
  if (!seed) return notFound();

  const supplier = seed.supplierId ? CREDITORS.find((c) => c.id === seed.supplierId) : undefined;
  const total = totalUsd(seed);
  const stageIndex = STAGES.indexOf(status);

  const approve = () => { setStatus('approved'); toast({ title: 'Requisition approved', tone: 'success' }); };
  const reject  = () => { setStatus('rejected');  toast({ title: 'Requisition rejected', tone: 'danger' }); };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/procurement/requisitions" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Requisitions
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-small text-muted">{seed.reference}</span>
                <Badge tone={STATUS_TONE[status]} dot>{STATUS_LABEL[status]}</Badge>
                <Badge tone="neutral">{CATEGORY_LABEL[seed.category]}</Badge>
              </div>
              <h1 className="mt-1 text-h1 text-ink">{seed.title}</h1>
              <p className="mt-2 max-w-2xl text-small text-muted">{seed.justification}</p>
              <div className="mt-2 text-micro text-muted">
                Raised {formatDate(seed.raisedAt)} by <span className="font-semibold text-ink">{seed.requestedBy}</span> · {seed.department}
              </div>
            </div>
            {status === 'submitted' && (
              <div className="flex gap-2">
                <Button variant="ghost" leadingIcon={<X     className="h-4 w-4" />} onClick={reject}>Reject</Button>
                <Button                   leadingIcon={<Check className="h-4 w-4" />} onClick={approve}>Approve</Button>
              </div>
            )}
          </div>
        </Card>
      </ScrollReveal>

      {/* Lifecycle stepper */}
      <Card className="mt-6 p-5">
        <h2 className="text-h3 text-ink">Lifecycle</h2>
        {status === 'rejected' ? (
          <div className="mt-4 rounded-md border border-danger/20 bg-danger/5 p-4 text-small text-danger">
            <div className="font-semibold">Rejected</div>
            <p className="mt-1">{seed.rejectedReason ?? 'Rejected by the approver.'}</p>
          </div>
        ) : (
          <ol className="mt-4 grid gap-3 sm:grid-cols-6">
            {STAGES.map((s, i) => {
              const done = i <= stageIndex;
              return (
                <li key={s} className={cn(
                  'rounded-md border p-3 text-center',
                  done ? 'border-success/30 bg-success/5' : 'border-line bg-surface/30',
                )}>
                  <div className={cn('mx-auto grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold', done ? 'bg-success text-white' : 'bg-line text-muted')}>{i + 1}</div>
                  <div className={cn('mt-1 text-micro font-semibold', done ? 'text-ink' : 'text-muted')}>{STATUS_LABEL[s]}</div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      {/* Line items */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-body font-semibold text-ink">Line items</h2>
          <div className="text-small font-semibold tabular-nums text-ink">Total: {formatCurrency(total)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/40 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-2 text-left">Description</th>
                <th className="px-5 py-2 text-right">Qty</th>
                <th className="px-5 py-2 text-right">Unit price</th>
                <th className="px-5 py-2 text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {seed.lines.map((l, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-2 text-ink">{l.description}</td>
                  <td className="px-5 py-2 text-right tabular-nums text-muted">{l.quantity}</td>
                  <td className="px-5 py-2 text-right tabular-nums text-muted">{formatCurrency(l.unitPriceUsd)}</td>
                  <td className="px-5 py-2 text-right font-semibold tabular-nums text-ink">{formatCurrency(l.quantity * l.unitPriceUsd)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-surface font-semibold">
                <td className="px-5 py-3 text-ink" colSpan={3}>Total</td>
                <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Procurement details */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Procurement details</h2>
          <dl className="mt-3 divide-y divide-line text-small">
            <Row label="Supplier"     value={supplier ? supplier.name : '—'} />
            <Row label="PO number"    value={seed.poNumber ?? '—'} mono />
            <Row label="GRV received" value={seed.grvDate ? formatDate(seed.grvDate) : '—'} />
            <Row label="Invoice id"   value={seed.invoiceId ?? '—'} mono />
            <Row label="Budget line"  value={seed.budgetLineId} mono />
            {seed.approvedAt && <Row label="Approved"   value={`${formatDate(seed.approvedAt)} · ${seed.approvedBy ?? ''}`} />}
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Three-way matching</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Match ok={!!seed.poNumber} label="PO" />
            <Match ok={!!seed.grvDate}  label="GRV" />
            <Match ok={!!seed.invoiceId} label="Invoice" />
          </div>
          <p className="mt-4 text-micro text-muted">
            A three-way match confirms that goods were ordered, received and invoiced for the same value before payment is released.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className={mono ? 'font-mono text-ink' : 'text-ink'}>{value}</dd>
    </div>
  );
}

function Match({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn('rounded-md border p-3 text-center', ok ? 'border-success/30 bg-success/5' : 'border-line bg-surface/30')}>
      <div className={cn('text-micro font-semibold uppercase tracking-wide', ok ? 'text-success' : 'text-muted')}>{label}</div>
      <div className={cn('mt-1 text-body font-bold', ok ? 'text-success' : 'text-muted')}>{ok ? '✓' : '—'}</div>
    </div>
  );
}
