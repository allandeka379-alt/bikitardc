// ─────────────────────────────────────────────
// Creditors (suppliers) — aging buckets and
// supplier list. Click any supplier to see open
// invoices with 3-way matching status.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, Building2, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format';
import {
  CATEGORY_LABEL,
  CREDITORS,
  CREDITOR_INVOICES,
  agingBuckets,
  invoicesForCreditor,
} from '@/mocks/fixtures/creditors';
import { cn } from '@/lib/cn';

export default function CreditorsPage() {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();

  const aging = agingBuckets();
  const total = aging.current + aging.d30 + aging.d60 + aging.d90plus;

  const rows = useMemo(() => {
    const withOpen = CREDITORS.filter((c) => c.openBalanceUsd > 0 || CREDITOR_INVOICES.some((i) => i.creditorId === c.id));
    if (!ql) return withOpen;
    return withOpen.filter(
      (c) => c.name.toLowerCase().includes(ql) || c.praz.toLowerCase().includes(ql),
    );
  }, [ql]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/finance"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Finance
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Creditors</h1>
          <p className="mt-1 text-small text-muted">
            Supplier ledger and invoice aging. Tendered and PRAZ-registered suppliers only.
          </p>
        </div>
      </ScrollReveal>

      {/* Aging */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <AgeTile label="Current" amount={aging.current} total={total} tone="success" />
        <AgeTile label="1 – 30 days" amount={aging.d30} total={total} tone="info" />
        <AgeTile label="31 – 60 days" amount={aging.d60} total={total} tone="warning" />
        <AgeTile label="61+ days" amount={aging.d90plus} total={total} tone="danger" />
      </div>

      <Card className="overflow-hidden">
        <div className="relative border-b border-line px-5 py-3">
          <Search className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search suppliers…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Supplier</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">PRAZ</th>
                <th className="px-5 py-3 text-right">Open invoices</th>
                <th className="px-5 py-3 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const openCount = invoicesForCreditor(c.id).filter((i) => i.status !== 'paid').length;
                return (
                  <tr key={c.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <Link href={`/erp/finance/creditors/${c.id}`} className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brand-primary">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                        {c.name}
                      </Link>
                      <div className="ml-9 text-micro text-muted">Net-{c.paymentTermsDays}</div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="neutral">{CATEGORY_LABEL[c.category]}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-micro text-muted">{c.praz}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{openCount}</td>
                    <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', c.openBalanceUsd > 0 ? 'text-warning' : 'text-muted')}>
                      {formatCurrency(c.openBalanceUsd)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AgeTile({ label, amount, total, tone }: { label: string; amount: number; total: number; tone: 'success' | 'info' | 'warning' | 'danger' }) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <Card className="p-4">
      <div className="text-micro font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={cn(
        'mt-1 text-h3 font-bold tabular-nums',
        tone === 'success' ? 'text-success' : tone === 'info' ? 'text-info' : tone === 'warning' ? 'text-warning' : 'text-danger',
      )}>{formatCurrency(amount)}</div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
        <span
          className={cn(
            'block h-full rounded-full',
            tone === 'success' ? 'bg-success' : tone === 'info' ? 'bg-info' : tone === 'warning' ? 'bg-warning' : 'bg-danger',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-micro text-muted">{pct.toFixed(0)}% of total</div>
    </Card>
  );
}
