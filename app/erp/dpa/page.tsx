'use client';

// Staff queue for Data Protection Act requests
// (spec §3.3). 30-day SLA; overdue highlighted.

import { Check, Clock3, Download, Shield, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  DPA_LABEL,
  useDpaStore,
  type DpaRequest,
  type DpaStatus,
} from '@/lib/stores/dpa';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

const STATUS_TONE: Record<DpaStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  'in-progress': 'info',
  fulfilled: 'success',
  rejected: 'danger',
};

const TABS = ['pending', 'in-progress', 'fulfilled', 'rejected', 'all'] as const;
type Tab = (typeof TABS)[number];

export default function DpaQueuePage() {
  const items = useDpaStore((s) => s.items);
  const advance = useDpaStore((s) => s.advance);
  const fulfill = useDpaStore((s) => s.fulfill);
  const reject = useDpaStore((s) => s.reject);
  const { fullName } = useCurrentUser();
  const [tab, setTab] = useState<Tab>('pending');

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    return tab === 'all' ? sorted : sorted.filter((i) => i.status === tab);
  }, [items, tab]);

  const actor = fullName ?? 'Data Protection Officer';

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const overdue = items.filter(
    (i) => i.status !== 'fulfilled' && i.status !== 'rejected' && new Date(i.dueBy).getTime() < Date.now(),
  ).length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Data Protection Act requests</h1>
            <p className="mt-1 text-small text-muted">
              Zimbabwe DPA obliges us to respond within 30 calendar days. Overdue items surface in red.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warning">{pendingCount} pending</Badge>
            {overdue > 0 && <Badge tone="danger">{overdue} overdue</Badge>}
          </div>
        </div>
      </ScrollReveal>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full border px-3 py-1 text-micro font-medium capitalize transition-colors',
              tab === t
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-line bg-card text-ink hover:border-brand-primary/30',
            )}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Shield className="h-8 w-8" />} title="No requests in this view." />
      ) : (
        <ul className="grid gap-3">
          {filtered.map((r) => (
            <DpaRow
              key={r.id}
              request={r}
              onAdvance={() => {
                advance(r.id, actor);
                toast({ title: 'Marked in-progress', tone: 'info' });
              }}
              onFulfill={(note) => {
                fulfill(r.id, actor, note);
                toast({ title: 'Request fulfilled', tone: 'success' });
              }}
              onReject={(note) => {
                reject(r.id, actor, note);
                toast({ title: 'Request declined', tone: 'danger' });
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function DpaRow({
  request: r,
  onAdvance,
  onFulfill,
  onReject,
}: {
  request: DpaRequest;
  onAdvance: () => void;
  onFulfill: (note?: string) => void;
  onReject: (note?: string) => void;
}) {
  const [deciding, setDeciding] = useState(false);
  const [note, setNote] = useState('');
  const overdue =
    r.status !== 'fulfilled' && r.status !== 'rejected' && new Date(r.dueBy).getTime() < Date.now();

  return (
    <li>
      <Card className={cn('overflow-hidden', overdue && 'border-danger/30 bg-danger/[0.02]')}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
              {overdue && <Badge tone="danger">Overdue</Badge>}
              <span className="font-mono text-[10px] text-muted">{r.reference}</span>
            </div>
            <div className="text-body font-semibold text-ink">
              {DPA_LABEL[r.kind]} — {r.applicantName}
            </div>
            <div className="text-micro text-muted">
              {r.applicantEmail} · Submitted {formatRelative(r.submittedAt)} · Due{' '}
              {formatDate(r.dueBy)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-micro text-muted">
            <Clock3 className="h-3.5 w-3.5" /> 30-day SLA
          </div>
        </div>

        <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="text-micro font-semibold uppercase tracking-wide text-muted">Scope</div>
            <p className="mt-0.5 text-small text-ink">{r.scope}</p>
            <div className="mt-3 text-micro font-semibold uppercase tracking-wide text-muted">Reason</div>
            <p className="mt-0.5 text-small text-ink">{r.reason}</p>
            {r.staffNote && (
              <p className="mt-2 rounded-sm bg-surface/60 px-2.5 py-1.5 text-micro text-ink">
                <span className="font-semibold">Staff note:</span> {r.staffNote}
              </p>
            )}
            {r.artifactLabel && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-micro text-success">
                <Download className="h-3.5 w-3.5" />
                Artifact ready: <span className="font-mono">{r.artifactLabel}</span>
              </div>
            )}
          </div>

          {(r.status === 'pending' || r.status === 'in-progress') && (
            <div className="flex flex-col gap-2 lg:min-w-[240px]">
              {deciding ? (
                <div className="space-y-2 rounded-md border border-line bg-surface/50 p-3">
                  <Label htmlFor={`dpa-note-${r.id}`}>Response note</Label>
                  <textarea
                    id={`dpa-note-${r.id}`}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="block w-full rounded-sm border border-line bg-card px-3 py-1.5 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeciding(false);
                        setNote('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        onReject(note || undefined);
                        setDeciding(false);
                        setNote('');
                      }}
                      leadingIcon={<X className="h-3.5 w-3.5" />}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onFulfill(note || undefined);
                        setDeciding(false);
                        setNote('');
                      }}
                      leadingIcon={<Check className="h-3.5 w-3.5" />}
                    >
                      Fulfil
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {r.status === 'pending' && (
                    <Button size="sm" variant="secondary" onClick={onAdvance}>
                      Start review
                    </Button>
                  )}
                  <Button size="sm" onClick={() => setDeciding(true)}>
                    Respond
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </li>
  );
}
