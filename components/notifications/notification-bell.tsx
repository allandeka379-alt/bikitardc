'use client';

// ─────────────────────────────────────────────
// Bell in the top bar. Shows unread count as a
// small red dot + numeric badge. Click opens the
// NotificationPanel (Radix Dialog slide-in).
// ─────────────────────────────────────────────

import * as Dialog from '@radix-ui/react-dialog';
import { Bell, Check, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  EVENT_META,
  useNotificationsForOwner,
  useNotificationsStore,
  useUnreadCount,
  type NotificationItem,
  type NotificationTone,
} from '@/lib/stores/notifications';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

const TONE: Record<NotificationTone, { bg: string; text: string; ring: string }> = {
  info:    { bg: 'bg-info/10',    text: 'text-info',    ring: 'ring-info/20' },
  success: { bg: 'bg-success/10', text: 'text-success', ring: 'ring-success/20' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', ring: 'ring-warning/20' },
  danger:  { bg: 'bg-danger/10',  text: 'text-danger',  ring: 'ring-danger/20' },
};

interface Props {
  /** Where the "Preferences" link should point — different per shell. */
  preferencesHref?: string;
}

export function NotificationBell({ preferencesHref = '/portal/profile/notifications' }: Props) {
  const [open, setOpen] = useState(false);
  const { userId } = useCurrentUser();
  const unread = useUnreadCount(userId);
  const items = useNotificationsForOwner(userId);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const router = useRouter();

  const handleClick = (n: NotificationItem) => {
    if (!n.readAt) markRead(n.id);
    if (n.href) {
      setOpen(false);
      router.push(n.href);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
          className="relative grid h-9 w-9 place-items-center rounded-md text-ink transition-colors hover:bg-surface"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-card">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[58] bg-ink/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[60] flex h-dvh w-full max-w-[440px] flex-col bg-card shadow-card-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-right-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-line px-5 py-4">
            <div>
              <Dialog.Title className="text-h3 text-ink">Notifications</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-micro text-muted">
                {unread > 0
                  ? `${unread} unread · ${items.length} total`
                  : `All caught up · ${items.length} total`}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-ink"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-b border-line px-5 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => userId && markAllRead(userId)}
              disabled={unread === 0}
              leadingIcon={<Check className="h-3.5 w-3.5" />}
            >
              Mark all read
            </Button>
            <span className="flex-1" />
            <Button asChild variant="ghost" size="sm" leadingIcon={<Settings className="h-3.5 w-3.5" />}>
              <Link href={preferencesHref} onClick={() => setOpen(false)}>
                Preferences
              </Link>
            </Button>
          </div>

          {/* List */}
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
                <Bell className="h-5 w-5" />
              </span>
              <div className="text-body font-semibold text-ink">No notifications yet</div>
              <p className="mt-1 max-w-[260px] text-small text-muted">
                Payment confirmations, application updates and emergency alerts will show up here.
              </p>
            </div>
          ) : (
            <ol className="flex-1 divide-y divide-line overflow-y-auto">
              {items.map((n) => {
                const meta = EVENT_META[n.event];
                const tone = TONE[n.tone];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className={cn(
                        'group flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors',
                        !n.readAt ? 'bg-brand-primary/[0.03]' : 'hover:bg-surface/60',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-md ring-1',
                          tone.bg,
                          tone.text,
                          tone.ring,
                        )}
                        aria-hidden
                      >
                        <meta.Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-small font-semibold text-ink">{n.title}</div>
                          {!n.readAt && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-small text-muted">{n.body}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted">
                          <span>{meta.label}</span>
                          <span aria-hidden>·</span>
                          <time>{formatRelative(n.createdAt)}</time>
                          {n.channels.length > 0 && (
                            <>
                              <span aria-hidden>·</span>
                              <span className="uppercase tracking-wide">
                                {n.channels.join(' · ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
