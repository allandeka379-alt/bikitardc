'use client';

// Minimal toast primitive built on Radix. Supports success/danger/info tones.
// Mounted once by Toaster at the app root.

import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;

type Tone = 'default' | 'success' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  default: 'border-line bg-card text-ink',
  success: 'border-success/30 bg-success/8 text-success',
  danger:  'border-danger/30 bg-danger/8 text-danger',
  info:    'border-brand-primary/30 bg-brand-primary/8 text-brand-primary',
};

interface ToastProps extends Omit<ToastPrimitive.ToastProps, 'title'> {
  tone?: Tone;
  title?: ReactNode;
  description?: ReactNode;
}

export function Toast({ tone = 'default', title, description, className, ...props }: ToastProps) {
  return (
    <ToastPrimitive.Root
      className={cn(
        'relative grid grid-cols-[1fr_auto] items-start gap-4 rounded-md border p-4 pr-6 shadow-card-md',
        'data-[state=open]:animate-slide-up',
        'data-[state=closed]:animate-fade-out',
        TONES[tone],
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        {title && <ToastPrimitive.Title className="text-small font-semibold">{title}</ToastPrimitive.Title>}
        {description && (
          <ToastPrimitive.Description className="mt-1 text-small text-muted">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close
        aria-label="Dismiss"
        className="rounded-sm text-muted transition-colors hover:text-ink"
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}
