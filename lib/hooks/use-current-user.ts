'use client';

// Convenience hook: returns the currently-logged-in demo user
// (or null) after hydration. Use this inside portal/erp pages.

import { useAuthStore } from '@/lib/stores/auth';
import { useHydrated } from './use-hydrated';

export function useCurrentUser() {
  const hydrated = useHydrated();
  const userId = useAuthStore((s) => s.userId);
  const fullName = useAuthStore((s) => s.fullName);
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);
  const activeRole = useAuthStore((s) => s.activeRole);
  const logout = useAuthStore((s) => s.logout);

  return {
    hydrated,
    userId: hydrated ? userId : null,
    fullName: hydrated ? fullName : null,
    email: hydrated ? email : null,
    role: hydrated ? role : null,
    activeRole: hydrated ? activeRole : null,
    logout,
  };
}
