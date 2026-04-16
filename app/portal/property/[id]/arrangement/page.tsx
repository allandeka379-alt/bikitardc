'use client';

// ─────────────────────────────────────────────
// Request a payment arrangement for arrears.
// Spec §3.1 "Payment arrangement / plan for arrears".
// ─────────────────────────────────────────────

import { ArrowLeft, CalendarClock, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useArrangementForProperty, useArrangementsStore } from '@/lib/stores/arrangements';
import { usePropertyWithOverrides } from '@/lib/stores/demo';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const OPTIONS = [2, 3, 4, 6] as const;

export default function RequestArrangementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const property = usePropertyWithOverrides(id);
  const { hydrated, userId, fullName } = useCurrentUser();
  const propose = useArrangementsStore((s) => s.propose);
  const existing = useArrangementForProperty(id ?? null);

  const [months, setMonths] = useState<number>(3);
  const [reason, setReason] = useState('');

  const schedule = useMemo(() => {
    if (!property) return [];
    const amount = Number((property.balanceUsd / months).toFixed(2));
    const start = new Date();
    start.setDate(1);
    start.setMonth(start.getMonth() + 1);
    return Array.from({ length: months }).map((_, i) => {
      const d = new Date(start);
      d.setMonth(start.getMonth() + i);
      return { dueDate: d.toISOString(), amountUsd: amount };
    });
  }, [property, months]);

  if (!hydrated) return null;
  if (!property) return notFound();
  if (userId && property.ownerId !== userId) return notFound();

  const submit = () => {
    if (!reason.trim()) {
      toast({ title: 'Add a short reason so the council can review.', tone: 'danger' });
      return;
    }
    if (!userId) return;
    const arr = propose({
      propertyId: property.id,
      propertyLabel: property.stand,
      ownerId: userId,
      ownerName: fullName ?? 'Resident',
      totalUsd: property.balanceUsd,
      installments: schedule,
      reason: reason.trim(),
    });
    toast({
      title: `Arrangement ${arr.reference} submitted`,
      description: 'A clerk will review within 48h. You\'ll be notified either way.',
      tone: 'success',
    });
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
        <h1 className="text-h1 text-ink">Request a payment arrangement</h1>
        <p className="mt-1 text-small text-muted">
          Split your outstanding balance into monthly installments, subject to council approval.
        </p>
      </ScrollReveal>

      {existing && existing.status !== 'rejected' && (
        <ScrollReveal>
          <Card className="mt-6 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 inline-flex items-center gap-2 text-micro text-muted">
                  <span className="font-mono text-ink">{existing.reference}</span>
                  <span aria-hidden>·</span>
                  <span>requested {formatDate(existing.requestedAt)}</span>
                </div>
                <div className="text-body font-semibold text-ink">
                  You already have an arrangement on this property
                </div>
                <p className="mt-0.5 text-small text-muted">
                  Cancel the existing one first if you want to propose a new plan.
                </p>
              </div>
              <Badge
                tone={
                  existing.status === 'approved'
                    ? 'success'
                    : existing.status === 'pending'
                      ? 'warning'
                      : 'neutral'
                }
              >
                {existing.status}
              </Badge>
            </div>
          </Card>
        </ScrollReveal>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <ScrollReveal>
          <Card className="p-5 sm:p-6">
            <h2 className="text-h3 text-ink">Choose an installment plan</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-small font-medium transition-colors',
                    months === m
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-line bg-card text-ink hover:border-brand-primary/30',
                  )}
                >
                  {m} months
                  <span className="ml-1.5 text-micro tabular-nums text-muted">
                    ≈ {formatCurrency(property.balanceUsd / m)}/mo
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="text-small font-semibold text-ink">Proposed schedule</h3>
              <ul className="mt-2 divide-y divide-line rounded-md border border-line bg-surface/50">
                {schedule.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-small"
                  >
                    <span className="inline-flex items-center gap-2 text-muted">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Installment {i + 1}
                    </span>
                    <span className="text-ink">{formatDate(s.dueDate)}</span>
                    <span className="font-semibold tabular-nums text-ink">
                      {formatCurrency(s.amountUsd)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <Label htmlFor="reason">Why do you need an arrangement?</Label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="A short, honest reason helps the clerk make a decision."
                className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
              />
            </div>

            <Button className="mt-4" size="lg" onClick={submit} leadingIcon={<CheckCircle2 className="h-4 w-4" />}>
              Submit for council review
            </Button>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <Card className="p-5 sm:p-6">
            <h3 className="text-h3 text-ink">Summary</h3>
            <dl className="mt-3 space-y-2 text-small">
              <Row label="Property" value={property.stand} />
              <Row label="Outstanding" value={formatCurrency(property.balanceUsd)} />
              <Row label="Installments" value={`${months} × monthly`} />
              <Row label="Per instalment" value={formatCurrency(property.balanceUsd / months)} />
            </dl>
            <div className="mt-4 flex items-start gap-2 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Once approved, interest pauses on the portion under plan while you keep payments on
                schedule. Miss two in a row and the plan reverts automatically.
              </p>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}
