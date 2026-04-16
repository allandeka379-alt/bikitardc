'use client';

// ─────────────────────────────────────────────
// RotatingText — cycles through a list of strings
// with a subtle slide-up + fade transition.
//
// Adapted from the Synvas hero's rotating phrases:
//   • 2.5s between rotations (tunable)
//   • 300ms fade-out → change → 300ms fade-in
//   • respects prefers-reduced-motion (no cycling)
// ─────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

interface RotatingTextProps {
  phrases: readonly string[];
  intervalMs?: number;
  transitionMs?: number;
  className?: string;
}

export function RotatingText({
  phrases,
  intervalMs = 2500,
  transitionMs = 300,
  className,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (phrases.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, transitionMs);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [phrases.length, intervalMs, transitionMs]);

  return (
    <span
      className={cn(
        'inline-block transition-[opacity,transform] ease-out-expo will-change-[opacity,transform]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[0.3em] opacity-0',
        className,
      )}
      style={{ transitionDuration: `${transitionMs}ms` }}
      aria-live="polite"
    >
      {phrases[index]}
    </span>
  );
}
