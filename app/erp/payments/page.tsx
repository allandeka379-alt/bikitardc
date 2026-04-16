'use client';

// ERP payments log — all transactions across all
// residents. The reconciliation queue lives at
// /erp/payments/reconcile.

import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { CHANNEL_LABEL, TRANSACTIONS } from '@/mocks/fixtures/transactions';
import { PROPERTIES } from '@/mocks/fixtures/properties';

export default function PaymentsLogPage() {
  const [q, setQ] = useState('');
  const propMap = Object.fromEntries(PROPERTIES.map((p) => [p.id, p]));

  const rows = TRANSACTIONS
    .filter(
      (t) =>
        t.reference.toLowerCase().includes(q.toLowerCase()) ||
        (propMap[t.propertyId]?.stand ?? '').toLowerCase().includes(q.toLowerCase()),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Payments</h1>
            <p className="mt-1 text-small text-muted">
              {TRANSACTIONS.length} transactions on record.
            </p>
          </div>
          <Button asChild leadingIcon={<ClipboardList className="h-4 w-4" />}>
            <Link href="/erp/payments/reconcile">Open reconciliation</Link>
          </Button>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3">
          <Input
            placeholder="Search by reference or stand…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Property</th>
                <th className="px-5 py-3 text-left">Method</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-left">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3 font-mono text-micro text-ink">{t.reference}</td>
                  <td className="px-5 py-3 text-muted">{propMap[t.propertyId]?.stand ?? t.propertyId}</td>
                  <td className="px-5 py-3 text-ink">{CHANNEL_LABEL[t.channel]}</td>
                  <td className="px-5 py-3">
                    <Badge tone={t.status === 'succeeded' ? 'success' : t.status === 'failed' ? 'danger' : 'warning'}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', t.status === 'succeeded' ? 'text-ink' : 'text-muted')}>
                    {formatCurrency(t.amount, t.currency)}
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
