import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { WARDS } from '@/mocks/fixtures/wards';

export function WardSpotlight() {
  const t = useTranslations('landing.wards');

  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-20 sm:px-8 sm:pt-24">
      <ScrollReveal>
        <div className="mb-10 max-w-2xl">
          <h2 className="text-h2 text-ink sm:text-[2rem] sm:leading-[2.5rem]">{t('title')}</h2>
          <p className="mt-3 text-body text-muted">{t('subtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {WARDS.filter((w) => w.featuredProject).map((w, i) => {
          const p = w.featuredProject!;
          return (
            <ScrollReveal key={w.id} delay={i * 80}>
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
                    {w.name} ward
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-body font-semibold leading-snug text-ink">{p.title}</h3>
                  <p className="text-micro text-muted">{w.councillor}</p>

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
          );
        })}
      </div>
    </section>
  );
}
