'use client';

// Ownership history timeline rendered as a tab on
// the property detail page (spec §3.2).

import { ArrowRightLeft, Crown, FileText, Scissors } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  OWNERSHIP_LABEL,
  ownershipForProperty,
  type OwnershipEventKind,
} from '@/mocks/fixtures/ownership';

const KIND_TONE: Record<OwnershipEventKind, { bg: string; text: string; Icon: typeof Crown }> = {
  'first-registration': { bg: 'bg-brand-primary/10', text: 'text-brand-primary', Icon: FileText },
  transfer:             { bg: 'bg-brand-accent/15',  text: 'text-[#8a6e13]',     Icon: ArrowRightLeft },
  inheritance:          { bg: 'bg-success/10',       text: 'text-success',       Icon: Crown },
  subdivision:          { bg: 'bg-info/10',          text: 'text-info',          Icon: Scissors },
};

export function OwnershipTab({ propertyId, propertyStand }: { propertyId: string; propertyStand: string }) {
  const events = ownershipForProperty(propertyId);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Card className="p-5 sm:p-6">
        <h2 className="text-h3 text-ink">Ownership history</h2>
        <p className="mt-1 text-small text-muted">
          Every registered change on the title since the stand was first registered. Amounts shown are
          recorded on the deed; current market value may differ.
        </p>

        {events.length === 0 ? (
          <EmptyState className="mt-4" title="No ownership record on file yet." />
        ) : (
          <ol className="mt-5 flex flex-col gap-4 pl-6">
            {events.map((e, i) => {
              const tone = KIND_TONE[e.kind];
              return (
                <li key={e.id} className="relative">
                  {i < events.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[-1.1rem] top-6 h-[calc(100%+1rem)] w-px bg-line"
                    />
                  )}
                  <span
                    aria-hidden
                    className={`absolute left-[-1.6rem] top-0.5 grid h-6 w-6 place-items-center rounded-full ${tone.bg} ${tone.text}`}
                  >
                    <tone.Icon className="h-3 w-3" />
                  </span>

                  <div className="rounded-md border border-line bg-card px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-body font-semibold text-ink">{OWNERSHIP_LABEL[e.kind]}</span>
                        {e.reference && (
                          <span className="font-mono text-[10px] text-muted">{e.reference}</span>
                        )}
                      </div>
                      <time className="text-micro text-muted">{formatDate(e.at)}</time>
                    </div>
                    <div className="mt-1 text-small text-ink">
                      <span className="text-muted">{e.from}</span>{' '}
                      <span className="text-muted">→</span>{' '}
                      <span className="font-medium text-ink">{e.to}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {typeof e.priceUsd === 'number' && (
                        <Badge tone="brand">Sale at {formatCurrency(e.priceUsd)}</Badge>
                      )}
                      {e.note && <p className="text-micro text-muted">{e.note}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-5">
          <h3 className="text-h3 text-ink">Transfer ownership</h3>
          <p className="mt-1 text-small text-muted">
            Selling or gifting this stand? Propose a transfer — the council reviews and records it on the
            timeline when the deed is lodged.
          </p>
          <Button asChild className="mt-4" size="md">
            <Link href={`/portal/property/${propertyId}/transfer`}>Start transfer for {propertyStand}</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
