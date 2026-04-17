'use client';

// ─────────────────────────────────────────────
// Auth store — Zustand with localStorage persist.
//
// The demo's login is cosmetic (spec §10.2). We
// only store the id/email/role of the selected
// demo user so the app can render the right
// shell and greet the user by name.
//
// No tokens, no real credentials, nothing
// sensitive. All state is wiped on logout.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DemoRole, DemoUser } from '@/mocks/fixtures/users';

export interface AuthState {
  userId: string | null;
  email: string | null;
  fullName: string | null;
  role: DemoRole | null;
  /** Set when a dual-role user picks "resident" or "staff" in /choose-role. */
  activeRole: 'resident' | 'clerk' | 'ceo' | null;

  login: (user: DemoUser) => void;
  setActiveRole: (role: 'resident' | 'clerk' | 'ceo') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      fullName: null,
      role: null,
      activeRole: null,

      login: (user) =>
        set({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          activeRole:
            user.role === 'both'     ? null     :
            user.role === 'clerk'    ? 'clerk'  :
            user.role === 'ceo'      ? 'ceo'    :
                                       'resident',
        }),

      setActiveRole: (role) => set({ activeRole: role }),

      logout: () =>
        set({
          userId: null,
          email: null,
          fullName: null,
          role: null,
          activeRole: null,
        }),
    }),
    {
      name: 'bikita-auth',
      // Don't persist the function refs
      partialize: (s) => ({
        userId: s.userId,
        email: s.email,
        fullName: s.fullName,
        role: s.role,
        activeRole: s.activeRole,
      }),
    },
  ),
);
