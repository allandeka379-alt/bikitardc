'use client';

// ─────────────────────────────────────────────
// Multi-factor authentication state (spec §3.1).
// Resident-side: optional TOTP. Staff-side:
// mandatory (enforced when they try to reach the
// ERP without MFA enrolled).
//
// Demo-only: the secret is fabricated and any
// 6-digit code is accepted except `000000` (per
// spec §9.2).
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MfaEnrolment {
  userId: string;
  secret: string;
  enrolledAt: string;
  /** Last time the user successfully completed an MFA challenge. */
  lastVerifiedAt?: string;
}

interface MfaState {
  items: Record<string, MfaEnrolment>;
  /** Session-scoped: has the current tab cleared an MFA challenge since login? */
  verifiedThisSession: Record<string, boolean>;

  enroll: (userId: string, secret: string) => MfaEnrolment;
  disable: (userId: string) => void;
  markVerified: (userId: string) => void;
  isEnrolled: (userId: string) => boolean;
  reset: () => void;
}

export const useMfaStore = create<MfaState>()(
  persist(
    (set, get) => ({
      items: {},
      verifiedThisSession: {},

      enroll: (userId, secret) => {
        const enrol: MfaEnrolment = {
          userId,
          secret,
          enrolledAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
        };
        set({
          items: { ...get().items, [userId]: enrol },
          verifiedThisSession: { ...get().verifiedThisSession, [userId]: true },
        });
        return enrol;
      },

      disable: (userId) => {
        const { [userId]: _removed, ...rest } = get().items;
        void _removed;
        const { [userId]: _gone, ...verif } = get().verifiedThisSession;
        void _gone;
        set({ items: rest, verifiedThisSession: verif });
      },

      markVerified: (userId) => {
        const existing = get().items[userId];
        const when = new Date().toISOString();
        set({
          items: existing ? { ...get().items, [userId]: { ...existing, lastVerifiedAt: when } } : get().items,
          verifiedThisSession: { ...get().verifiedThisSession, [userId]: true },
        });
      },

      isEnrolled: (userId) => !!get().items[userId],

      reset: () => set({ items: {}, verifiedThisSession: {} }),
    }),
    {
      name: 'bikita-mfa',
      // Session-scoped verification flag is intentionally not persisted so
      // closing the browser forces a re-challenge (mirrors production).
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

/** Picks a stable 16-char base32-like secret for the demo. */
export function newDemoSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let s = '';
  for (let i = 0; i < 16; i += 1) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}
