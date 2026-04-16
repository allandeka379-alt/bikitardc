'use client';

// Staff adjustments & write-offs queue (spec §3.2).
// Raise a credit or debit on a property balance,
// second approver clears it, demo balance updates.

import { Check, MinusCircle, PlusCircle, Send, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  useAdjustmentsStore,
  type AdjustmentKind,
  type Adjustment,
} from '@/lib/stores/adjustments';
import { formatCurrency, formatRelative } from '@/lib/format';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { cn } from '@/lib/cn';

const TABS = ['pending', 'approved', 'rejected', 'all'] as const;
type Tab = (typeof TABS)[number];

export default function AdjustmentsPage() {
  const items = useAdjustmentsStore((s) => s.items);
  const raise = useAdjustmentsStore((s) => s.raise);
  const approve = useAdjustmentsStore((s) => s.approve);
  const reject = useAdjustmentsStore((s) => s.reject);
  const { fullName } = useCurrentUser();

  const [tab, setTab] = useState<Tab>('pending');
  const [propertyId, setPropertyId] = useState<string>('');
  const [kind, setKind] = useState<AdjustmentKind>('credit');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');

  const property = useMemo(() => PROPERTIES.find((p) => p.id === propertyId), [propertyId]);
  const actor = fullName ?? 'Rates Clerk';

  const raiseAdjustment = () => {
    if (!property || !amount || !reason.trim()) {
      return toast({ title: 'Property, amount and reason are required.', tone: 'danger' });
    }
    raise({
      propertyId: property.id,
      propertyLabel: property.stand,
      ownerId: property.ownerId,
      ownerName: property.ownerName,
      kind,
      amountUsd: Number(amount),
      reason: reason.trim(),
      raisedBy: actor,
    });
    toast({ title: 'Adjustment raised', description: 'Pending second approval.', tone: 'success' });
    setAmount(0);
    setReason('');
    setKind('credit');
    setPropertyId('');
  };

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1));
    return tab === 'all' ? sorted : sorted.filter((i) => i.status === tab);
  }, [items, tab]);

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Adjustments & write-offs</h1>
          <p className="mt-1 text-small text-muted">
            Credits and debits applied manually to a resident's balance. A second approver clears the
            adjustment; the demo balance updates and the resident is notified.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <ScrollReveal>
          <Card className="p-5 sm:p-6">
            <h2 className="text-h3 text-ink">Raise an adjustment</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <Label>Property</Label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="block w-full rounded-sm border border-line bg-card px-3 py-2.5 text-body text-ink focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                >
                  <option value="">Pick a stand…</option>
                  {PROPERTIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.stand} — {p.ownerName} ({p.ward})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Kind</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setKind('credit')}
                    className={cn(
                      'flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                      kind === 'credit'
                        ? 'border-success bg-success/8 text-success'
                        : 'border-line bg-card hover:border-success/40',
                    )}
                  >
                    <MinusCircle className="mt-0.5 h-4 w-4" />
                    <div>
                      <div className="text-small font-semibold">Credit (reduces balance)</div>
                      <div className="text-micro text-muted">Goodwill, write-off, over-charge reversal.</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind('debit')}
                    className={cn(
                      'flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                      kind === 'debit'
                        ? 'border-warning bg-warning/10 text-warning'
                        : 'border-line bg-card hover:border-warning/40',
                    )}
                  >
                    <PlusCircle className="mt-0.5 h-4 w-4" />
                    <div>
                      <div className="text-small font-semibold">Debit (adds to balance)</div>
                      <div className="text-micro text-muted">Dispute outcome, penalty, correction.</div>
                    </div>
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="adj-amount">Amount (USD)</Label>
                <Input
                  id="adj-amount"
                  type="number"
                  step="0.01"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="adj-reason">Reason</Label>
                <textarea
                  id="adj-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Shared with the resident — be specific."
                  className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                />
              </div>
              {property && amount > 0 && (
                <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
                  Previewing: <span className="font-semibold">{property.stand}</span> —{' '}
                  {kind === 'credit' ? '−' : '+'}
                  <span className="font-semibold tabular-nums">{formatCurrency(amount)}</span>
                </div>
              )}
              <Button onClick={raiseAdjustment} leadingIcon={<Send className="h-4 w-4" />}>
                Raise adjustment
              </Button>
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-small font-semibold text-ink">Queue</h3>
              <Badge tone="warning">{pendingCount} pending</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 border-b border-line bg-surface/40 px-5 py-2">
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
                  {t}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState title="No adjustments in this view." />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {filtered.map((a) => (
                  <AdjustmentRow
                    key={a.id}
                    item={a}
                    actor={actor}
                    onApprove={(note) => {
                      approve(a.id, actor, note);
                      toast({ title: 'Adjustment approved', tone: 'success' });
                    }}
                    onReject={(note) => {
                      reject(a.id, actor, note);
                      toast({ title: 'Adjustment rejected', tone: 'danger' });
                    }}
                  />
                ))}
              </ul>
            )}
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

function AdjustmentRow({
  item,
  actor,
  onApprove,
  onReject,
}: {
  item: Adjustment;
  actor: string;
  onApprove: (note?: string) => void;
  onReject: (note?: string) => void;
}) {
  const [deciding, setDeciding] = useState(false);
  const [note, setNote] = useState('');
  const isSelfRaiser = item.raisedBy === actor;

  return (
    <li className="px-5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={item.kind === 'credit' ? 'success' : 'warning'}>
              {item.kind === 'credit' ? 'CREDIT' : 'DEBIT'}
            </Badge>
            <span className="text-small font-semibold tabular-nums text-ink">
              {item.kind === 'credit' ? '−' : '+'}
              {formatCurrency(item.amountUsd)}
            </span>
            <span className="text-micro text-muted">· {item.reference}</span>
          </div>
          <div className="mt-0.5 text-small text-ink">
            {item.propertyLabel} · {item.ownerName}
          </div>
          <div className="mt-1 text-micro text-muted">{item.reason}</div>
          <div className="mt-1 text-[10px] text-muted">
            Raised {formatRelative(item.raisedAt)} by {item.raisedBy}
            {item.decidedBy && ` · ${item.status} by ${item.decidedBy}`}
          </div>
          {item.staffNote && (
            <p className="mt-1 rounded-sm bg-surface/60 px-2.5 py-1.5 text-micro text-ink">
              {item.staffNote}
            </p>
          )}
        </div>
        {item.status === 'pending' && (
          <Badge tone="warning" dot>
            Pending
          </Badge>
        )}
      </div>

      {item.status === 'pending' && (
        <div className="mt-3">
          {deciding ? (
            <div className="space-y-2 rounded-md border border-line bg-surface/50 p-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note — visible on the audit trail."
                rows={2}
                className="block w-full rounded-sm border border-line bg-card px-3 py-1.5 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setDeciding(false); setNote(''); }}>
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
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onApprove(note || undefined);
                    setDeciding(false);
                    setNote('');
                  }}
                  disabled={isSelfRaiser}
                  leadingIcon={<Check className="h-3.5 w-3.5" />}
                  title={isSelfRaiser ? 'You raised this. A second approver is required.' : undefined}
                >
                  Approve
                </Button>
              </div>
              {isSelfRaiser && (
                <p className="text-[10px] text-muted">
                  Second-person approval is required — a different clerk must approve.
                </p>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={() => setDeciding(true)}>
              Review
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
