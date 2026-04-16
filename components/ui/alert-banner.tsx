'use client';

// Site-wide alert banner. Stacks above the fold on
// every route, dismissible per-user.

import { Siren, TriangleAlert, Info, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useActiveAlerts, useAlertsStore, type AlertTone } from '@/lib/stores/alerts';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import { cn } from '@/lib/cn';

const STYLE: Record<AlertTone, { bar: string; text: string; Icon: typeof Siren }> = {
  emergency: {
    bar: 'bg-danger text-white',
    text: 'text-white/95',
    Icon: Siren,
  },
  'service-disruption': {
    bar: 'bg-warning text-white',
    text: 'text-white/95',
    Icon: TriangleAlert,
  },
  info: {
    bar: 'bg-brand-primary text-white',
    text: 'text-white/95',
    Icon: Info,
  },
};

export function AlertBanner() {
  const hydrated = useHydrated();
  const active = useActiveAlerts();
  const dismiss = useAlertsStore((s) => s.dismiss);

  if (!hydrated || active.length === 0) return null;

  return (
    <div className="sticky top-0 z-[46] flex flex-col">
      {active.map((a) => {
        const s = STYLE[a.tone];
        return (
          <div
            key={a.id}
            role="alert"
            aria-live={a.tone === 'emergency' ? 'assertive' : 'polite'}
            className={cn('w-full', s.bar)}
          >
            <div className="mx-auto flex max-w-[1200px] items-start gap-3 px-4 py-2 sm:px-8 sm:py-2.5">
              <s.Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-small font-semibold">{a.title}</span>
                  {a.wards.length > 0 && (
                    <span className={cn('text-micro uppercase tracking-wide', s.text)}>
                      {a.wards.join(' · ')}
                    </span>
                  )}
                </div>
                <p className={cn('text-micro leading-snug', s.text)}>{a.body}</p>
              </div>
              {a.href && (
                <Link
                  href={a.href}
                  className="inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-micro font-medium underline-offset-2 hover:underline"
                >
                  Details
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => dismiss(a.id)}
                className="grid h-7 w-7 place-items-center rounded-sm hover:bg-white/10"
                aria-label="Dismiss alert"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
