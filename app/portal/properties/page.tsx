'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PropertyCard } from '@/components/portal/property-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { usePropertiesForOwner } from '@/lib/stores/demo';
import { useErpStore } from '@/lib/stores/erp';
import { formatRelative } from '@/lib/format';

export default function PropertiesPage() {
  const { hydrated, userId } = useCurrentUser();
  const properties = usePropertiesForOwner(userId);
  const runtimeVerif = useErpStore((s) => s.runtimeVerifications);
  const verifStatus = useErpStore((s) => s.verificationStatus);

  if (!hydrated) return null;

  const myPending = runtimeVerif.filter(
    (v) => v.applicantId === userId && (verifStatus[v.id] ?? v.status) === 'pending',
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">My properties</h1>
            <p className="mt-1 text-small text-muted">
              {properties.length} linked to your account.
            </p>
          </div>
          <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
            <Link href="/portal/properties/link">Link a property</Link>
          </Button>
        </div>
      </ScrollReveal>

      {myPending.length > 0 && (
        <ScrollReveal>
          <Card className="mb-4 p-5">
            <div className="flex items-center gap-2">
              <Badge tone="warning">Pending</Badge>
              <span className="text-small text-muted">
                {myPending.length} link request{myPending.length > 1 ? 's' : ''} awaiting clerk review
              </span>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {myPending.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-small">
                  <div>
                    <div className="font-medium text-ink">{v.reference}</div>
                    <div className="text-micro text-muted">
                      {v.kind.replace('-', ' ')} · submitted {formatRelative(v.submittedAt)}
                    </div>
                  </div>
                  <Badge tone="neutral">48h SLA</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </ScrollReveal>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {properties.map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 70}>
            <PropertyCard property={p} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
