// ─────────────────────────────────────────────
// Building Bikita — infrastructure project grid
// on the landing page.
//
// Uses the same card style as WardSpotlight so the
// two sections sit side-by-side visually: image on
// top with a ward-style pin chip, title + body
// below, and an accent progress bar when the
// project is in-flight.
// ─────────────────────────────────────────────

import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

interface Project {
  id: string;
  titleKey: string;
  bodyKey: string;
  location: string;
  imageUrl: string;
  progress: number;
}

const PROJECTS: Project[] = [
  {
    id: 'p_solar_traffic_signals',
    titleKey: 'p1.title',
    bodyKey: 'p1.body',
    location: 'Kamungoma',
    imageUrl: '/building/solar-traffic-signal.jpeg',
    progress: 100,
  },
  {
    id: 'p_dam_rehab',
    titleKey: 'p5.title',
    bodyKey: 'p5.body',
    location: 'Nhema / Mupani',
    // Siya Dam (Council photography) — real dam in the district.
    imageUrl: '/tourism/siya-dam.jpg',
    progress: 40,
  },
  {
    id: 'p_signage',
    titleKey: 'p6.title',
    bodyKey: 'p6.body',
    location: 'Corridor upgrades',
    imageUrl: '/building/road-signs-safety.jpg',
    progress: 30,
  },
];

export function BuildingBikita() {
  const t = useTranslations('landing.building');

  return (
    <section
      id="building-bikita"
      className="mx-auto mt-12 max-w-[1200px] px-5 sm:mt-16 sm:px-8"
    >
      <ScrollReveal>
        <div className="mb-6 max-w-2xl">
          <h2 className="text-h2 text-ink sm:text-[2rem] sm:leading-[2.5rem]">{t('title')}</h2>
          <p className="mt-3 text-body text-muted">{t('subtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 80}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-card-sm transition-shadow duration-base ease-out-expo hover:shadow-card-md">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
                <Image
                  src={p.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-micro font-semibold text-brand-primary shadow-card-sm">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {p.location}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-body font-semibold leading-snug text-ink">{t(p.titleKey)}</h3>
                <p className="text-micro text-muted">{t(p.bodyKey)}</p>

                <div className="mt-auto">
                  <div className="mb-1.5 flex items-center justify-between text-micro">
                    <span className="text-muted">{t('progress')}</span>
                    <span className="font-semibold tabular-nums text-ink">{p.progress}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={p.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-surface"
                  >
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-[width] duration-slow ease-out-expo"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
