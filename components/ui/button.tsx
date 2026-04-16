// ─────────────────────────────────────────────
// Button — design-system primitive (spec §5.4)
//
// Variants: primary / secondary / ghost / destructive / gold
// Sizes:    sm / md / lg
// Features: full-width, loading spinner, asChild slot
// Tap targets meet 56px on mobile for payment-method
// style usage (spec §5.4 PaymentMethodCard note).
//
// asChild: the Slot primitive requires exactly ONE child.
// When `asChild` is used together with leading/trailing
// icons we clone the single child element and inject the
// icon wrappers into the child's children — preserving the
// single-child contract required by React.Children.only.
// ─────────────────────────────────────────────

import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
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

function renderInner({
  loading,
  leadingIcon,
  trailingIcon,
  children,
}: {
  loading: boolean;
  leadingIcon: ReactNode;
  trailingIcon: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        leadingIcon && (
          <span className="inline-flex" aria-hidden>
            {leadingIcon}
          </span>
        )
      )}
      <span>{children}</span>
      {!loading && trailingIcon && (
        <span className="inline-flex" aria-hidden>
          {trailingIcon}
        </span>
      )}
    </>
  );
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
    const classes = cn(
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
    );

    if (asChild) {
      // Slot requires exactly one child. Clone the single child element and
      // replace its children with our (icon + label + icon) fragment so the
      // outer Slot still sees just one child.
      const only = Children.only(children);
      if (!isValidElement(only)) {
        throw new Error('Button `asChild` requires a single React element as its child.');
      }
      const child = only as ReactElement<{ children?: ReactNode }>;
      const innerContent = renderInner({
        loading,
        leadingIcon,
        trailingIcon,
        children: child.props.children,
      });
      return (
        <Slot ref={ref} className={classes} {...props}>
          {cloneElement(child, undefined, innerContent)}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {renderInner({ loading, leadingIcon, trailingIcon, children })}
      </button>
    );
  },
);

Button.displayName = 'Button';
