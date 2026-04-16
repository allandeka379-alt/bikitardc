import {
  FileBadge2,
  FolderLock,
  HardHat,
  Megaphone,
  Receipt,
  Scale,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { LANDING_SERVICES, type ServiceIcon } from '@/mocks/fixtures/services';
import { cn } from '@/lib/cn';

const ICONS: Record<ServiceIcon, LucideIcon> = {
  receipt: Receipt,
  'file-badge': FileBadge2,
  'hard-hat': HardHat,
  megaphone: Megaphone,
  'folder-lock': FolderLock,
  scale: Scale,
};

const ACCENT: Record<string, { bg: string; text: string; ring: string }> = {
  blue:  { bg: 'bg-brand-primary/10',  text: 'text-brand-primary', ring: 'group-hover:ring-brand-primary/30' },
  gold:  { bg: 'bg-brand-accent/15',   text: 'text-[#8a6e13]',     ring: 'group-hover:ring-brand-accent/35' },
  green: { bg: 'bg-success/10',        text: 'text-success',       ring: 'group-hover:ring-success/30' },
  amber: { bg: 'bg-warning/10',        text: 'text-warning',       ring: 'group-hover:ring-warning/30' },
  red:   { bg: 'bg-danger/10',         text: 'text-danger',        ring: 'group-hover:ring-danger/30' },
  sky:   { bg: 'bg-info/10',           text: 'text-info',          ring: 'group-hover:ring-info/30' },
};

export function ServicesGrid() {
  const t = useTranslations('landing.services');

  return (
    <section id="services" className="mx-auto max-w-[1200px] px-5 pt-20 sm:px-8 sm:pt-24">
      <ScrollReveal>
        <div className="mb-10 max-w-2xl">
          <h2 className="text-h2 text-ink sm:text-[2rem] sm:leading-[2.5rem]">{t('title')}</h2>
          <p className="mt-3 text-body text-muted">{t('subtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {LANDING_SERVICES.map((s, i) => {
          const Icon = ICONS[s.icon];
          const a = ACCENT[s.accent];
          const title = t(`${s.i18nKey}.title`);
          const desc = t(`${s.i18nKey}.desc`);

          return (
            <ScrollReveal key={s.id} delay={i * 60}>
              <Link
                href={s.href}
                className={cn(
                  'group relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-line bg-card p-5 ring-1 ring-transparent',
                  'transition-[transform,box-shadow,border-color] duration-base ease-out-expo',
                  'hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-card-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40',
                  a.ring,
                )}
              >
                <span
                  className={cn(
                    'inline-grid h-11 w-11 place-items-center rounded-md transition-transform duration-base ease-out-expo group-hover:scale-105',
                    a.bg,
                    a.text,
                  )}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-body font-semibold text-ink">{title}</h3>
                  <p className="text-small text-muted">{desc}</p>
                </div>
                <div className="mt-auto inline-flex items-center gap-1 text-small font-medium text-brand-primary opacity-0 transition-opacity duration-base ease-out-expo group-hover:opacity-100">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5" />
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
