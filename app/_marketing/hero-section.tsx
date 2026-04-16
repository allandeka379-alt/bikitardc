import { ArrowRight, Check, Globe2, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { RotatingText } from '@/components/motion/rotating-text';
import { Button } from '@/components/ui/button';

const ROTATING_KEYS = ['0', '1', '2', '3', '4'] as const;

export function HeroSection() {
  const t = useTranslations('landing.hero');
  const phrases = ROTATING_KEYS.map((k) => t(`rotating.${k}`));

  return (
    <section className="relative isolate overflow-hidden pt-[64px]">
      {/* Background photo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=75&auto=format&fit=crop"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Light readability gradient — keeps text on the left legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-surface" />
        <div className="absolute inset-0 bg-grain opacity-40 mix-blend-multiply" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pt-14 pb-24 sm:px-8 sm:pt-20 sm:pb-32 lg:pt-28 lg:pb-40">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white/80 px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-brand-primary backdrop-blur-sm">
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
            {t('eyebrow')}
          </div>

          {/* Headline */}
          <h1 className="text-display text-ink">
            <span className="block">{t('headline')}</span>
            <span className="block text-gradient-brand">
              <RotatingText
                phrases={phrases}
                intervalMs={2500}
                className="min-h-[1em]"
              />
            </span>
            <span className="mt-2 block text-h1 font-semibold text-ink/80 sm:text-display sm:font-bold">
              {t('headlineAccent')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl text-body text-muted sm:text-[18px] sm:leading-7">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href="/login">{t('ctaPrimary')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link href="#services">{t('ctaSecondary')}</Link>
            </Button>
          </div>

          {/* Trust bullets */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-small text-muted">
            <Bullet icon={<Check className="h-3.5 w-3.5 text-success" />}>{t('trustNoAccount')}</Bullet>
            <Bullet icon={<WifiOff className="h-3.5 w-3.5 text-brand-primary" />}>{t('trustOffline')}</Bullet>
            <Bullet icon={<Globe2 className="h-3.5 w-3.5 text-brand-accent" />}>{t('trustBilingual')}</Bullet>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Bullet({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span aria-hidden>{icon}</span>
      <span>{children}</span>
    </li>
  );
}
