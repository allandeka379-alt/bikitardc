'use client';

// Full notifications page — tabs by state, filter
// chips by event type. Same click-through + mark-
// read behaviour as the bell panel.

import { Bell, Check, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { formatRelative } from '@/lib/format';
import {
  EVENT_META,
  useNotificationsForOwner,
  useNotificationsStore,
  type NotificationEvent,
  type NotificationItem,
  type NotificationTone,
} from '@/lib/stores/notifications';
import { cn } from '@/lib/cn';

const TONE: Record<NotificationTone, { bg: string; text: string }> = {
  info:    { bg: 'bg-info/10',    text: 'text-info' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  danger:  { bg: 'bg-danger/10',  text: 'text-danger' },
};

type StateFilter = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const { hydrated, userId } = useCurrentUser();
  const items = useNotificationsForOwner(userId);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const clearAll = useNotificationsStore((s) => s.clear);
  const router = useRouter();

  const [state, setState] = useState<StateFilter>('all');
  const [eventFilter, setEventFilter] = useState<NotificationEvent | 'all'>('all');

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (state === 'unread' && n.readAt) return false;
      if (state === 'read' && !n.readAt) return false;
      if (eventFilter !== 'all' && n.event !== eventFilter) return false;
      return true;
    });
  }, [items, state, eventFilter]);

  const unread = items.filter((i) => !i.readAt).length;

  const handleClick = (n: NotificationItem) => {
    if (!n.readAt) markRead(n.id);
    if (n.href) router.push(n.href);
  };

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Notifications</h1>
            <p className="mt-1 text-small text-muted">
              {items.length} total · {unread} unread
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => userId && markAllRead(userId)}
              disabled={unread === 0}
              leadingIcon={<Check className="h-3.5 w-3.5" />}
            >
              Mark all read
            </Button>
            <Button asChild variant="secondary" size="sm" leadingIcon={<Settings className="h-3.5 w-3.5" />}>
              <Link href="/portal/profile/notifications">Preferences</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        {/* Filter strip */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="flex gap-1.5">
            {(['all', 'unread', 'read'] as StateFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setState(f)}
                className={cn(
                  'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                  state === f
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-line bg-card text-ink hover:border-brand-primary/30',
                )}
              >
                {f[0]?.toUpperCase() + f.slice(1)}
                {f === 'unread' && unread > 0 && (
                  <span className="ml-1 rounded-full bg-danger/10 px-1.5 text-[10px] font-bold text-danger">
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </div>
          <span className="mx-1 hidden h-4 w-px bg-line sm:block" aria-hidden />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setEventFilter('all')}
              className={cn(
                'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                eventFilter === 'all'
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-line bg-card text-ink hover:border-brand-primary/30',
              )}
            >
              All types
            </button>
            {(Object.keys(EVENT_META) as NotificationEvent[]).map((ev) => {
              const meta = EVENT_META[ev];
              const active = eventFilter === ev;
              return (
                <button
                  key={ev}
                  type="button"
                  onClick={() => setEventFilter(ev)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                    active
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-line bg-card text-ink hover:border-brand-primary/30',
                  )}
                >
                  <meta.Icon className="h-3 w-3" />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <span className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => userId && clearAll(userId)}
            disabled={items.length === 0}
            leadingIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Clear all
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12">
            <EmptyState
              icon={<Bell className="h-8 w-8" />}
              title={
                state === 'unread'
                  ? "You're all caught up."
                  : state === 'read'
                    ? 'No read notifications yet.'
                    : 'No notifications to show.'
              }
              description="Payment confirmations, application updates and emergency alerts land here."
            />
          </div>
        ) : (
          <ol className="divide-y divide-line">
            {filtered.map((n) => {
              const meta = EVENT_META[n.event];
              const tone = TONE[n.tone];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={cn(
                      'flex w-full items-start gap-4 px-5 py-4 text-left transition-colors',
                      !n.readAt ? 'bg-brand-primary/[0.03]' : 'hover:bg-surface/60',
                    )}
                  >
                    <span
                      className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-md', tone.bg, tone.text)}
                      aria-hidden
                    >
                      <meta.Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-body font-semibold text-ink">{n.title}</div>
                          {!n.readAt && <Badge tone="brand">New</Badge>}
                        </div>
                        <time className="text-micro text-muted">{formatRelative(n.createdAt)}</time>
                      </div>
                      <p className="mt-1 text-small text-muted">{n.body}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">{meta.label}</Badge>
                        {n.channels.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase text-muted"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
