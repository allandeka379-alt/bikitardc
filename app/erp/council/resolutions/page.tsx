// Resolutions tracker.

'use client';

import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import {
  RES_STATUS_LABEL,
  RES_STATUS_TONE,
  RESOLUTIONS,
  findMeeting,
  type ResolutionStatus,
} from '@/mocks/fixtures/council';

const STATUS_ORDER: ResolutionStatus[] = ['proposed', 'amended', 'passed', 'rejected', 'deferred', 'actioned'];

export default function ResolutionsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ResolutionStatus | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...RESOLUTIONS].sort((a, b) => ((a.adoptedAt ?? '') < (b.adoptedAt ?? '') ? 1 : -1));
    if (status !== 'all') r = r.filter((x) => x.status === status);
    const ql = q.trim().toLowerCase();
    if (ql) r = r.filter((x) => x.title.toLowerCase().includes(ql) || x.reference.toLowerCase().includes(ql));
    return r;
  }, [q, status]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/council" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Council workflow
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Resolutions</h1>
          <p className="mt-1 text-small text-muted">{RESOLUTIONS.length} resolutions on record.</p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by title or reference…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as ResolutionStatus | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (<option key={s} value={s}>{RES_STATUS_LABEL[s]}</option>))}
          </select>
        </div>
        <ul className="divide-y divide-line">
          {rows.map((r) => {
            const m = findMeeting(r.meetingId);
            return (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-small text-muted">{r.reference}</span>
                    <Badge tone={RES_STATUS_TONE[r.status]}>{RES_STATUS_LABEL[r.status]}</Badge>
                  </div>
                  {r.adoptedAt && <div className="text-micro text-muted">Adopted {formatDate(r.adoptedAt)}</div>}
                </div>
                <h2 className="mt-1 text-body font-semibold text-ink">{r.title}</h2>
                <p className="mt-1 text-small text-muted">{r.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-micro text-muted">
                  <span>Proposer: <span className="text-ink">{r.proposer}</span></span>
                  <span>Seconder: <span className="text-ink">{r.seconder}</span></span>
                  {m && (
                    <Link href={`/erp/council/meetings/${m.id}`} className="text-brand-primary hover:underline">
                      {m.title}
                    </Link>
                  )}
                </div>
                <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-wide text-muted">
                  <span className="text-success">For {r.votesFor}</span>
                  <span className="text-danger">Against {r.votesAgainst}</span>
                  <span>Abstain {r.abstentions}</span>
                </div>
              </li>
            );
          })}
          {rows.length === 0 && (<li className="px-5 py-10 text-center text-small text-muted">No resolutions match.</li>)}
        </ul>
      </Card>
    </div>
  );
}
