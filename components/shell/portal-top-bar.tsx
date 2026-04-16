'use client';

// Mobile + tablet top bar. Only renders under `lg`
// where the sidebar is hidden.

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/cn';
import { PortalMobileDrawer } from './portal-mobile-drawer';

export function PortalTopBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[40] border-b border-line bg-card/90 backdrop-blur lg:hidden',
        )}
      >
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md text-ink hover:bg-surface"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/portal/dashboard"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            <Logo showText={false} size={28} />
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-md text-ink hover:bg-surface"
              aria-label="Search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <NotificationBell preferencesHref="/portal/profile/notifications" />
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-line bg-card animate-slide-down">
            <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                autoFocus
                type="search"
                placeholder="Search properties, payments, applications…"
                className="w-full border-0 bg-transparent text-body placeholder:text-muted/70 focus:outline-none"
              />
            </div>
          </div>
        )}
      </header>

      <PortalMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Desktop top bar — sits above the page content on the right column */}
      <header className="sticky top-0 z-[40] hidden border-b border-line bg-card/80 backdrop-blur lg:block">
        <div className="flex h-[64px] items-center justify-between px-6">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search properties, payments, applications…"
              className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-small placeholder:text-muted/70 transition-colors focus:border-brand-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
            />
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <NotificationBell preferencesHref="/portal/profile/notifications" />
          </div>
        </div>
      </header>
    </>
  );
}
