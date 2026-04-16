'use client';

// Compact payment-method picker used inline within
// wizards so the citizen doesn't have to leave the
// flow to pay a fee.

import { Check } from 'lucide-react';
import { PAYMENT_METHODS } from '@/mocks/fixtures/payment-methods';
import type { PaymentChannel } from '@/mocks/fixtures/transactions';
import { cn } from '@/lib/cn';

const TINT: Record<string, string> = {
  red:   'bg-[#D81E2E] text-white',
  green: 'bg-[#16A34A] text-white',
  gold:  'bg-[#C9A227] text-brand-ink',
  navy:  'bg-brand-primary text-white',
  blue:  'bg-[#0369A1] text-white',
  slate: 'bg-[#475569] text-white',
};

interface Props {
  value: PaymentChannel;
  onChange: (c: PaymentChannel) => void;
  /** Only show methods marked full demo status. */
  fullOnly?: boolean;
}

export function InlineMethodPicker({ value, onChange, fullOnly = true }: Props) {
  const options = fullOnly
    ? PAYMENT_METHODS.filter((m) => m.demoStatus === 'full')
    : PAYMENT_METHODS;

  return (
    <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-2">
      {options.map((m) => {
        const active = m.channel === value;
        const initials = m.label
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase())
          .join('');
        return (
          <button
            key={m.channel}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m.channel)}
            className={cn(
              'flex min-h-[64px] items-center gap-3 rounded-md border px-4 py-2.5 text-left transition-all duration-base ease-out-expo',
              active
                ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                : 'border-line bg-card hover:border-brand-primary/30 hover:shadow-card-sm',
            )}
          >
            <span
              className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-md text-small font-bold tracking-tight',
                TINT[m.tint],
              )}
              aria-hidden
            >
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-small font-semibold text-ink">{m.label}</span>
              <span className="block truncate-line text-micro text-muted">{m.tagline}</span>
            </span>
            {active ? (
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-primary text-white">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span className="h-5 w-5 shrink-0 rounded-full border border-line" />
            )}
          </button>
        );
      })}
    </div>
  );
}
