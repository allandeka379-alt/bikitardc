'use client';

// /portal/pay — property picker when a user hits
// "Pay" from the mobile bottom-nav without a
// specific property in mind.

import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PropertyCard } from '@/components/portal/property-card';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { usePropertiesForOwner } from '@/lib/stores/demo';

export default function PayPickerPage() {
  const { hydrated, userId } = useCurrentUser();
  const properties = usePropertiesForOwner(userId);

  if (!hydrated) return null;

  const owing = properties.filter((p) => p.balanceUsd > 0);
  const paid = properties.filter((p) => p.balanceUsd === 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Which property?</h1>
          <p className="mt-1 text-small text-muted">
            Choose the property you'd like to pay for.
          </p>
        </div>
      </ScrollReveal>

      {owing.length > 0 && (
        <section className="mb-8">
          <ScrollReveal>
            <h2 className="mb-3 text-h3 text-ink">Outstanding</h2>
          </ScrollReveal>
          <div className="grid gap-3 md:grid-cols-2">
            {owing.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 70}>
                <PropertyCard property={p} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {paid.length > 0 && (
        <section>
          <ScrollReveal>
            <h2 className="mb-3 text-h3 text-ink">Paid up</h2>
          </ScrollReveal>
          <div className="grid gap-3 md:grid-cols-2">
            {paid.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 70}>
                <PropertyCard property={p} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {properties.length === 0 && (
        <EmptyState
          title="No properties linked yet."
          description="Link a property by stand number or owner ID to start paying rates online."
        />
      )}
    </div>
  );
}
