// ─────────────────────────────────────────────
// Button — design-system primitive (spec §5.4)
//
// Variants: primary / secondary / ghost / destructive / gold
// Sizes:    sm / md / lg
// Features: full-width, loading spinner, asChild slot
// Tap targets meet 56px on mobile for payment-method
// style usage (spec §5.4 PaymentMethodCard note).
// ─────────────────────────────────────────────

import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'gold' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-card-sm hover:shadow-card-md',
  secondary:
    'bg-white text-brand-primary border border-line hover:bg-surface hover:border-brand-primary/30',
  ghost:
    'bg-transparent text-brand-primary hover:bg-brand-primary/8',
  destructive:
    'bg-danger text-white hover:bg-danger/90 shadow-card-sm',
  gold:
    'bg-brand-accent text-brand-ink hover:bg-brand-accent/90 shadow-card-sm',
  outline:
    'bg-transparent text-brand-primary border border-brand-primary/40 hover:bg-brand-primary/6',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9  px-3   text-small',
  md: 'h-11 px-5   text-body',
  lg: 'h-14 px-7   text-body font-semibold', // 56px — mobile-friendly
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      disabled,
      fullWidth,
      leadingIcon,
      trailingIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 rounded-md font-medium',
          'transition-[background-color,color,box-shadow,transform] duration-base ease-out-expo',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'disabled:pointer-events-none disabled:opacity-60',
          'active:scale-[0.985]',
          VARIANTS[variant],
          SIZES[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          leadingIcon && <span className="inline-flex" aria-hidden>{leadingIcon}</span>
        )}
        <span>{children}</span>
        {!loading && trailingIcon && (
          <span className="inline-flex" aria-hidden>{trailingIcon}</span>
        )}
      </Comp>
    );
  },
);

Button.displayName = 'Button';
