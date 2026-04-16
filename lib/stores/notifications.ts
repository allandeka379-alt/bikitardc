'use client';

// ─────────────────────────────────────────────
// Notifications store
//
// Seeded with demo notifications per user. New
// notifications are appended by payment / wizard /
// request flows through `push()`.
//
// Preferences matrix: event × channel (app / sms
// / whatsapp / email) — spec §3.1 "Granular
// preferences per channel per event type".
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type LucideIcon,
  Banknote,
  Bell,
  CalendarClock,
  FileBadge2,
  LifeBuoy,
  Megaphone,
  ShieldAlert,
  TriangleAlert,
  Wrench,
} from 'lucide-react';

export type NotificationEvent =
  | 'bill-ready'
  | 'payment-success'
  | 'due-soon'
  | 'application-stage'
  | 'request-update'
  | 'council-meeting'
  | 'by-law-change'
  | 'emergency'
  | 'service-disruption';

export type NotificationChannel = 'app' | 'sms' | 'whatsapp' | 'email';

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  event: NotificationEvent;
  tone: NotificationTone;
  href?: string;
  createdAt: string;
  readAt?: string;
  /** Channels this notification was delivered over (for UI hints). */
  channels: NotificationChannel[];
}

// Metadata each event gets rendered with.
export const EVENT_META: Record<
  NotificationEvent,
  { label: string; Icon: LucideIcon }
> = {
  'bill-ready':        { label: 'Bill ready',          Icon: Banknote },
  'payment-success':   { label: 'Payment confirmation', Icon: Banknote },
  'due-soon':          { label: 'Due-date reminder',   Icon: CalendarClock },
  'application-stage': { label: 'Application update',  Icon: FileBadge2 },
  'request-update':    { label: 'Service request',     Icon: LifeBuoy },
  'council-meeting':   { label: 'Council meeting',     Icon: Megaphone },
  'by-law-change':     { label: 'By-law change',       Icon: Wrench },
  'emergency':         { label: 'Emergency alert',     Icon: ShieldAlert },
  'service-disruption': { label: 'Service disruption', Icon: TriangleAlert },
};

/** Defaults applied to new users — a best guess. */
const DEFAULT_PREFS: Record<NotificationEvent, Record<NotificationChannel, boolean>> = {
  'bill-ready':        { app: true,  sms: true,  whatsapp: true,  email: false },
  'payment-success':   { app: true,  sms: true,  whatsapp: true,  email: false },
  'due-soon':          { app: true,  sms: true,  whatsapp: true,  email: false },
  'application-stage': { app: true,  sms: true,  whatsapp: true,  email: true  },
  'request-update':    { app: true,  sms: true,  whatsapp: true,  email: false },
  'council-meeting':   { app: true,  sms: false, whatsapp: true,  email: false },
  'by-law-change':     { app: true,  sms: false, whatsapp: false, email: true  },
  'emergency':         { app: true,  sms: true,  whatsapp: true,  email: false },
  'service-disruption': { app: true, sms: true,  whatsapp: true,  email: false },
};

interface NotificationState {
  items: NotificationItem[];
  /** ownerId → event → channel → enabled */
  prefs: Record<string, Record<NotificationEvent, Record<NotificationChannel, boolean>>>;

  push: (
    input: Omit<NotificationItem, 'id' | 'createdAt' | 'readAt' | 'channels'> & {
      channels?: NotificationChannel[];
    },
  ) => void;
  markRead: (id: string) => void;
  markAllRead: (ownerId: string) => void;
  clear: (ownerId: string) => void;
  setPref: (
    ownerId: string,
    event: NotificationEvent,
    channel: NotificationChannel,
    enabled: boolean,
  ) => void;
  prefsFor: (ownerId: string) => Record<NotificationEvent, Record<NotificationChannel, boolean>>;
  reset: () => void;
}

function uid() {
  return `n_${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return new Date().toISOString();
}

// Seed — a mix of already-read and unread items so the bell
// has a non-zero badge on first load, and the page has variety.
const SEED: NotificationItem[] = [
  {
    id: 'n_seed_1',
    ownerId: 'u_tendai',
    title: 'April rates bill is ready',
    body: 'Your April 2026 bill for Stand 4521, Nyika is USD 87.50 — due 30 April.',
    event: 'bill-ready',
    tone: 'warning',
    href: '/portal/property/p_4521',
    createdAt: '2026-04-16T07:00:00Z',
    channels: ['app', 'sms', 'whatsapp'],
  },
  {
    id: 'n_seed_2',
    ownerId: 'u_tendai',
    title: 'Council meeting — 18 April',
    body: 'Ordinary council meeting agenda published. Open forum from 17:00.',
    event: 'council-meeting',
    tone: 'info',
    createdAt: '2026-04-14T14:30:00Z',
    readAt: '2026-04-15T09:10:00Z',
    channels: ['app', 'whatsapp'],
  },
  {
    id: 'n_seed_3',
    ownerId: 'u_tendai',
    title: 'Mupani Ward water advisory',
    body: 'Planned water outage on 5 April 06:00–14:00. Store water if needed.',
    event: 'service-disruption',
    tone: 'danger',
    createdAt: '2026-03-28T16:32:00Z',
    readAt: '2026-03-29T08:00:00Z',
    channels: ['app', 'sms', 'whatsapp'],
  },
  {
    id: 'n_seed_4',
    ownerId: 'u_clerk',
    title: 'Verification queue: 3 pending',
    body: 'Oldest item is 4 days old — you have until Thursday to clear the queue.',
    event: 'application-stage',
    tone: 'warning',
    href: '/erp/residents?filter=pending-verifications',
    createdAt: '2026-04-16T07:45:00Z',
    channels: ['app', 'email'],
  },
  {
    id: 'n_seed_5',
    ownerId: 'u_clerk',
    title: 'Reconciliation exceptions',
    body: 'Two EcoCash statement rows are unmatched — please review.',
    event: 'by-law-change',
    tone: 'info',
    href: '/erp/payments/reconcile',
    createdAt: '2026-04-16T08:12:00Z',
    channels: ['app'],
  },
];

export const useNotificationsStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: SEED,
      prefs: {},

      push: ({ channels, ...rest }) => {
        const n: NotificationItem = {
          id: uid(),
          createdAt: now(),
          channels: channels ?? ['app'],
          ...rest,
        };
        set({ items: [n, ...get().items] });
      },

      markRead: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, readAt: i.readAt ?? now() } : i,
          ),
        });
      },

      markAllRead: (ownerId) => {
        const nowIso = now();
        set({
          items: get().items.map((i) =>
            i.ownerId === ownerId && !i.readAt ? { ...i, readAt: nowIso } : i,
          ),
        });
      },

      clear: (ownerId) => {
        set({ items: get().items.filter((i) => i.ownerId !== ownerId) });
      },

      setPref: (ownerId, event, channel, enabled) => {
        const current = get().prefsFor(ownerId);
        const updated = {
          ...current,
          [event]: { ...current[event], [channel]: enabled },
        };
        set({ prefs: { ...get().prefs, [ownerId]: updated } });
      },

      prefsFor: (ownerId) => {
        return get().prefs[ownerId] ?? DEFAULT_PREFS;
      },

      reset: () => set({ items: SEED, prefs: {} }),
    }),
    { name: 'bikita-notifications' },
  ),
);

// ─── Helpers ──────────────────────────────────

export function useNotificationsForOwner(ownerId: string | null): NotificationItem[] {
  return useNotificationsStore((s) =>
    ownerId ? s.items.filter((i) => i.ownerId === ownerId) : [],
  );
}

export function useUnreadCount(ownerId: string | null): number {
  return useNotificationsStore((s) =>
    ownerId ? s.items.filter((i) => i.ownerId === ownerId && !i.readAt).length : 0,
  );
}

/** Respects user preferences — returns the channels the notification will be delivered on. */
export function channelsForEvent(
  prefs: Record<NotificationEvent, Record<NotificationChannel, boolean>>,
  event: NotificationEvent,
): NotificationChannel[] {
  const p = prefs[event];
  if (!p) return ['app'];
  return (Object.keys(p) as NotificationChannel[]).filter((c) => p[c]);
}

export const Bell$ = Bell;
