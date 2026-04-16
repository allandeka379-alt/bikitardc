'use client';

// ─────────────────────────────────────────────
// Payment session store
//
// Holds the in-flight payment between the method
// picker → processing → success screens. Persisted
// so a refresh during the 4s processing stage
// doesn't break the demo.
//
// Generalised in Milestone 4 to support two
// subject types so one payment flow covers both
// rates (Journey A) and application fees (Journey
// B): `subject: { type: 'property' | 'application',
// id: string }`. Downstream consumers branch on
// the type to apply the right side-effect.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentChannel } from '@/mocks/fixtures/transactions';

export type SessionStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'timeout';

export type PaymentSubjectType = 'property' | 'application';

export interface PaymentSubject {
  type: PaymentSubjectType;
  id: string;
  label?: string;
}

export interface PaymentSession {
  subject: PaymentSubject;
  /** Deprecated mirror of subject.id when subject.type === 'property' — kept so
   *  existing code reading session.propertyId still works. */
  propertyId: string;
  amount: number;
  currency: 'USD' | 'ZWG';
  channel: PaymentChannel;
  phone?: string;
  reference: string;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;
  transactionId?: string;
  failureCode?: string;
  /** Optional — where to return after success, if not the default dashboard. */
  returnTo?: string;
}

interface StartInput {
  subject: PaymentSubject;
  amount: number;
  currency: 'USD' | 'ZWG';
  channel: PaymentChannel;
  phone?: string;
  returnTo?: string;
}

interface PaymentState {
  session: PaymentSession | null;
  start: (input: StartInput) => PaymentSession;
  markProcessing: () => void;
  finish: (result: { status: 'succeeded' | 'failed' | 'timeout'; failureCode?: string }) => void;
  /**
   * Force the next payment outcome via the dev toolbar (spec §10.3).
   * null clears the override.
   */
  forceOutcome: 'succeeded' | 'failed' | 'timeout' | null;
  setForceOutcome: (o: 'succeeded' | 'failed' | 'timeout' | null) => void;
  clear: () => void;
}

function genReference(kind: 'property' | 'application'): string {
  const d = new Date();
  const pad = (n: number, l = 2) => n.toString().padStart(l, '0');
  const yyyymmdd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = Math.floor(Math.random() * 900000 + 100000);
  const prefix = kind === 'application' ? 'BRDC-APP-' : 'BRDC-';
  return `${prefix}${yyyymmdd}-${rand}`;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      session: null,
      forceOutcome: null,

      start: ({ subject, amount, currency, channel, phone, returnTo }) => {
        const session: PaymentSession = {
          subject,
          propertyId: subject.type === 'property' ? subject.id : '',
          amount,
          currency,
          channel,
          phone,
          returnTo,
          reference: genReference(subject.type),
          status: 'idle',
          startedAt: new Date().toISOString(),
        };
        set({ session });
        return session;
      },

      markProcessing: () => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, status: 'processing' } });
      },

      finish: ({ status, failureCode }) => {
        const s = get().session;
        if (!s) return;
        set({
          session: {
            ...s,
            status,
            failureCode,
            completedAt: new Date().toISOString(),
            transactionId: `tx_${Math.random().toString(36).slice(2, 10)}`,
          },
        });
      },

      setForceOutcome: (o) => set({ forceOutcome: o }),

      clear: () => set({ session: null }),
    }),
    {
      name: 'bikita-payment',
      // Force-outcome is session-scoped (spec §10.3 dev-toolbar — one-shot
      // override), so don't persist it.
      partialize: (s) => ({ session: s.session }),
    },
  ),
);
