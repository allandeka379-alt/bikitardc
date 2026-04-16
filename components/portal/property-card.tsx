'use client';

// Property card — used on the citizen dashboard.
// Shows address, class, balance (colour-coded),
// next due date and a YTD progress ring.

import { ArrowRight, Building2, Leaf, MapPin, Receipt as ReceiptIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Property, PropertyClass } from '@/mocks/fixtures/properties';
import { tierOf } from '@/mocks/fixtures/properties';
import { BalancePill } from './balance-pill';
import { ProgressRing } from './progress-ring';

const CLASS_ICON: Record<PropertyClass, typeof Building2> = {
  residential: Building2,
  commercial: ReceiptIcon,
  agricultural: Leaf,
};

const CLASS_LABEL: Record<PropertyClass, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  agricultural: 'Agricultural',
};

export function PropertyCard({ property }: { property: Property }) {
  const tier = tierOf(property);
  const Icon = CLASS_ICON[property.classKind];
  const ytdPct =
    property.ytdBilled > 0 ? (property.ytdPaid / property.ytdBilled) * 100 : 100;

  const balanceColor =
    tier === 'clear'
      ? 'text-success'
      : tier === 'overdue'
        ? 'text-danger'
        : 'text-warning';

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-micro text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon className="h-3 w-3" aria-hidden />
              {CLASS_LABEL[property.classKind]}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden />
              {property.ward} ward
            </span>
          </div>
          <h3 className="text-h3 text-ink">{property.stand}</h3>
          <p className="truncate-line text-small text-muted">{property.address}</p>
        </div>
        <ProgressRing value={ytdPct} label={`Year-to-date payment progress: ${Math.round(ytdPct)}%`} />
      </div>

      <div className="mx-5 mt-5 rounded-md border border-line bg-surface/60 px-4 py-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-micro text-muted">Outstanding</div>
            <div className={cn('text-[28px] font-bold leading-8 tabular-nums', balanceColor)}>
              {formatCurrency(property.balanceUsd)}
            </div>
          </div>
          <BalancePill tier={tier} />
        </div>
        <div className="mt-2 text-micro text-muted">
          Next bill due <span className="font-medium text-ink">{formatDate(property.nextDueAt)}</span>
        </div>
      </div>

      <div className="mt-auto flex gap-2 px-5 pb-5 pt-4">
        <Button asChild size="md" className="flex-1" trailingIcon={<ArrowRight className="h-4 w-4" />}>
          <Link href={`/portal/pay/${property.id}`}>
            {property.balanceUsd > 0 ? 'Pay now' : 'Pay ahead'}
          </Link>
        </Button>
        <Button asChild variant="secondary" size="md" className="flex-1">
          <Link href={`/portal/property/${property.id}`}>Details</Link>
        </Button>
      </div>
    </Card>
  );
}
