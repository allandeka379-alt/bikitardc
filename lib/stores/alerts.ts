'use client';

// ─────────────────────────────────────────────
// Site-wide alerts (spec §3.1).
//
// Three tones driven by a single runtime store:
//   • emergency       — red banner, sticky, dismiss only
//                         when staff expires it
//   • service-disruption — amber banner
//   • info            — navy banner for procedural
//                       notices (public hearings etc.)
//
// Active alerts show on every public page and both
// shells (portal + ERP). Admin publishes + expires
// from /erp/admin/alerts.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AlertTone = 'emergency' | 'service-disruption' | 'info';

export interface SiteAlert {
  id: string;
  tone: AlertTone;
  title: string;
  body: string;
  href?: string;
  /** Wards affected (empty = district-wide). */
  wards: string[];
  startsAt: string;
  /** When to stop showing the banner. null = open-ended. */
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
}

interface AlertsState {
  items: SiteAlert[];
  /** Banner dismissals — keyed by alert id. */
  dismissed: Record<string, true>;

  publish: (input: Omit<SiteAlert, 'id' | 'createdAt'>) => SiteAlert;
  expire: (id: string) => void;
  remove: (id: string) => void;
  dismiss: (id: string) => void;
  reset: () => void;
}

const SEED: SiteAlert[] = [
  {
    id: 'al_water_mupani',
    tone: 'service-disruption',
    title: 'Planned water outage — Mupani Ward',
    body: 'Maintenance on the main line. Water supply interrupted 06:00–14:00 on 5 April 2026.',
    href: '/news',
    wards: ['Mupani'],
    startsAt: '2026-03-28T00:00:00Z',
    expiresAt: '2026-04-05T14:00:00Z',
    createdAt: '2026-03-28T16:00:00Z',
    createdBy: 'Works & Infrastructure',
  },
];

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      items: SEED,
      dismissed: {},

      publish: (input) => {
        const alert: SiteAlert = {
          ...input,
          id: `al_${Math.random().toString(36).slice(2, 10)}`,
          createdAt: new Date().toISOString(),
        };
        set({ items: [alert, ...get().items] });
        return alert;
      },

      expire: (id) =>
        set({
          items: get().items.map((a) =>
            a.id === id ? { ...a, expiresAt: new Date().toISOString() } : a,
          ),
        }),

      remove: (id) => set({ items: get().items.filter((a) => a.id !== id) }),

      dismiss: (id) => set({ dismissed: { ...get().dismissed, [id]: true } }),

      reset: () => set({ items: SEED, dismissed: {} }),
    }),
    { name: 'bikita-alerts' },
  ),
);

/** Active (currently-showing) alerts, excluding those the user dismissed. */
export function useActiveAlerts(): SiteAlert[] {
  const items = useAlertsStore((s) => s.items);
  const dismissed = useAlertsStore((s) => s.dismissed);
  const now = Date.now();
  return items.filter((a) => {
    if (dismissed[a.id]) return false;
    const starts = new Date(a.startsAt).getTime();
    if (starts > now) return false;
    if (a.expiresAt && new Date(a.expiresAt).getTime() <= now) return false;
    return true;
  });
}
