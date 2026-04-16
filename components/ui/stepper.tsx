// ─────────────────────────────────────────────
// Stepper — horizontal on desktop, vertical on mobile.
// Spec §5.4 lists as required primitive.
// Used by the registration wizard.
// ─────────────────────────────────────────────

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  /** 0-indexed current step. */
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      className={cn(
        'flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-0',
        className,
      )}
      aria-label="Progress"
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.id} className="flex flex-1 items-center">
            <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
              <span
                className={cn(
                  'relative grid h-8 w-8 shrink-0 place-items-center rounded-full border font-semibold text-small',
                  'transition-colors duration-base ease-out-expo',
                  done && 'border-brand-primary bg-brand-primary text-white',
                  active && 'border-brand-primary bg-white text-brand-primary shadow-ring-brand',
                  !done && !active && 'border-line bg-white text-muted',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-small font-medium sm:text-micro',
                  active ? 'text-ink' : done ? 'text-muted' : 'text-muted/70',
                )}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <span
                className={cn(
                  'mx-3 hidden h-px flex-1 sm:block',
                  done ? 'bg-brand-primary' : 'bg-line',
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
