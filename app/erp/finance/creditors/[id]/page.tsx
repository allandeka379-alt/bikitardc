// ─────────────────────────────────────────────
// Creditor detail — supplier profile, 3-way match
// status per invoice (PO reference + GRV date +
// invoice) and payment history shortcuts.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, CheckCircle2, CircleAlert, CircleDashed } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  CATEGORY_LABEL,
  CREDITORS,
  invoicesForCreditor,
  type CreditorInvoice,
} from '@/mocks/fixtures/creditors';
import { cn } from '@/lib/cn';

export default function CreditorDetailPage() {
  const params = useParams<{ id: string }>();
  const creditor = CREDITORS.find((c) => c.id === params.id);
  if (!creditor) return notFound();

  const invoices = invoicesForCreditor(creditor.id).sort((a, b) =>
    a.issuedAt < b.issuedAt ? 1 : -1,
  );
  const openTotal = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + (i.totalUsd - i.paidUsd), 0);
  const paidTotal = invoices.reduce((s, i) => s + i.paidUsd, 0);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/finance/creditors"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Creditors
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h1 text-ink">{creditor.name}</h1>
                <Badge tone="brand">{CATEGORY_LABEL[creditor.category]}</Badge>
              </div>
              <div className="mt-2 grid gap-x-6 gap-y-1 text-small text-muted sm:grid-cols-2">
                <div><span className="text-micro uppercase tracking-wide text-muted/80">PRAZ</span>{' '}<span className="font-mono text-ink">{creditor.praz}</span></div>
                <div><span className="text-micro uppercase tracking-wide text-muted/80">VAT</span>{' '}<span className="font-mono text-ink">{creditor.vat}</span></div>
                <div><span className="text-micro uppercase tracking-wide text-muted/80">Email</span>{' '}<span className="text-ink">{creditor.email}</span></div>
                <div><span className="text-micro uppercase tracking-wide text-muted/80">Phone</span>{' '}<span className="text-ink">{creditor.phone}</span></div>
                <div><span className="text-micro uppercase tracking-wide text-muted/80">Terms</span>{' '}<span className="text-ink">Net-{creditor.paymentTermsDays}</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="rounded-md border border-line bg-card px-4 py-2.5">
                <div className="text-micro text-muted">Open balance</div>
                <div className="text-h2 font-bold tabular-nums text-warning">{formatCurrency(openTotal)}</div>
              </div>
              <div className="rounded-md border border-line bg-card px-4 py-2.5">
                <div className="text-micro text-muted">Paid YTD</div>
                <div className="text-h2 font-bold tabular-nums text-success">{formatCurrency(paidTotal)}</div>
              </div>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-ink">Invoices</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Invoice</th>
                  <th className="px-5 py-3 text-left">Issued</th>
                  <th className="px-5 py-3 text-left">Due</th>
                  <th className="px-5 py-3 text-left">3-way match</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Outstanding</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <InvoiceRow key={inv.id} inv={inv} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InvoiceRow({ inv }: { inv: CreditorInvoice }) {
  const outstanding = inv.totalUsd - inv.paidUsd;
  const hasPo = !!inv.reference;
  const hasGrv = !!inv.grvDate;
  const hasInv = true;
  const matched = hasPo && hasGrv && hasInv;
  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-surface/60">
      <td className="px-5 py-3">
        <div className="font-mono text-small font-semibold text-ink">{inv.invoiceNumber}</div>
        <div className="font-mono text-micro text-muted">{inv.reference}</div>
      </td>
      <td className="px-5 py-3 text-muted">{formatDate(inv.issuedAt)}</td>
      <td className="px-5 py-3 text-muted">{formatDate(inv.dueAt)}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <MatchPill label="PO"  ok={hasPo}  />
          <MatchPill label="GRV" ok={hasGrv} />
          <MatchPill label="INV" ok={hasInv} />
        </div>
      </td>
      <td className="px-5 py-3 text-right tabular-nums text-muted">{formatCurrency(inv.totalUsd)}</td>
      <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', outstanding > 0 ? 'text-warning' : 'text-muted')}>
        {formatCurrency(outstanding)}
      </td>
      <td className="px-5 py-3">
        <StatusPill status={inv.status} matched={matched} />
      </td>
    </tr>
  );
}

function MatchPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
      ok ? 'bg-success/10 text-success' : 'bg-line text-muted',
    )}>
      {ok ? <CheckCircle2 className="h-2.5 w-2.5" /> : <CircleDashed className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

function StatusPill({ status, matched }: { status: CreditorInvoice['status']; matched: boolean }) {
  if (status === 'paid')      return <Badge tone="success">Paid</Badge>;
  if (status === 'part-paid') return <Badge tone="info">Part-paid</Badge>;
  if (status === 'disputed')  return <Badge tone="danger">Disputed</Badge>;
  return matched
    ? <Badge tone="warning">Ready to pay</Badge>
    : <span className="inline-flex items-center gap-1 text-micro text-muted"><CircleAlert className="h-3 w-3" /> Incomplete match</span>;
}
