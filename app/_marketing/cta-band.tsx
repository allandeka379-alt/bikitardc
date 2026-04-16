import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Button } from '@/components/ui/button';

export function CtaBand() {
  const t = useTranslations('landing.cta');

  return (
    <section className="mx-auto mt-14 max-w-[1200px] px-5 sm:mt-20 sm:px-8">
      <ScrollReveal>
        <div className="relative isolate overflow-hidden rounded-xl bg-brand-primary px-6 py-8 shadow-card-lg sm:px-10 sm:py-10">
          {/* Gold accent glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-accent/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-h2 text-white sm:text-[2rem] sm:leading-[2.5rem]">{t('title')}</h2>
              <p className="mt-2 text-body text-white/80">{t('subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                variant="gold"
                className="rounded-full"
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                <Link href="/register">{t('primary')}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/login">{t('secondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
