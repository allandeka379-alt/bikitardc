// ─────────────────────────────────────────────
// Bikita RDC crest — real council logo.
// PNG source lives at /public/brand/bikita-rdc-logo.png.
// Kept behind this component so downstream callers
// can request variants / sizes without worrying
// about the exact asset path.
// ─────────────────────────────────────────────

import Image from 'next/image';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  /** Size in px for the mark. Text scales proportionally. */
  size?: number;
  showText?: boolean;
  variant?: 'on-light' | 'on-dark';
}

export function Logo({
  className,
  size = 32,
  showText = true,
  variant = 'on-light',
}: LogoProps) {
  const textClass = variant === 'on-light' ? 'text-brand-primary' : 'text-white';
  const subClass = variant === 'on-light' ? 'text-muted' : 'text-white/70';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/brand/bikita-rdc-logo.png"
        alt="Bikita Rural District Council crest"
        width={size}
        height={size}
        priority
        className="h-auto w-auto object-contain"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="leading-tight">
          <span className={cn('block text-small font-bold tracking-tight', textClass)}>
            Bikita RDC
          </span>
          <span className={cn('block text-micro', subClass)}>Rural District Council</span>
        </span>
      )}
    </span>
  );
}
