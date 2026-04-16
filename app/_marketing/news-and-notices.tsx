'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { NewsItem } from '@/mocks/fixtures/news';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch('/api/public/news');
  const j = (await res.json()) as { items: NewsItem[] };
  return j.items;
}

const CATEGORY_TONE: Record<NewsItem['category'], 'brand' | 'info' | 'warning' | 'gold' | 'success'> = {
  notice: 'brand',
  event: 'info',
  alert: 'warning',
  tender: 'gold',
  update: 'success',
};

export function NewsAndNotices() {
  const t = useTranslations('landing.news');
  const locale = useLocale() as 'en' | 'sn';
  const { data: items = [] } = useQuery({ queryKey: ['public-news'], queryFn: fetchNews });

  return (
    <section id="news" className="mx-auto max-w-[1200px] px-5 pt-12 sm:px-8 sm:pt-16">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-h2 text-ink sm:text-[2rem] sm:leading-[2.5rem]">{t('title')}</h2>
            <p className="mt-2 max-w-xl text-body text-muted">{t('subtitle')}</p>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 rounded-sm text-small font-medium text-brand-primary hover:underline"
          >
            {t('seeAll')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item, i) => (
          <ScrollReveal key={item.id} delay={i * 60}>
            <Card
              className={cn(
                'group flex h-full cursor-pointer flex-col justify-between gap-6 p-5',
                'transition-[transform,box-shadow] duration-base ease-out-expo',
                'hover:-translate-y-0.5 hover:shadow-card-md',
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={CATEGORY_TONE[item.category]}>{item.category.toUpperCase()}</Badge>
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
                <time dateTime={item.date}>{formatDate(item.date, locale)}</time>
                <span className="inline-flex items-center gap-1 text-brand-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
