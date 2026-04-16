'use client';

// ─────────────────────────────────────────────
// PortalShell — wraps every page under /portal.
// Sidebar (lg+) + top bar + bottom nav (mobile).
// Also redirects unauthenticated users to /login.
// ─────────────────────────────────────────────

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { PortalBottomNav } from './portal-bottom-nav';
import { PortalSidebar } from './portal-sidebar';
import { PortalTopBar } from './portal-top-bar';

export function PortalShell({ children }: { children: ReactNode }) {
  const { hydrated, userId } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !userId) {
      router.replace('/login?redirect=/portal/dashboard');
    }
  }, [hydrated, userId, router]);

  if (hydrated && !userId) return <PortalShellSkeleton />;

  return (
    <div className="flex min-h-dvh bg-surface">
      <PortalSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopBar />
        <main className="flex-1 pb-[72px] lg:pb-10">{children}</main>
        <PortalBottomNav />
      </div>
    </div>
  );
}

function PortalShellSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-primary" />
    </div>
  );
}
