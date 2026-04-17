// Contracts list with burn + expiry.

'use client';

import { ArrowLeft, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  CONTRACTS,
  STATUS_LABEL,
  STATUS_TONE,
  burnPct,
  daysToExpiry,
  type ContractStatus,
} from '@/mocks/fixtures/contracts';
import { cn } from '@/lib/cn';

const STATUS_ORDER: ContractStatus[] = ['active', 'expiring', 'expired', 'terminated'];

export default function ContractsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ContractStatus | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...CONTRACTS].sort((a, b) => (a.endsAt < b.endsAt ? -1 : 1));
    if (status !== 'all') r = r.filter((c) => c.status === status);
    const ql = q.trim().toLowerCase();
    if (ql) r = r.filter((c) => c.title.toLowerCase().includes(ql) || c.supplierName.toLowerCase().includes(ql) || c.reference.toLowerCase().includes(ql));
    return r;
  }, [q, status]);

  const totalActive = CONTRACTS.filter((c) => c.status === 'active').reduce((s, c) => s + c.ceilingUsd, 0);
  const totalBurn   = CONTRACTS.reduce((s, c) => s + c.consumedUsd, 0);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/procurement" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Procurement
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Supplier contracts</h1>
          <p className="mt-1 text-small text-muted">
            {CONTRACTS.length} contracts · {formatCurrency(totalActive)} active ceiling · {formatCurrency(totalBurn)} consumed.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by title, supplier or reference…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as ContractStatus | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Contract</th>
                <th className="px-5 py-3 text-left">Supplier</th>
                <th className="px-5 py-3 text-left">Dates</th>
                <th className="px-5 py-3 text-left">Burn</th>
                <th className="px-5 py-3 text-right">Ceiling</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const pct = burnPct(c) * 100;
                const days = daysToExpiry(c);
                return (
                  <tr key={c.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3 font-mono text-small text-ink">{c.reference}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-ink">{c.title}</div>
                      <div className="truncate-line text-micro text-muted">{c.department} · {c.ownerEmployee}</div>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/erp/finance/creditors/${c.supplierId}`} className="text-ink hover:text-brand-primary">{c.supplierName}</Link>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <div className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(c.startsAt)}</div>
                      <div className="text-micro">to {formatDate(c.endsAt)}</div>
                      {days > 0 && days <= 60 && c.status !== 'expired' && (
                        <div className="text-[10px] font-bold uppercase tracking-wide text-warning">{days} days left</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative h-1 w-28 overflow-hidden rounded-full bg-line">
                        <span className={cn('block h-full rounded-full', pct >= 90 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-brand-primary')} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="mt-1 text-[10px] tabular-nums text-muted">{Math.round(pct)}% · {formatCurrency(c.consumedUsd)}</div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(c.ceilingUsd)}</td>
                    <td className="px-5 py-3"><Badge tone={STATUS_TONE[c.status]} dot>{STATUS_LABEL[c.status]}</Badge></td>
                  </tr>
                );
              })}
              {rows.length === 0 && (<tr><td colSpan={7} className="px-5 py-10 text-center text-small text-muted">No contracts match.</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
