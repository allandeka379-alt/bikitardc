// ─────────────────────────────────────────────
// Shared hero used across the public transparency
// pages (news, meetings, tenders, etc.). Keeps the
// landing's visual language without hard-coding it
// into every page.
// ─────────────────────────────────────────────

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  badge,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-line bg-gradient-to-b from-brand-primary/[0.04] via-white to-surface',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-5 pb-12 pt-24 sm:px-8 sm:pb-14 sm:pt-28 lg:pt-32">
        {eyebrow && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white/70 px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-brand-primary backdrop-blur-sm">
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-brand-primary" />
            {eyebrow}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-h1 text-ink sm:text-[2.25rem] sm:leading-[2.75rem]">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-xl text-body text-muted sm:text-[17px] sm:leading-7">
                {description}
              </p>
            )}
          </div>
          {badge}
        </div>

        {actions && (
          <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </section>
  );
}
