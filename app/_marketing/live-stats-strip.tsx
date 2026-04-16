'use client';

// ─────────────────────────────────────────────
// LiveStatsStrip — 4 KPI tiles fed from
// /api/public/stats, polled every 30s so the
// animated counters show subtle live movement.
// Spec §3 transparency and §8.1 live-stats strip.
// ─────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import {
  Banknote,
  FileCheck2,
  Hammer,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Card } from '@/components/ui/card';
import { STATS_POLL_MS } from '@/lib/constants';
import type { PublicStats } from '@/mocks/fixtures/stats';

interface TileDef {
  key: keyof Pick<
    PublicStats,
    'ratesCollectedUsd' | 'requestsResolved' | 'licencesIssuedYtd' | 'activeWardProjects'
  >;
  labelKey: 'collected' | 'resolved' | 'licences' | 'projects';
  Icon: LucideIcon;
  tint: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
}

const TILES: TileDef[] = [
  { key: 'ratesCollectedUsd',  labelKey: 'collected', Icon: Banknote,    tint: 'text-brand-primary bg-brand-primary/8', prefix: '$', compact: true },
  { key: 'requestsResolved',   labelKey: 'resolved',  Icon: ShieldCheck, tint: 'text-success bg-success/10' },
  { key: 'licencesIssuedYtd',  labelKey: 'licences',  Icon: FileCheck2,  tint: 'text-brand-accent bg-brand-accent/15' },
  { key: 'activeWardProjects', labelKey: 'projects',  Icon: Hammer,      tint: 'text-info bg-info/10' },
];

async function fetchStats(): Promise<PublicStats> {
  const res = await fetch('/api/public/stats', { cache: 'no-store' });
  if (!res.ok) throw new Error('stats fetch failed');
  return res.json();
}

export function LiveStatsStrip() {
  const t = useTranslations('landing.stats');
  const locale = useLocale();

  const { data } = useQuery({
    queryKey: ['public-stats'],
    queryFn: fetchStats,
    refetchInterval: STATS_POLL_MS,
    staleTime: STATS_POLL_MS,
  });

  return (
    <section className="relative mx-auto max-w-[1200px] px-5 pt-14 sm:px-8 sm:pt-20">
      <ScrollReveal>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-micro font-semibold uppercase tracking-[0.12em] text-success">
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
              Live
            </div>
            <h2 className="text-h2 text-ink sm:text-[1.75rem] sm:leading-9">{t('title')}</h2>
            <p className="mt-1 max-w-xl text-small text-muted">{t('subtitle')}</p>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {TILES.map(({ key, labelKey, Icon, tint, prefix, suffix, compact }, i) => (
          <ScrollReveal key={key} delay={i * 80}>
            <Card className="group h-full overflow-hidden p-5 hover-lift">
              <div className="flex items-start justify-between">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-md ${tint}`}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-micro font-medium text-success">
                  +{Math.max(1, (i + 1) * 2)}%
                </span>
              </div>
              <div className="mt-4">
                <div className="text-[28px] leading-[36px] font-semibold tracking-tight text-ink sm:text-[32px] sm:leading-[40px]">
                  <AnimatedCounter
                    value={data?.[key] ?? 0}
                    prefix={prefix}
                    suffix={suffix}
                    compact={compact}
                    locale={locale === 'sn' ? 'en-ZW' : 'en-ZW'}
                  />
                </div>
                <div className="mt-1 text-small text-muted">{t(labelKey)}</div>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
