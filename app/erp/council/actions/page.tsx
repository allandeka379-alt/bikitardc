// Action items tracker.

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
  ACT_STATUS_LABEL,
  ACT_STATUS_TONE,
  ACTION_ITEMS,
  findMeeting,
  type ActionStatus,
} from '@/mocks/fixtures/council';
import { cn } from '@/lib/cn';

const STATUS_ORDER: ActionStatus[] = ['open', 'in-progress', 'overdue', 'completed', 'cancelled'];

export default function ActionsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ActionStatus | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...ACTION_ITEMS].sort((a, b) => (a.dueAt < b.dueAt ? -1 : 1));
    if (status !== 'all') r = r.filter((x) => x.status === status);
    const ql = q.trim().toLowerCase();
    if (ql) r = r.filter((x) => x.description.toLowerCase().includes(ql) || x.owner.toLowerCase().includes(ql) || x.reference.toLowerCase().includes(ql));
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
          <h1 className="text-h1 text-ink">Action items</h1>
          <p className="mt-1 text-small text-muted">
            {ACTION_ITEMS.length} items tracked · {ACTION_ITEMS.filter((a) => a.status === 'overdue').length} overdue.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by description, owner or reference…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as ActionStatus | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (<option key={s} value={s}>{ACT_STATUS_LABEL[s]}</option>))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">From meeting</th>
                <th className="px-5 py-3 text-left">Progress</th>
                <th className="px-5 py-3 text-left">Due</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const m = findMeeting(a.meetingId);
                return (
                  <tr key={a.id} className={cn('border-b border-line last:border-b-0 hover:bg-surface/60', a.status === 'overdue' && 'bg-danger/5')}>
                    <td className="px-5 py-3 font-mono text-small text-ink">{a.reference}</td>
                    <td className="px-5 py-3">
                      <div className="text-ink">{a.description}</div>
                      {a.notes && <div className="text-micro text-muted">{a.notes}</div>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-ink">{a.owner}</div>
                      <div className="text-micro text-muted">{a.department}</div>
                    </td>
                    <td className="px-5 py-3">
                      {m ? (
                        <Link href={`/erp/council/meetings/${m.id}`} className="text-ink hover:text-brand-primary">{m.title}</Link>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-1 w-24 overflow-hidden rounded-full bg-line">
                        <span className={cn('block h-full rounded-full', a.status === 'overdue' ? 'bg-danger' : a.progressPct >= 80 ? 'bg-success' : 'bg-brand-primary')} style={{ width: `${a.progressPct}%` }} />
                      </div>
                      <div className="mt-0.5 text-[10px] tabular-nums text-muted">{a.progressPct}%</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{formatDate(a.dueAt)}</td>
                    <td className="px-5 py-3"><Badge tone={ACT_STATUS_TONE[a.status]} dot>{ACT_STATUS_LABEL[a.status]}</Badge></td>
                  </tr>
                );
              })}
              {rows.length === 0 && (<tr><td colSpan={7} className="px-5 py-10 text-center text-small text-muted">No action items match.</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
