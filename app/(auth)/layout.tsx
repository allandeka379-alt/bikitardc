// ─────────────────────────────────────────────
// Auth route-group layout
//
// Wraps login / register / choose-role in a common
// centered shell with a minimal header (logo + lang
// toggle) and a split background — surface on the
// left, branded gradient on the right on large
// screens, to echo the council identity without
// overpowering the form.
// ─────────────────────────────────────────────

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Logo } from '@/components/ui/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          aria-label="Home"
        >
          <Logo />
        </Link>
        <LanguageToggle />
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-5 pb-16 sm:px-8">
        {children}
      </main>
    </div>
  );
}
