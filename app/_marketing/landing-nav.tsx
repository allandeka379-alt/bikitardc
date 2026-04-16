'use client';

// ─────────────────────────────────────────────
// LandingNav
//
// Scroll-reactive top bar (Synvas pattern, light-themed):
//   • Transparent while at the hero
//   • Translucent white + subtle border after 10px scroll
// Hamburger menu under `lg`. Escape closes it.
// ─────────────────────────────────────────────

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Logo } from '@/components/ui/logo';
import { NAV_SCROLL_THRESHOLD } from '@/lib/constants';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/#services',    labelKey: 'services' },
  { href: '/transparency', labelKey: 'transparency' },
  { href: '/news',         labelKey: 'news' },
] as const;

export function LandingNav() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[45] transition-all duration-slow ease-out-expo',
        scrolled || mobileOpen
          ? 'border-b border-line bg-card/90 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Bikita RDC — home"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <Logo
            size={32}
            showText
            variant={scrolled || mobileOpen ? 'on-light' : 'on-light'}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-2 text-small font-medium text-ink/80 transition-colors hover:text-brand-primary"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link
            href="/login"
            className="rounded-sm px-3 py-2 text-small font-medium text-ink/80 transition-colors hover:text-brand-primary"
          >
            {tc('login')}
          </Link>
          <Button asChild size="sm" variant="primary" className="rounded-full px-5">
            <Link href="/register">{tc('getStarted')}</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-brand-primary/8 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden absolute inset-x-0 top-[64px] border-b border-line bg-card animate-slide-down"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-4 sm:px-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 text-body font-medium text-ink hover:bg-surface"
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-3 text-body font-medium text-ink hover:bg-surface"
            >
              {tc('login')}
            </Link>
            <Button
              asChild
              size="md"
              fullWidth
              className="mt-2 rounded-full"
            >
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                {tc('getStarted')}
              </Link>
            </Button>
            <div className="mt-3 flex justify-end">
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
