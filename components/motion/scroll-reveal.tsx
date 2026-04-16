'use client';

// ─────────────────────────────────────────────
// ScrollReveal — IntersectionObserver-driven fade-up.
//
// Adapted from the Synvas `ScrollReveal` primitive:
//   • threshold 0.15
//   • fires once (freezes once revealed)
//   • optional stagger delay in ms
//   • respects prefers-reduced-motion (no animation,
//     content is shown immediately)
// ─────────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ScrollRevealProps {
  children: ReactNode;
  /** Delay in ms before the fade/translate starts. */
  delay?: number;
  /** Distance the element starts offset below its final position. */
  distance?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'footer';
}

export function ScrollReveal({
  children,
  delay = 0,
  distance = 16,
  className,
  as: Tag = 'div',
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const node = ref.current;
    if (!node) return;

    // Respect reduced-motion: reveal immediately, skip IO wiring.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out-expo will-change-[opacity,transform]',
        visible ? 'translate-y-0 opacity-100' : 'opacity-0',
        className,
      )}
      style={{
        transform: visible ? 'translateY(0)' : `translateY(${distance}px)`,
        transitionDelay: visible ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </Tag>
  );
}
