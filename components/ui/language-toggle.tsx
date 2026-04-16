'use client';

// ─────────────────────────────────────────────
// LanguageToggle — segmented EN/SN control.
// Persists selection via the `bikita-locale` cookie
// (read by i18n.ts at request time) and triggers a
// router refresh so next-intl reloads messages.
// Spec §5.4.
// ─────────────────────────────────────────────

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/cn';

const LOCALES = ['en', 'sn'] as const;
type Locale = (typeof LOCALES)[number];

const LABEL: Record<Locale, string> = { en: 'EN', sn: 'SN' };
const COOKIE = 'bikita-locale';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageToggle({ className }: { className?: string }) {
  const current = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === current) return;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        'inline-flex items-center rounded-full border border-line bg-card p-0.5 shadow-card-sm',
        pending && 'opacity-60',
        className,
      )}
    >
      {LOCALES.map((loc) => {
        const active = loc === current;
        return (
          <button
            key={loc}
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(loc)}
            className={cn(
              'relative h-7 min-w-[40px] rounded-full px-2 text-micro font-semibold tabular-nums',
              'transition-colors duration-fast ease-out-expo',
              active
                ? 'bg-brand-primary text-white shadow-card-sm'
                : 'text-muted hover:text-ink',
            )}
          >
            {LABEL[loc]}
          </button>
        );
      })}
    </div>
  );
}
