// ─────────────────────────────────────────────
// Building Bikita — infrastructure showcase on
// the landing page. Highlights real works in the
// district (solar traffic lights, new roads,
// solar street-lighting, rural connectivity).
//
// Photos live at /public/building/*. The main two
// images come from Council photography:
//   • solar-traffic-lights.jpg — Kamungoma junction
//   • kamungoma-road.jpg       — new dual carriageway
// ─────────────────────────────────────────────

import { ArrowRight, Sun, Signpost, Zap, Route } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Button } from '@/components/ui/button';

interface Highlight {
  icon: React.ReactNode;
  titleKey: string;
  bodyKey: string;
}

const HIGHLIGHTS: Highlight[] = [
  { icon: <Sun className="h-4 w-4" />,      titleKey: 'h1.title', bodyKey: 'h1.body' },
  { icon: <Signpost className="h-4 w-4" />, titleKey: 'h2.title', bodyKey: 'h2.body' },
  { icon: <Zap className="h-4 w-4" />,      titleKey: 'h3.title', bodyKey: 'h3.body' },
  { icon: <Route className="h-4 w-4" />,    titleKey: 'h4.title', bodyKey: 'h4.body' },
];

export function BuildingBikita() {
  const t = useTranslations('landing.building');

  return (
    <section
      id="building-bikita"
      className="mx-auto mt-20 max-w-[1200px] px-5 sm:mt-28 sm:px-8"
    >
      <ScrollReveal>
        <div className="mb-8 max-w-2xl sm:mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-[#8a6e13]">
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-brand-accent pulse-dot" />
            {t('eyebrow')}
          </div>
          <h2 className="text-h2 text-ink sm:text-[2rem] sm:leading-[2.5rem]">{t('title')}</h2>
          <p className="mt-3 text-body text-muted">{t('subtitle')}</p>
        </div>
      </ScrollReveal>

      {/* Media grid */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Hero photo — solar traffic lights */}
        <ScrollReveal className="md:col-span-3">
          <figure className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-surface shadow-card-sm transition-shadow duration-base ease-out-expo hover:shadow-card-md md:aspect-[5/4]">
            <Image
              src="/building/solar-traffic-lights.jpg"
              alt="Solar-powered traffic lights at the Kamungoma junction, Bikita"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-accent/95 px-3 py-1 text-micro font-bold uppercase tracking-[0.1em] text-brand-ink">
                <Sun className="h-3 w-3" />
                {t('caption1.badge')}
              </div>
              <div className="mt-3 text-h3 font-semibold text-white sm:text-[1.35rem]">
                {t('caption1.title')}
              </div>
              <div className="mt-1 max-w-md text-small text-white/85">
                {t('caption1.body')}
              </div>
            </figcaption>
          </figure>
        </ScrollReveal>

        {/* Side column — road + highlight list */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <ScrollReveal delay={80}>
            <figure className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-surface shadow-card-sm transition-shadow duration-base ease-out-expo hover:shadow-card-md">
              <Image
                src="/building/kamungoma-road.jpg"
                alt="Newly constructed dual carriageway in Bikita with solar street-lighting"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/5 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-primary">
                  <Route className="h-3 w-3" />
                  {t('caption2.badge')}
                </div>
                <div className="mt-2 text-body font-semibold text-white">
                  {t('caption2.title')}
                </div>
                <div className="mt-0.5 text-micro text-white/80">
                  {t('caption2.body')}
                </div>
              </figcaption>
            </figure>
          </ScrollReveal>

          {/* KPI chip */}
          <ScrollReveal delay={150}>
            <div className="rounded-xl border border-line bg-card p-5 shadow-card-sm">
              <div className="text-micro font-semibold uppercase tracking-wider text-muted">
                {t('kpi.label')}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-display font-bold tabular-nums text-brand-primary sm:text-h1">
                  12
                </div>
                <div className="text-small text-muted">{t('kpi.unit')}</div>
              </div>
              <p className="mt-2 text-small text-muted">{t('kpi.body')}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Highlight row */}
      <ScrollReveal delay={120}>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <li
              key={h.titleKey}
              className="flex items-start gap-3 rounded-lg border border-line bg-card p-4 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-sm"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
                {h.icon}
              </span>
              <div className="min-w-0">
                <div className="text-small font-semibold text-ink">{t(h.titleKey)}</div>
                <p className="mt-0.5 text-micro text-muted">{t(h.bodyKey)}</p>
              </div>
            </li>
          ))}
        </ul>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal delay={200}>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-primary/15 bg-brand-primary/5 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <div className="text-body font-semibold text-ink">{t('cta.title')}</div>
            <p className="text-small text-muted">{t('cta.body')}</p>
          </div>
          <Button asChild variant="primary" trailingIcon={<ArrowRight className="h-4 w-4" />}>
            <Link href="/transparency">{t('cta.button')}</Link>
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}
