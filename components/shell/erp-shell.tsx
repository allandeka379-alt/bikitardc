'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { ErpSidebar } from './erp-sidebar';
import { ErpTopBar } from './erp-top-bar';

export function ErpShell({ children }: { children: ReactNode }) {
  const { hydrated, userId, role, activeRole } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!userId) {
      router.replace('/login?redirect=/erp/dashboard');
      return;
    }
    // Allow: staff (clerk, or dual-role acting as clerk) AND the CEO (who
    // drills into /erp/... detail pages from the executive dashboard).
    // Residents get routed back to their portal.
    const isStaff = role === 'clerk' || (role === 'both' && activeRole === 'clerk');
    const isCeo = role === 'ceo';
    if (!isStaff && !isCeo) {
      router.replace('/portal/dashboard');
    }
  }, [hydrated, userId, role, activeRole, router]);

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-surface">
      <ErpSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ErpTopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
