// ─────────────────────────────────────────────
// Visit Bikita — tourism preview strip on the
// landing page. Shows a hand-picked selection of
// the district's top attractions so visitors see
// the "what is Bikita?" story even before they
// open the full /tourism page.
//
// The card style mirrors WardSpotlight /
// BuildingBikita so all three sections feel like
// one gallery.
// ─────────────────────────────────────────────

import { ArrowRight, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ATTRACTIONS, ATTRACTION_LABEL } from '@/mocks/fixtures/tourism';

// Curate the 6 most recognisable attractions for
// the landing strip — the full 10 stay on /tourism.
const FEATURED_IDS = [
  'a_siya_dam',
  'a_chibvumani',
  'a_nerumedzo',
  'a_chingoma',
  'a_hanyanya',
  'a_devure_ranch',
] as const;

export function VisitBikita() {
  const t = useTranslations('landing.visit');
  const featured = FEATURED_IDS
    .map((id) => ATTRACTIONS.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <section className="mx-auto mt-12 max-w-[1200px] px-5 sm:mt-16 sm:px-8">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-h2 text-ink sm:text-[2rem] sm:leading-[2.5rem]">{t('title')}</h2>
            <p className="mt-3 text-body text-muted">{t('subtitle')}</p>
          </div>
          <Button asChild variant="secondary" trailingIcon={<ArrowRight className="h-4 w-4" />}>
            <Link href="/tourism">{t('cta')}</Link>
          </Button>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((a, i) => (
          <ScrollReveal key={a.id} delay={i * 70}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-card-sm transition-shadow duration-base ease-out-expo hover:shadow-card-md">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
                <Image
                  src={a.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-micro font-semibold text-brand-primary shadow-card-sm">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {a.ward}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Badge tone="brand">{ATTRACTION_LABEL[a.kind]}</Badge>
                <h3 className="text-body font-semibold leading-snug text-ink">{a.name}</h3>
                <p className="text-micro text-muted">{a.blurb}</p>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
