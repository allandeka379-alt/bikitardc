'use client';

// Tiny hover/focus popover used by statement rows
// to explain charges in plain language.
// Satisfies spec §3.1 charges explainer requirement.

import { Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

interface ExplainPopoverProps {
  text: string;
  className?: string;
}

export function ExplainPopover({ text, className }: ExplainPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-block align-middle', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="What is this charge?"
        aria-expanded={open}
        className="grid h-5 w-5 place-items-center rounded-full text-muted transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-[60] mb-2 w-60 -translate-x-1/2 rounded-md border border-line bg-card px-3 py-2 text-left text-micro leading-snug text-ink shadow-card-md"
        >
          {text}
          <span
            aria-hidden
            className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-line bg-card"
          />
        </span>
      )}
    </span>
  );
}
