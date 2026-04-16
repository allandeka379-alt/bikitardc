'use client';

// Staff queue for payment arrangements (spec §3.1).
// Clerks approve or reject with an optional note.

import { CalendarClock, Check, MessageSquareX, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useArrangementsStore } from '@/lib/stores/arrangements';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

type Tab = 'pending' | 'approved' | 'rejected' | 'all';

export default function ArrangementsQueuePage() {
  const items = useArrangementsStore((s) => s.items);
  const approve = useArrangementsStore((s) => s.approve);
  const reject = useArrangementsStore((s) => s.reject);
  const { fullName } = useCurrentUser();
  const [tab, setTab] = useState<Tab>('pending');
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
    if (tab === 'all') return sorted;
    return sorted.filter((i) => i.status === tab);
  }, [items, tab]);

  const actor = fullName ?? 'Rates Clerk';

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Payment arrangements</h1>
          <p className="mt-1 text-small text-muted">
            Residents proposing to settle arrears in installments. Approve or reject with a short note.
          </p>
        </div>
      </ScrollReveal>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['pending', 'approved', 'rejected', 'all'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
              tab === t
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-line bg-card text-ink hover:border-brand-primary/30',
            )}
          >
            {t[0]?.toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-8 w-8" />}
          title="No arrangements in this view."
          description="When residents propose a plan for their arrears, requests land here for approval."
        />
      ) : (
        <ul className="grid gap-3">
          {filtered.map((arr) => (
            <li key={arr.id}>
              <Card className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-micro text-muted">
                      <span className="font-mono text-ink">{arr.reference}</span>
                      <span aria-hidden>·</span>
                      <span>requested {formatDate(arr.requestedAt)}</span>
                    </div>
                    <h2 className="text-body font-semibold text-ink">
                      {arr.ownerName} — {arr.propertyLabel}
                    </h2>
                    <p className="mt-0.5 text-small text-muted">
                      Total {formatCurrency(arr.totalUsd)} over {arr.installments.length} installments ·{' '}
                      {formatCurrency(arr.installments[0]?.amountUsd ?? 0)}/month
                    </p>
                  </div>
                  <Badge
                    tone={
                      arr.status === 'approved'
                        ? 'success'
                        : arr.status === 'pending'
                          ? 'warning'
                          : arr.status === 'rejected'
                            ? 'danger'
                            : 'neutral'
                    }
                  >
                    {arr.status}
                  </Badge>
                </div>

                <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="mb-1 text-micro font-semibold uppercase tracking-wide text-muted">
                      Reason
                    </div>
                    <p className="text-small text-ink">{arr.reason}</p>

                    <div className="mt-3 text-micro font-semibold uppercase tracking-wide text-muted">
                      Schedule
                    </div>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {arr.installments.map((ins, i) => (
                        <li
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-2.5 py-0.5 text-micro"
                        >
                          <CalendarClock className="h-3 w-3 text-muted" />
                          {formatDate(ins.dueDate)} ·{' '}
                          <span className="font-semibold tabular-nums text-ink">
                            {formatCurrency(ins.amountUsd)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {arr.status === 'pending' ? (
                    <div className="flex flex-col gap-2 lg:min-w-[220px]">
                      {decidingId === arr.id ? (
                        <>
                          <Label htmlFor={`note_${arr.id}`}>Optional note</Label>
                          <textarea
                            id={`note_${arr.id}`}
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="block w-full rounded-sm border border-line bg-card px-3 py-2 text-small text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                            placeholder="Shared with the resident."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                reject(arr.id, actor, note || undefined);
                                toast({ title: 'Arrangement rejected', tone: 'danger' });
                                setDecidingId(null);
                                setNote('');
                              }}
                              leadingIcon={<X className="h-3.5 w-3.5" />}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                approve(arr.id, actor, note || undefined);
                                toast({ title: 'Arrangement approved', tone: 'success' });
                                setDecidingId(null);
                                setNote('');
                              }}
                              leadingIcon={<Check className="h-3.5 w-3.5" />}
                            >
                              Approve
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDecidingId(null);
                              setNote('');
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setDecidingId(arr.id);
                            setNote('');
                          }}
                          leadingIcon={<MessageSquareX className="h-3.5 w-3.5" />}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-small">
                      {arr.decidedBy && (
                        <div className="text-micro text-muted">
                          {arr.status} by {arr.decidedBy}
                          {arr.decidedAt && ` · ${formatDate(arr.decidedAt)}`}
                        </div>
                      )}
                      {arr.staffNote && (
                        <p className="mt-1 rounded-sm bg-surface/60 px-2.5 py-1.5 text-ink">
                          {arr.staffNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
