'use client';

// ─────────────────────────────────────────────
// AnimatedCounter — requestAnimationFrame counter
//
// Adapted from the Synvas `AnimatedCounter`:
//   • starts when element enters viewport (threshold 0.3)
//   • easing: cubic ease-out (1 - pow(1 - t, 3))
//   • locale-aware formatting via Intl
//   • respects prefers-reduced-motion (snaps to final value)
//   • smoothly reanimates when target changes (e.g.
//     polling /api/public/stats every 30s).
// ─────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  locale?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  /** If true, values >= 1000 render as 12.3k / 4.5M. */
  compact?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 1400,
  locale = 'en-ZW',
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  compact = false,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [armed, setArmed] = useState(false);

  // Arm the counter only once — when the element first intersects.
  useEffect(() => {
    if (armed || typeof window === 'undefined') return;
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      setArmed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setArmed(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.3 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [armed, value]);

  // Run the tween — re-runs whenever `value` or `armed` changes.
  useEffect(() => {
    if (!armed) return;

    let frame = 0;
    const start = performance.now();
    const from = display;
    const to = value;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Intentionally omit `display` to avoid re-tweening each frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, armed]);

  const formatted = compact
    ? formatCompact(display, locale, decimals)
    : new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(display);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

function formatCompact(v: number, locale: string, decimals: number): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    minimumFractionDigits: decimals,
    maximumFractionDigits: Math.max(decimals, 1),
  }).format(v);
}
