'use client';

// Payment method tile for the picker.
// Tap target ≥ 56px on mobile (spec §5.4).

import { Check } from 'lucide-react';
import Image from 'next/image';
import type { PaymentMethod } from '@/mocks/fixtures/payment-methods';
import { cn } from '@/lib/cn';

const BRAND_TINT: Record<PaymentMethod['tint'], { bg: string; text: string }> = {
  red:   { bg: 'bg-[#D81E2E]',  text: 'text-white' },
  green: { bg: 'bg-[#16A34A]',  text: 'text-white' },
  gold:  { bg: 'bg-[#C9A227]',  text: 'text-brand-ink' },
  navy:  { bg: 'bg-brand-primary', text: 'text-white' },
  blue:  { bg: 'bg-[#0369A1]',  text: 'text-white' },
  slate: { bg: 'bg-[#475569]',  text: 'text-white' },
};

interface Props {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (channel: PaymentMethod['channel']) => void;
}

export function PaymentMethodCard({ method, selected, onSelect }: Props) {
  const tint = BRAND_TINT[method.tint];
  const disabled = method.demoStatus === 'visual';

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(method.channel)}
      disabled={disabled}
      className={cn(
        'group relative flex min-h-[72px] w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-base ease-out-expo',
        selected
          ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
          : 'border-line bg-card hover:border-brand-primary/30 hover:shadow-card-sm',
        disabled && 'cursor-not-allowed opacity-55 hover:shadow-none',
      )}
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      {method.logoUrl ? (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-white p-1"
          aria-hidden
        >
          <Image
            src={method.logoUrl}
            alt=""
            width={40}
            height={40}
            className="max-h-full max-w-full object-contain"
          />
        </span>
      ) : (
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-md text-small font-bold tracking-tight',
            tint.bg,
            tint.text,
          )}
          aria-hidden
        >
          {method.label
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join('')}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-small font-semibold text-ink">{method.label}</span>
        <span className="block truncate-line text-micro text-muted">{method.tagline}</span>
      </span>

      {selected ? (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-primary text-white">
          <Check className="h-3 w-3" />
        </span>
      ) : disabled ? (
        <span className="rounded-full bg-surface px-2 py-0.5 text-micro font-medium text-muted">
          Preview
        </span>
      ) : (
        <span className="h-5 w-5 shrink-0 rounded-full border border-line transition-colors group-hover:border-brand-primary" />
      )}
    </button>
  );
}
