'use client';

// ─────────────────────────────────────────────
// HeroCarousel — the landing-page hero cycles
// through a set of service-pitch slides.
//
// All slides live in the DOM simultaneously and
// cross-fade via opacity. The index swap is
// immediate so that clicking a dot never races
// with the auto-advance.
// ─────────────────────────────────────────────

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface HeroSlide {
  key: string;
  render: () => ReactNode;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** How long each slide stays before advancing. */
  intervalMs?: number;
  /** Cross-fade duration. */
  transitionMs?: number;
  className?: string;
}

export function HeroCarousel({
  slides,
  intervalMs = 6000,
  transitionMs = 350,
  className,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  // Re-arm a one-shot timeout on every index change. Using setTimeout (not
  // setInterval) means clicking a dot resets the dwell countdown — the
  // clicked slide gets the full `intervalMs` before the next auto-advance.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || slides.length <= 1) return;

    const id = window.setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);

    return () => window.clearTimeout(id);
  }, [index, slides.length, intervalMs]);

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="relative min-h-[320px] sm:min-h-[340px] lg:min-h-[340px]">
        {slides.map((s, i) => (
          <div
            key={s.key}
            aria-hidden={i !== index}
            className={cn(
              'absolute inset-0 transition-opacity ease-out-expo',
              i === index
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0',
            )}
            style={{ transitionDuration: `${transitionMs}ms` }}
          >
            {s.render()}
          </div>
        ))}
      </div>

      <span className="sr-only" aria-live="polite">
        Slide {index + 1} of {slides.length}
      </span>
    </div>
  );
}
