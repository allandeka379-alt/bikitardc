'use client';

// ─────────────────────────────────────────────
// Notification preferences — matrix UI (spec §3.1).
// One row per event type, one toggle per channel.
// ─────────────────────────────────────────────

import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  EVENT_META,
  useNotificationsStore,
  type NotificationChannel,
  type NotificationEvent,
} from '@/lib/stores/notifications';
import { cn } from '@/lib/cn';

const CHANNELS: { id: NotificationChannel; label: string }[] = [
  { id: 'app',      label: 'In-app' },
  { id: 'sms',      label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email',    label: 'Email' },
];

const GROUPS: { heading: string; events: NotificationEvent[] }[] = [
  { heading: 'Billing & payments',    events: ['bill-ready', 'payment-success', 'due-soon'] },
  { heading: 'Applications & requests', events: ['application-stage', 'request-update'] },
  { heading: 'Council & community',   events: ['council-meeting', 'by-law-change'] },
  { heading: 'Alerts',                events: ['emergency', 'service-disruption'] },
];

export default function NotificationPrefsPage() {
  const { hydrated, userId } = useCurrentUser();
  const prefsFor = useNotificationsStore((s) => s.prefsFor);
  const setPref = useNotificationsStore((s) => s.setPref);

  if (!hydrated || !userId) return null;
  const prefs = prefsFor(userId);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/portal/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Notification preferences</h1>
          <p className="mt-1 text-small text-muted">
            Pick how we reach you for each event type. You can change these at any time.
          </p>
        </div>
      </ScrollReveal>

      <div className="mb-4 flex items-start gap-2 rounded-md border border-info/20 bg-info/8 p-3 text-small text-info">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          In-app notifications always fire while you're logged in — we can't silence those. SMS, WhatsApp
          and email are fully configurable.
        </span>
      </div>

      <div className="space-y-4">
        {GROUPS.map((group) => (
          <ScrollReveal key={group.heading} delay={40}>
            <Card className="overflow-hidden">
              <div className="border-b border-line bg-surface/40 px-5 py-3">
                <h2 className="text-small font-semibold uppercase tracking-wide text-muted">
                  {group.heading}
                </h2>
              </div>
              <ul className="divide-y divide-line">
                {group.events.map((ev) => {
                  const meta = EVENT_META[ev];
                  const row = prefs[ev];
                  const enabled = CHANNELS.filter((c) => row[c.id]).length;
                  return (
                    <li key={ev} className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
                        <meta.Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-small font-semibold text-ink">{meta.label}</div>
                        <div className="text-micro text-muted">
                          {enabled === 0 ? 'Silent' : `${enabled} channel${enabled > 1 ? 's' : ''} enabled`}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {CHANNELS.map((c) => {
                          const active = row[c.id];
                          const disabled = c.id === 'app'; // app channel always on
                          return (
                            <button
                              key={c.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => setPref(userId, ev, c.id, !active)}
                              aria-pressed={active}
                              className={cn(
                                'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                                disabled
                                  ? 'cursor-not-allowed border-brand-primary bg-brand-primary/10 text-brand-primary opacity-90'
                                  : active
                                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                    : 'border-line bg-card text-muted hover:border-brand-primary/30 hover:text-ink',
                              )}
                            >
                              {c.label}
                              {disabled && (
                                <Badge tone="neutral" className="ml-1.5">
                                  always
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
