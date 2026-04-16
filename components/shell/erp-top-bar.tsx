'use client';

import { Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Logo } from '@/components/ui/logo';
import { AuditDrawer } from './audit-drawer';
import { ErpMobileDrawer } from './erp-mobile-drawer';

export function ErpTopBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-[40] border-b border-line bg-card/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md text-ink hover:bg-surface"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/erp/dashboard" className="inline-flex items-center gap-2">
            <Logo showText={false} size={28} />
            <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a6e13]">
              Staff
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NotificationBell preferencesHref="/erp/admin" />
            <AuditDrawer />
          </div>
        </div>
      </header>

      <ErpMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Desktop top bar */}
      <header className="sticky top-0 z-[40] hidden border-b border-line bg-card/80 backdrop-blur lg:block">
        <div className="flex h-[64px] items-center justify-between px-6">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search residents, properties, references…"
              className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-small placeholder:text-muted/70 transition-colors focus:border-brand-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
            />
          </div>
          <div className="flex items-center gap-3">
            <AuditDrawer />
            <LanguageToggle />
            <NotificationBell preferencesHref="/erp/admin" />
          </div>
        </div>
      </header>
    </>
  );
}
