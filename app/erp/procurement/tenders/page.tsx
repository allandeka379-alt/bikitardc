// Tenders & RFQs list.

'use client';

import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  METHOD_LABEL,
  STAGE_LABEL,
  STAGE_TONE,
  TENDERS,
  type TenderStage,
} from '@/mocks/fixtures/procurement-tenders';

const STAGE_ORDER: TenderStage[] = ['draft', 'advertised', 'closed', 'evaluation', 'award-recommended', 'award', 'contract-signed', 'cancelled'];

export default function TendersPage() {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState<TenderStage | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...TENDERS].sort((a, b) => (a.advertisedAt < b.advertisedAt ? 1 : -1));
    if (stage !== 'all') r = r.filter((t) => t.stage === stage);
    const ql = q.trim().toLowerCase();
    if (ql) r = r.filter((t) => t.reference.toLowerCase().includes(ql) || t.title.toLowerCase().includes(ql));
    return r;
  }, [q, stage]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/procurement" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Procurement
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Tenders &amp; RFQs</h1>
          <p className="mt-1 text-small text-muted">{TENDERS.length} procurement processes across the FY.</p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by reference or title…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={stage} onChange={(e) => setStage(e.target.value as TenderStage | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All stages</option>
            {STAGE_ORDER.map((s) => (<option key={s} value={s}>{STAGE_LABEL[s]}</option>))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Method</th>
                <th className="px-5 py-3 text-right">Envelope</th>
                <th className="px-5 py-3 text-left">Advertised</th>
                <th className="px-5 py-3 text-left">Closes</th>
                <th className="px-5 py-3 text-left">Stage</th>
                <th className="px-5 py-3 text-left">Awarded to</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3 font-mono text-small">
                    <Link href={`/erp/procurement/tenders/${t.id}`} className="text-ink hover:text-brand-primary">{t.reference}</Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-ink">{t.title}</div>
                    <div className="truncate-line text-micro text-muted">{t.department} · {t.owner}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{METHOD_LABEL[t.method]}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(t.budgetEnvelopeUsd)}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(t.advertisedAt)}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(t.closesAt)}</td>
                  <td className="px-5 py-3"><Badge tone={STAGE_TONE[t.stage]} dot>{STAGE_LABEL[t.stage]}</Badge></td>
                  <td className="px-5 py-3 text-ink">{t.awardedTo ?? '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (<tr><td colSpan={8} className="px-5 py-10 text-center text-small text-muted">No tenders match.</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
