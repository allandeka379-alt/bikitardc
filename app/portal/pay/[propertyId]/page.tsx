'use client';

// ─────────────────────────────────────────────
// Payment — Step 1 of 3 (method picker + amount).
// Spec §7.1 Journey A.
// ─────────────────────────────────────────────

import { ArrowLeft, ArrowRight, Info, Phone } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PaymentMethodCard } from '@/components/portal/payment-method-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { usePaymentStore } from '@/lib/stores/payment';
import { usePropertyWithOverrides } from '@/lib/stores/demo';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';
import { FX_RATES, PAYMENT_METHODS, sourceForUsd } from '@/mocks/fixtures/payment-methods';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import type { PaymentChannel } from '@/mocks/fixtures/transactions';

const ZWG_PER_USD = 27.8; // demo-only FX rate for dual-currency display

export default function PaymentPickerPage() {
  const params = useParams<{ propertyId: string }>();
  const router = useRouter();
  const { hydrated, userId } = useCurrentUser();
  const property = usePropertyWithOverrides(params.propertyId);
  const start = usePaymentStore((s) => s.start);

  const [channel, setChannel] = useState<PaymentChannel>('ecocash');
  const [amount, setAmount] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'ZWG'>('USD');
  const [customAmount, setCustomAmount] = useState(false);

  const method = useMemo(() => PAYMENT_METHODS.find((m) => m.channel === channel)!, [channel]);

  useEffect(() => {
    if (!hydrated) return;
    if (property) {
      // Pre-fill to outstanding balance (spec §7.1 Journey A step 6)
      setAmount(property.balanceUsd > 0 ? property.balanceUsd.toFixed(2) : '');
    }
    const me = DEMO_USERS.find((u) => u.id === userId);
    if (me?.phone) setPhone(me.phone);
  }, [hydrated, property, userId]);

  if (!hydrated) return null;
  if (!property) return notFound();

  const amountNum = Number(amount) || 0;
  const amountInZwg = amountNum * ZWG_PER_USD;

  const validate = () => {
    if (amountNum < 1) {
      toast({ title: 'Minimum payment is $1.00.', tone: 'danger' });
      return false;
    }
    if (amountNum > 10_000) {
      toast({ title: 'Maximum payment is $10,000.', tone: 'danger' });
      return false;
    }
    if (method.needsPhone && !/^[\+\d\s]{7,}$/.test(phone)) {
      toast({ title: 'Enter a valid mobile number.', tone: 'danger' });
      return false;
    }
    return true;
  };

  const handlePay = () => {
    if (!validate()) return;
    start({
      subject: { type: 'property', id: property.id, label: property.stand },
      amount: amountNum,
      currency,
      channel,
      phone: method.needsPhone ? phone : undefined,
    });
    router.push('/portal/pay/processing');
  };

  const setQuick = (frac: number | 'custom') => {
    if (frac === 'custom') {
      setCustomAmount(true);
      return;
    }
    setCustomAmount(false);
    setAmount((property.balanceUsd * frac).toFixed(2));
  };

  return (
    <div className="mx-auto max-w-[920px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href={`/portal/property/${property.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to property
      </Link>

      <h1 className="text-h1 text-ink">Pay rates</h1>
      <p className="mt-1 text-small text-muted">
        {property.stand} · {property.address}
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Amount */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-h3 text-ink">Amount</h2>
            <p className="mt-1 text-small text-muted">
              Outstanding balance is{' '}
              <span className="font-semibold tabular-nums text-ink">
                {formatCurrency(property.balanceUsd)}
              </span>
              .
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: 'Full balance', frac: 1 },
                { label: 'Half', frac: 0.5 },
              ].map(({ label, frac }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setQuick(frac)}
                  disabled={property.balanceUsd === 0}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-small font-medium transition-colors',
                    !customAmount && Number(amount).toFixed(2) === (property.balanceUsd * frac).toFixed(2)
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    property.balanceUsd === 0 && 'opacity-50',
                  )}
                >
                  {label}
                  {property.balanceUsd > 0 && (
                    <span className="ml-1.5 text-micro tabular-nums text-muted">
                      {formatCurrency(property.balanceUsd * frac)}
                    </span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setQuick('custom')}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-small font-medium transition-colors',
                  customAmount
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-line bg-card text-ink hover:border-brand-primary/30',
                )}
              >
                Custom
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]">
              <div>
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={1}
                  max={10_000}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setCustomAmount(true);
                  }}
                  className="text-[22px] font-bold tabular-nums"
                />
                <p className="mt-1 text-micro text-muted">
                  ≈ ZWG {amountInZwg.toLocaleString(undefined, { maximumFractionDigits: 0 })} at today's rate
                </p>
              </div>
              <div>
                <Label>Currency</Label>
                <div className="flex rounded-md border border-line bg-card p-0.5">
                  {(['USD', 'ZWG'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'flex-1 rounded-sm py-1.5 text-small font-medium transition-colors',
                        currency === c
                          ? 'bg-brand-primary text-white shadow-card-sm'
                          : 'text-muted hover:text-ink',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Methods */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-h3 text-ink">How would you like to pay?</h2>
            <p className="mt-1 text-small text-muted">
              Pick any mobile wallet, card or bank transfer.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <PaymentMethodCard
                  key={m.channel}
                  method={m}
                  selected={channel === m.channel}
                  onSelect={setChannel}
                />
              ))}
            </div>

            {method.needsPhone && (
              <div className="mt-5 border-t border-line pt-5">
                <Label htmlFor="phone">Mobile wallet number</Label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden
                  />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+263 77 123 4567"
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-micro text-muted">
                  <Info className="h-3 w-3" />
                  You'll receive a USSD prompt on this number.
                </p>
              </div>
            )}

            {method.isDiaspora && method.sourceCurrency && amountNum > 0 && (
              <div className="mt-4 rounded-md border border-brand-accent/30 bg-brand-accent/5 p-4">
                <div className="mb-2 inline-flex items-center gap-1.5 text-small font-semibold text-[#8a6e13]">
                  <Info className="h-4 w-4" />
                  FX preview
                </div>
                <div className="grid gap-3 text-small sm:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <div className="text-micro text-muted">You send</div>
                    <div className="text-h3 font-bold tabular-nums text-ink">
                      {sourceForUsd(amountNum, method.sourceCurrency).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: method.sourceCurrency,
                      })}
                    </div>
                  </div>
                  <div className="hidden text-muted sm:block">→</div>
                  <div className="text-right sm:text-left">
                    <div className="text-micro text-muted">Council receives</div>
                    <div className="text-h3 font-bold tabular-nums text-ink">
                      {formatCurrency(amountNum, 'USD')}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-micro text-muted">
                  Rate: 1 {method.sourceCurrency} ≈ ${FX_RATES[method.sourceCurrency].toFixed(3)} USD ·
                  includes a 2% diaspora fee.
                </div>
              </div>
            )}

            {method.demoStatus === 'visual' && !method.isDiaspora && (
              <div className="mt-4 rounded-md border border-dashed border-brand-primary/25 bg-brand-primary/5 p-3 text-micro text-brand-primary">
                This payment method is visual-only in the demo. Pick EcoCash, OneMoney, InnBucks or Paynow to simulate a full end-to-end payment.
              </div>
            )}
          </Card>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-[80px] lg:self-start">
          <Card className="p-5">
            <h3 className="text-h3 text-ink">Summary</h3>
            <dl className="mt-4 space-y-2.5 text-small">
              <Row label="Property" value={property.stand} />
              <Row label="Ward" value={property.ward} />
              <Row
                label="Method"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    {method.label}
                    <Badge tone={method.demoStatus === 'full' ? 'success' : 'warning'}>
                      {method.demoStatus === 'full' ? 'Live demo' : 'Preview'}
                    </Badge>
                  </span>
                }
              />
              <Row label="Currency" value={currency} />
              <div className="my-2 h-px bg-line" />
              <Row
                label="Amount"
                valueClassName="text-[22px] font-bold tabular-nums text-ink"
                value={formatCurrency(amountNum, currency)}
              />
            </dl>

            <Button
              size="lg"
              fullWidth
              className="mt-5"
              onClick={handlePay}
              trailingIcon={<ArrowRight className="h-4 w-4" />}
              disabled={amountNum < 1}
            >
              Pay {formatCurrency(amountNum, currency)}
            </Button>
            <p className="mt-3 text-micro text-muted">
              By continuing, you agree to the council's terms of use. This is a demo — no real money moves.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn('text-right font-medium text-ink', valueClassName)}>{value}</dd>
    </div>
  );
}
