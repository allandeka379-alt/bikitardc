'use client';

// ─────────────────────────────────────────────
// Landing hero — service-pitch carousel.
//
// The hero now rotates through a set of service
// pitches (pay / apply / report / receipts /
// transparency). Each slide owns its own visual
// treatment:
//   • "Pay" — headline + inner RotatingText that
//     cycles through wallet names + a row of the
//     real payment-method logos.
//   • "Apply" — headline + licence-type chips.
//   • "Report" — headline + category icons.
//   • "Documents" — headline + receipt / QR /
//     certificate pill row.
//   • "Track" — headline + live-balance preview.
//
// The old eyebrow badge was removed per council
// feedback; the headline carousel sits higher on
// the canvas.
// ─────────────────────────────────────────────

import {
  ArrowRight,
  Camera,
  Check,
  Droplets,
  FileBadge2,
  Landmark,
  Leaf,
  LineChart,
  MapPin,
  QrCode,
  Receipt,
  Trash2,
  TrafficCone,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { HeroCarousel, type HeroSlide } from '@/components/motion/hero-carousel';
import { RotatingText } from '@/components/motion/rotating-text';
import { Button } from '@/components/ui/button';

const WALLETS = [
  { name: 'EcoCash',      src: '/payments/ecocash.png' },
  { name: 'OneMoney',     src: '/payments/onemoney.png' },
  { name: 'Paynow',       src: '/payments/paynow.webp' },
  { name: 'Telecash',     src: '/payments/telecash.png' },
  { name: 'Mastercard',   src: '/payments/mastercard.png' },
  { name: 'Visa',         src: '/payments/visa.svg' },
  { name: 'ZimSwitch',    src: '/payments/zimswitch.jpg' },
];

export function HeroSection() {
  const t = useTranslations('landing.hero');

  const slides: HeroSlide[] = [
    {
      key: 'pay',
      render: () => (
        <>
          <h1 className="text-display text-ink">
            {t('pay.line1')}{' '}
            <span className="block text-gradient-brand sm:inline">
              <RotatingText
                phrases={WALLETS.map((w) => w.name)}
                intervalMs={1200}
                className="min-h-[1em]"
              />
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-body text-muted sm:text-[18px] sm:leading-7">
            {t('pay.body')}
          </p>
          <WalletStrip />
        </>
      ),
    },
    {
      key: 'apply',
      render: () => (
        <>
          <h1 className="text-display text-ink">
            <span className="block">{t('apply.line1')}</span>
            <span className="block text-gradient-brand">{t('apply.line2')}</span>
          </h1>
          <p className="mt-5 max-w-xl text-body text-muted sm:text-[18px] sm:leading-7">
            {t('apply.body')}
          </p>
          <ChipRow
            items={[
              { icon: <Landmark className="h-3.5 w-3.5" />,   label: t('apply.chips.business') },
              { icon: <MapPin className="h-3.5 w-3.5" />,     label: t('apply.chips.building') },
              { icon: <Leaf className="h-3.5 w-3.5" />,       label: t('apply.chips.trade') },
              { icon: <Check className="h-3.5 w-3.5" />,      label: t('apply.chips.clearance') },
            ]}
          />
        </>
      ),
    },
    {
      key: 'report',
      render: () => (
        <>
          <h1 className="text-display text-ink">
            <span className="block">{t('report.line1')}</span>
            <span className="block text-gradient-brand">{t('report.line2')}</span>
          </h1>
          <p className="mt-5 max-w-xl text-body text-muted sm:text-[18px] sm:leading-7">
            {t('report.body')}
          </p>
          <ChipRow
            items={[
              { icon: <Droplets className="h-3.5 w-3.5" />,     label: t('report.chips.water') },
              { icon: <TrafficCone className="h-3.5 w-3.5" />,  label: t('report.chips.road') },
              { icon: <Trash2 className="h-3.5 w-3.5" />,       label: t('report.chips.refuse') },
              { icon: <Zap className="h-3.5 w-3.5" />,          label: t('report.chips.power') },
              { icon: <Camera className="h-3.5 w-3.5" />,       label: t('report.chips.photo') },
            ]}
          />
        </>
      ),
    },
    {
      key: 'documents',
      render: () => (
        <>
          <h1 className="text-display text-ink">
            <span className="block">{t('documents.line1')}</span>
            <span className="block text-gradient-brand">{t('documents.line2')}</span>
          </h1>
          <p className="mt-5 max-w-xl text-body text-muted sm:text-[18px] sm:leading-7">
            {t('documents.body')}
          </p>
          <ChipRow
            items={[
              { icon: <Receipt className="h-3.5 w-3.5" />,    label: t('documents.chips.receipts') },
              { icon: <FileBadge2 className="h-3.5 w-3.5" />, label: t('documents.chips.certs') },
              { icon: <QrCode className="h-3.5 w-3.5" />,     label: t('documents.chips.qr') },
            ]}
          />
        </>
      ),
    },
    {
      key: 'track',
      render: () => (
        <>
          <h1 className="text-display text-ink">
            <span className="block">{t('track.line1')}</span>
            <span className="block text-gradient-brand">{t('track.line2')}</span>
          </h1>
          <p className="mt-5 max-w-xl text-body text-muted sm:text-[18px] sm:leading-7">
            {t('track.body')}
          </p>
          <ChipRow
            items={[
              { icon: <LineChart className="h-3.5 w-3.5" />, label: t('track.chips.live') },
              { icon: <Check className="h-3.5 w-3.5" />,     label: t('track.chips.realtime') },
            ]}
          />
        </>
      ),
    },
  ];

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
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-surface" />
        <div className="absolute inset-0 bg-grain opacity-40 mix-blend-multiply" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pb-24 pt-8 sm:px-8 sm:pb-32 sm:pt-12 lg:pb-40 lg:pt-16">
        <div className="max-w-2xl">
          <HeroCarousel slides={slides} intervalMs={6000} />

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              <Link href="/login">{t('ctaPrimary')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link href="#services">{t('ctaSecondary')}</Link>
            </Button>
          </div>

          {/* Trust bullets */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-small text-muted">
            <Bullet>{t('trustNoAccount')}</Bullet>
            <Bullet>{t('trustOffline')}</Bullet>
            <Bullet>{t('trustBilingual')}</Bullet>
          </ul>
        </div>
      </div>
    </section>
  );
}

function WalletStrip() {
  return (
    <ul className="mt-6 flex flex-wrap items-center gap-2.5">
      {WALLETS.map((w) => (
        <li
          key={w.name}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white/90 px-2.5 py-1 shadow-card-sm backdrop-blur-sm"
        >
          <span
            className="relative grid h-6 w-6 place-items-center overflow-hidden rounded-md bg-white"
            aria-hidden
          >
            <Image
              src={w.src}
              alt=""
              width={24}
              height={24}
              className="max-h-full max-w-full object-contain"
            />
          </span>
          <span className="text-micro font-semibold text-ink">{w.name}</span>
        </li>
      ))}
    </ul>
  );
}

function ChipRow({
  items,
}: {
  items: { icon: React.ReactNode; label: string }[];
}) {
  return (
    <ul className="mt-6 flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <li
          key={it.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-3 py-1.5 text-small font-medium text-ink shadow-card-sm backdrop-blur-sm"
        >
          <span className="text-brand-primary" aria-hidden>
            {it.icon}
          </span>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-success" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
