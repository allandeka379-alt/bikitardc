// Bikita RDC mark — placeholder crest in Council Blue + Gold.
// Swap for the real council crest when brand assets arrive
// (open question #1 in spec §12).

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
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Shield silhouette */}
        <path
          d="M20 2.5 4.5 8.5v11.4c0 8.3 6.1 14.9 15.5 17.6 9.4-2.7 15.5-9.3 15.5-17.6V8.5L20 2.5Z"
          fill="#1F3A68"
        />
        {/* Inner chevron */}
        <path
          d="M20 10.2 8.5 14.2v5.8c0 5.7 4.4 10.4 11.5 12.4 7.1-2 11.5-6.7 11.5-12.4v-5.8L20 10.2Z"
          fill="#FFFFFF"
        />
        {/* Gold star */}
        <path
          d="m20 15.5 1.9 3.8 4.2.6-3 2.9.7 4.2-3.8-2-3.8 2 .7-4.2-3-2.9 4.2-.6 1.9-3.8Z"
          fill="#C9A227"
        />
      </svg>
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
