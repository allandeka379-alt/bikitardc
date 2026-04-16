import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full rounded-sm bg-card px-3.5 py-2.5 text-body text-ink',
        'border border-line',
        'placeholder:text-muted/70',
        'transition-[border-color,box-shadow] duration-fast ease-out-expo',
        'focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10',
        'disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted',
        invalid &&
          'border-danger focus:border-danger focus:ring-danger/15',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
