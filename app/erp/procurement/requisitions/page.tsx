// Requisitions queue.

'use client';

import { ArrowLeft, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  CATEGORY_LABEL,
  REQUISITIONS,
  STATUS_LABEL,
  STATUS_TONE,
  totalUsd,
  type RequisitionStatus,
} from '@/mocks/fixtures/requisitions';

const STATUS_ORDER: RequisitionStatus[] = ['draft', 'submitted', 'approved', 'po-raised', 'grv-received', 'invoiced', 'rejected', 'cancelled'];

export default function RequisitionsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<RequisitionStatus | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...REQUISITIONS].sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1));
    if (status !== 'all') r = r.filter((x) => x.status === status);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter((x) => x.reference.toLowerCase().includes(ql) || x.title.toLowerCase().includes(ql) || x.requestedBy.toLowerCase().includes(ql));
    }
    return r;
  }, [q, status]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/procurement" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Procurement
      </Link>

      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Requisitions</h1>
            <p className="mt-1 text-small text-muted">{REQUISITIONS.length} requisitions on file.</p>
          </div>
          <Button leadingIcon={<Plus className="h-4 w-4" />} disabled>New requisition</Button>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by reference, title or requester…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as RequisitionStatus | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Requester</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">Value</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Raised</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3 font-mono text-small text-ink">
                    <Link href={`/erp/procurement/requisitions/${r.id}`} className="hover:text-brand-primary">{r.reference}</Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-ink">{r.title}</div>
                    <div className="truncate-line text-micro text-muted">{r.justification}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-ink">{r.requestedBy}</div>
                    <div className="text-micro text-muted">{r.department}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{CATEGORY_LABEL[r.category]}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(totalUsd(r))}</td>
                  <td className="px-5 py-3"><Badge tone={STATUS_TONE[r.status]} dot>{STATUS_LABEL[r.status]}</Badge></td>
                  <td className="px-5 py-3 text-muted">{formatDate(r.raisedAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (<tr><td colSpan={7} className="px-5 py-10 text-center text-small text-muted">No requisitions match.</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
