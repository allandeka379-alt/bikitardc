'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { useAllNews } from '@/lib/hooks/use-public-content';
import type { NewsCategory } from '@/mocks/fixtures/news';
import { cn } from '@/lib/cn';

const CATEGORY_TONE: Record<NewsCategory, 'brand' | 'info' | 'warning' | 'gold' | 'success'> = {
  notice: 'brand',
  event: 'info',
  alert: 'warning',
  tender: 'gold',
  update: 'success',
};

const CATEGORIES: { id: NewsCategory | 'all'; label: string }[] = [
  { id: 'all',    label: 'All' },
  { id: 'notice', label: 'Notices' },
  { id: 'event',  label: 'Events' },
  { id: 'update', label: 'Updates' },
  { id: 'alert',  label: 'Alerts' },
  { id: 'tender', label: 'Tenders' },
];

export default function NewsListPage() {
  const all = useAllNews();
  const [category, setCategory] = useState<NewsCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = all
    .filter((n) => (category === 'all' ? true : n.category === category))
    .filter((n) =>
      query
        ? (n.title + ' ' + n.summary).toLowerCase().includes(query.toLowerCase())
        : true,
    );

  return (
    <>
      <PageHero
        eyebrow="News & public notices"
        title="Announcements from the council."
        description="Published updates, scheduled events, service alerts and tender notices."
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3">
            <Input
              placeholder="Search notices…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                    category === c.id
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-line bg-card text-ink hover:border-brand-primary/30',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-micro text-muted">
              {filtered.length} of {all.length}
            </span>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState title="No notices match your filter." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <li key={item.id}>
                <ScrollReveal delay={i * 40}>
                  <Link href={`/news/${item.id}`}>
                    <Card className="group flex h-full cursor-pointer flex-col justify-between gap-6 p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone={CATEGORY_TONE[item.category]}>
                            {item.category.toUpperCase()}
                          </Badge>
                          {item.ward && (
                            <span className="text-micro text-muted">Ward {item.ward}</span>
                          )}
                        </div>
                        <h3 className="mt-3 text-body font-semibold leading-snug text-ink group-hover:text-brand-primary">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-small text-muted">{item.summary}</p>
                      </div>
                      <div className="flex items-center justify-between text-micro text-muted">
                        <time dateTime={item.date}>{formatDate(item.date)}</time>
                        <span className="inline-flex items-center gap-1 text-brand-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Read <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
