'use client';

import { CalendarClock, FileText, Gavel } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import { useAllTenders } from '@/lib/hooks/use-public-content';

const STATUS_TONE = {
  open: 'success',
  closed: 'neutral',
  awarded: 'brand',
} as const;

export default function TendersPage() {
  const all = useAllTenders();
  const open = all.filter((t) => t.status === 'open');
  const other = all.filter((t) => t.status !== 'open');

  const totalValue = open.reduce((s, t) => s + t.estimatedValueUsd, 0);

  return (
    <>
      <PageHero
        eyebrow="Active tenders"
        title="Procurement opportunities."
        description="Published under PRAZ compliance. Eligible suppliers may submit bids before the stated closing date."
        badge={
          <div className="hidden rounded-md border border-line bg-card px-4 py-2.5 sm:block">
            <div className="text-micro text-muted">Combined estimated value</div>
            <div className="text-h3 font-bold tabular-nums text-ink">{formatCurrency(totalValue)}</div>
          </div>
        }
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        {open.length === 0 && other.length === 0 ? (
          <EmptyState icon={<Gavel className="h-8 w-8" />} title="No tenders published at the moment." />
        ) : (
          <>
            <h2 className="text-h3 text-ink">Open for bids</h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {open.map((t, i) => (
                <li key={t.id}>
                  <ScrollReveal delay={i * 50}>
                    <Link href={`/tenders/${encodeURIComponent(t.reference)}`}>
                      <Card className="group h-full p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md">
                        <div className="flex items-start justify-between gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-md bg-brand-accent/15 text-[#8a6e13]">
                            <Gavel className="h-5 w-5" />
                          </span>
                          <Badge tone={STATUS_TONE[t.status]} dot>
                            {t.status}
                          </Badge>
                        </div>
                        <h3 className="mt-4 text-body font-semibold text-ink group-hover:text-brand-primary">
                          {t.title}
                        </h3>
                        <p className="mt-1 font-mono text-micro text-muted">{t.reference}</p>
                        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-small">
                          <div>
                            <dt className="text-micro text-muted">Estimated value</dt>
                            <dd className="font-semibold tabular-nums text-ink">
                              {formatCurrency(t.estimatedValueUsd)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-micro text-muted">Closes</dt>
                            <dd className="font-semibold text-ink">
                              {formatDate(t.closingDate)}
                              <span className="ml-1 text-micro text-muted">
                                ({formatRelative(t.closingDate)})
                              </span>
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    </Link>
                  </ScrollReveal>
                </li>
              ))}
            </ul>

            {other.length > 0 && (
              <>
                <h2 className="mt-10 text-h3 text-ink">Closed & awarded</h2>
                <ul className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {other.map((t) => (
                    <li key={t.id}>
                      <Card className="p-5">
                        <Badge tone={STATUS_TONE[t.status]} dot>
                          {t.status}
                        </Badge>
                        <h3 className="mt-3 text-small font-semibold text-ink">{t.title}</h3>
                        <p className="mt-0.5 font-mono text-[10px] text-muted">{t.reference}</p>
                      </Card>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
