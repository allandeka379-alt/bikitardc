'use client';

import { BookOpen, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import {
  BYLAWS,
  BYLAW_CATEGORY_LABEL,
  searchBylaws,
  type BylawCategory,
} from '@/mocks/fixtures/bylaws';
import { cn } from '@/lib/cn';

export default function BylawsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BylawCategory | 'all'>('all');

  const list = searchBylaws(query).filter((b) => (category === 'all' ? true : b.category === category));

  const grouped = list.reduce<Record<string, typeof BYLAWS>>((acc, b) => {
    (acc[b.category] ||= []).push(b);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="By-laws library"
        title="The rules that govern Bikita."
        description="Every by-law in force, searchable and linkable. Let the council know if anything is unclear."
        badge={
          <div className="hidden rounded-md border border-line bg-card px-4 py-2.5 sm:block">
            <div className="text-micro text-muted">On the books</div>
            <div className="text-h3 font-bold tabular-nums text-ink">{BYLAWS.length}</div>
          </div>
        }
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                placeholder="Search by title, chapter or keyword…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={cn(
                  'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                  category === 'all'
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-line bg-card text-ink hover:border-brand-primary/30',
                )}
              >
                All
              </button>
              {(Object.keys(BYLAW_CATEGORY_LABEL) as BylawCategory[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                    category === c
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-line bg-card text-ink hover:border-brand-primary/30',
                  )}
                >
                  {BYLAW_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {list.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-8 w-8" />} title="No by-laws match your search." />
        ) : (
          <div className="space-y-8">
            {Object.keys(grouped).map((cat, gi) => (
              <div key={cat}>
                <h2 className="mb-3 text-h3 text-ink">
                  {BYLAW_CATEGORY_LABEL[cat as BylawCategory]}
                </h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {grouped[cat]!.map((b, i) => (
                    <li key={b.id}>
                      <ScrollReveal delay={(gi * 50) + (i * 30)}>
                        <Link href={`/bylaws/${b.slug}`}>
                          <Card className="group h-full p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md">
                            <div className="flex items-start justify-between gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
                                <BookOpen className="h-5 w-5" />
                              </span>
                              {b.scope === 'ward' ? (
                                <Badge tone="gold">Ward</Badge>
                              ) : (
                                <Badge tone="brand">District</Badge>
                              )}
                            </div>
                            <h3 className="mt-4 text-body font-semibold text-ink group-hover:text-brand-primary">
                              {b.title}
                            </h3>
                            <p className="mt-1 text-micro text-muted">{b.chapter}</p>
                            <p className="mt-2 line-clamp-3 text-small text-muted">{b.summary}</p>
                            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-micro text-muted">
                              <span>In force from {formatDate(b.effectiveFrom)}</span>
                              {b.amendedAt && <span>Amended {formatDate(b.amendedAt)}</span>}
                            </div>
                          </Card>
                        </Link>
                      </ScrollReveal>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-md border border-info/20 bg-info/8 p-4 text-small text-info">
          <div className="mb-1 inline-flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-4 w-4" /> Public consultation
          </div>
          <p>
            By-law amendments go through public hearings before adoption. Watch the{' '}
            <Link href="/meetings" className="underline-offset-2 hover:underline">
              meetings calendar
            </Link>{' '}
            for upcoming sittings.
          </p>
        </div>
      </section>
    </>
  );
}
