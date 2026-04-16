'use client';

// Scheduled auto-pay setup form (spec §3.1).
// Purely visual — no cron runs, nothing is paid.
// Confirms via a success toast + a strip on the
// property detail page.

import { ArrowLeft, CalendarClock, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InlineMethodPicker } from '@/components/portal/inline-method-picker';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useAutoPayForProperty, useAutoPayStore, type AutoPayMode } from '@/lib/stores/autopay';
import { usePropertyWithOverrides } from '@/lib/stores/demo';
import { formatCurrency } from '@/lib/format';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import type { PaymentChannel } from '@/mocks/fixtures/transactions';
import { cn } from '@/lib/cn';

export default function AutoPaySetupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, userId } = useCurrentUser();
  const property = usePropertyWithOverrides(id);
  const existing = useAutoPayForProperty(id ?? null);
  const upsert = useAutoPayStore((s) => s.upsert);
  const cancel = useAutoPayStore((s) => s.cancel);

  const me = DEMO_USERS.find((u) => u.id === userId);

  const [mode, setMode] = useState<AutoPayMode>('full');
  const [amount, setAmount] = useState<number>(0);
  const [channel, setChannel] = useState<PaymentChannel>('ecocash');
  const [phone, setPhone] = useState('');
  const [day, setDay] = useState(1);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (existing) {
      setMode(existing.mode);
      setAmount(existing.fixedAmountUsd ?? 0);
      setChannel(existing.channel);
      setPhone(existing.phone ?? me?.phone ?? '');
      setDay(existing.dayOfMonth);
      setAccepted(true);
    } else if (me?.phone) {
      setPhone(me.phone);
    }
  }, [existing, me?.phone]);

  if (!hydrated) return null;
  if (!property) return notFound();
  if (userId && property.ownerId !== userId) return notFound();

  const save = () => {
    if (mode === 'fixed' && amount <= 0) {
      return toast({ title: 'Enter a fixed monthly amount.', tone: 'danger' });
    }
    if ((['ecocash', 'onemoney', 'innbucks'] as PaymentChannel[]).includes(channel) && !/^[+\d\s]{7,}$/.test(phone)) {
      return toast({ title: 'Enter a valid mobile wallet number.', tone: 'danger' });
    }
    if (!accepted) {
      return toast({ title: 'Please confirm the debit mandate.', tone: 'danger' });
    }
    if (!userId) return;

    upsert({
      propertyId: property.id,
      ownerId: userId,
      mode,
      fixedAmountUsd: mode === 'fixed' ? amount : undefined,
      channel,
      phone,
      dayOfMonth: day,
      active: true,
    });
    toast({
      title: 'Auto-pay set',
      description: `We'll charge on day ${day} of every month.`,
      tone: 'success',
    });
    router.replace(`/portal/property/${property.id}`);
  };

  const cancelPlan = () => {
    if (!existing) return;
    cancel(existing.id);
    toast({ title: 'Auto-pay cancelled', tone: 'info' });
    router.replace(`/portal/property/${property.id}`);
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href={`/portal/property/${property.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to property
      </Link>

      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Schedule auto-pay</h1>
            <p className="mt-1 text-small text-muted">
              Never miss a bill. Cancel or edit any time.
            </p>
          </div>
          {existing?.active && (
            <Badge tone="success" dot>
              Active
            </Badge>
          )}
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-h3 text-ink">{property.stand}</h2>
          <p className="text-small text-muted">{property.address}</p>

          <div className="mt-5">
            <Label>What should we pay?</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode('full')}
                className={cn(
                  'flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                  mode === 'full'
                    ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                    : 'border-line bg-card hover:border-brand-primary/25',
                )}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-primary" />
                <div>
                  <div className="text-small font-semibold text-ink">Full outstanding</div>
                  <div className="text-micro text-muted">
                    Pay whatever's owed on day {day} — zero or the full bill.
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('fixed')}
                className={cn(
                  'flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                  mode === 'fixed'
                    ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                    : 'border-line bg-card hover:border-brand-primary/25',
                )}
              >
                <CalendarClock className="mt-0.5 h-4 w-4 text-brand-primary" />
                <div>
                  <div className="text-small font-semibold text-ink">Fixed amount</div>
                  <div className="text-micro text-muted">Pay a flat amount every month.</div>
                </div>
              </button>
            </div>
          </div>

          {mode === 'fixed' && (
            <div className="mt-4 max-w-xs">
              <Label htmlFor="ap-amount">Monthly amount (USD)</Label>
              <Input
                id="ap-amount"
                type="number"
                step="0.5"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          )}

          <div className="mt-5">
            <Label>Day of month</Label>
            <div className="flex flex-wrap gap-1">
              {[1, 5, 10, 15, 20, 25, 28].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={cn(
                    'h-9 min-w-[40px] rounded-md border px-2 text-small font-semibold transition-colors',
                    day === d
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-line bg-card text-ink hover:border-brand-primary/30',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Label>Payment method</Label>
            <InlineMethodPicker value={channel} onChange={setChannel} />
          </div>

          {(['ecocash', 'onemoney', 'innbucks'] as PaymentChannel[]).includes(channel) && (
            <div className="mt-4 max-w-sm">
              <Label htmlFor="ap-phone">Mobile wallet number</Label>
              <Input
                id="ap-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+263 77 123 4567"
              />
            </div>
          )}

          <label className="mt-5 flex items-start gap-2.5 text-small text-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-line text-brand-primary focus:ring-brand-primary/40"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              I authorise the council to debit the selected method on day {day} of every month.
              Cancel any time. Failed debits retry once; you'll be notified either way.
            </span>
          </label>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {existing && (
              <Button variant="destructive" onClick={cancelPlan} leadingIcon={<Trash2 className="h-4 w-4" />}>
                Cancel auto-pay
              </Button>
            )}
            <Button onClick={save}>{existing ? 'Update' : 'Activate'}</Button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-h3 text-ink">Summary</h3>
          <dl className="mt-3 space-y-2 text-small">
            <Row label="Property" value={property.stand} />
            <Row label="Mode" value={mode === 'full' ? 'Full outstanding' : `Fixed ${formatCurrency(amount)}`} />
            <Row label="Day" value={`Day ${day} of each month`} />
            <Row label="Method" value={channel} />
          </dl>
          <div className="mt-4 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
            Setup only — no money moves in the demo. Your dashboard will show "Auto-pay set" on this
            property's card.
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium capitalize text-ink">{value}</dd>
    </div>
  );
}
