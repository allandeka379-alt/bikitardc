// Work orders queue — filterable list with status + priority.

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
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TEAMS,
  WORK_ORDERS,
  type WorkOrderStatus,
  type WorkOrderTeam,
} from '@/mocks/fixtures/work-orders';
import { cn } from '@/lib/cn';

const STATUS_ORDER: WorkOrderStatus[] = ['open', 'assigned', 'in-progress', 'blocked', 'completed', 'cancelled'];

export default function WorkOrdersPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus | 'all'>('all');
  const [team, setTeam] = useState<WorkOrderTeam | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...WORK_ORDERS].sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1));
    if (status !== 'all') r = r.filter((x) => x.status === status);
    if (team !== 'all') r = r.filter((x) => x.team === team);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter(
        (x) =>
          x.reference.toLowerCase().includes(ql) ||
          x.title.toLowerCase().includes(ql) ||
          x.location.toLowerCase().includes(ql),
      );
    }
    return r;
  }, [q, status, team]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/works" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Works &amp; assets
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Work orders</h1>
          <p className="mt-1 text-small text-muted">
            {WORK_ORDERS.length} total · {WORK_ORDERS.filter((w) => w.status !== 'completed' && w.status !== 'cancelled').length} currently open.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1 min-w-[240px]">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by reference, title or location…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select value={team} onChange={(e) => setTeam(e.target.value as WorkOrderTeam | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All teams</option>
            {TEAMS.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Team</th>
                <th className="px-5 py-3 text-left">Ward</th>
                <th className="px-5 py-3 text-left">Priority</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Raised</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <Link href={`/erp/works/work-orders/${w.id}`} className="font-mono text-small font-semibold text-ink hover:text-brand-primary">
                      {w.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-ink">{w.title}</div>
                    <div className="truncate-line text-micro text-muted">{w.location}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{w.team}</td>
                  <td className="px-5 py-3 text-muted">{w.ward}</td>
                  <td className="px-5 py-3"><Badge tone={PRIORITY_TONE[w.priority]}>{w.priority}</Badge></td>
                  <td className="px-5 py-3"><Badge tone={STATUS_TONE[w.status]} dot>{STATUS_LABEL[w.status]}</Badge></td>
                  <td className="px-5 py-3 text-muted">
                    <div>{formatDate(w.raisedAt)}</div>
                    <div className="text-micro">{w.raisedBy}</div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className={cn('px-5 py-10 text-center text-small text-muted')}>No work orders match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
