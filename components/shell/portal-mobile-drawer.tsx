'use client';

// Mobile navigation drawer — slides in from the left.
// Uses Radix Dialog for focus trap + Esc handling.

import * as Dialog from '@radix-ui/react-dialog';
import {
  Bell,
  FileBadge2,
  FolderLock,
  LayoutGrid,
  LogOut,
  Megaphone,
  Receipt,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Logo } from '@/components/ui/logo';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { cn } from '@/lib/cn';

const LINKS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/portal/dashboard',    label: 'Dashboard',    Icon: LayoutGrid },
  { href: '/portal/properties',   label: 'My properties', Icon: Receipt },
  { href: '/portal/applications', label: 'Applications', Icon: FileBadge2 },
  { href: '/portal/requests',     label: 'Service requests', Icon: Megaphone },
  { href: '/portal/documents',    label: 'Documents',    Icon: FolderLock },
  { href: '/portal/profile',      label: 'Profile',      Icon: User },
];

export function PortalMobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { fullName, email, logout } = useCurrentUser();

  // Auto-close on navigation
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[58] bg-ink/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-[60] flex h-dvh w-[84%] max-w-[340px] flex-col bg-card shadow-card-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-left-6">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo size={30} />
            <Dialog.Close
              className="grid h-9 w-9 place-items-center rounded-md text-ink hover:bg-surface"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
            {LINKS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-3 text-body font-medium transition-colors',
                    active
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-ink/80 hover:bg-surface',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              );
            })}

            <button
              type="button"
              className="mt-2 flex items-center gap-3 rounded-md px-3 py-3 text-body font-medium text-ink/80 hover:bg-surface"
            >
              <Bell className="h-4 w-4" aria-hidden />
              Notifications
              <span className="ml-auto h-5 min-w-5 rounded-full bg-danger/10 px-1.5 text-center text-micro font-semibold leading-5 text-danger">
                3
              </span>
            </button>
          </nav>

          <div className="border-t border-line p-4">
            <div className="mb-3">
              <div className="text-small font-semibold text-ink">{fullName ?? '—'}</div>
              <div className="truncate-line text-micro text-muted">{email ?? ''}</div>
            </div>
            <div className="mb-3">
              <LanguageToggle />
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-small font-medium text-danger hover:bg-danger/8"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
