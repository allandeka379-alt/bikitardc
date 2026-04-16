'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  CalendarClock,
  ClipboardList,
  FileBadge2,
  HandCoins,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Map,
  Receipt,
  Settings,
  Users,
  Wallet,
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
  { href: '/erp/dashboard',          label: 'Dashboard',      Icon: LayoutDashboard },
  { href: '/erp/residents',          label: 'Residents',      Icon: Users },
  { href: '/erp/properties',         label: 'Properties',     Icon: Receipt },
  { href: '/erp/billing',            label: 'Billing runs',   Icon: HandCoins },
  { href: '/erp/payments',           label: 'Payments',       Icon: Wallet },
  { href: '/erp/payments/reconcile', label: 'Reconciliation', Icon: ClipboardList },
  { href: '/erp/arrangements',       label: 'Arrangements',   Icon: CalendarClock },
  { href: '/erp/applications',       label: 'Applications',   Icon: FileBadge2 },
  { href: '/erp/requests',           label: 'Service requests', Icon: LifeBuoy },
  { href: '/erp/requests/map',       label: 'Requests map',   Icon: Map },
  { href: '/erp/reports',            label: 'Reports',        Icon: History },
  { href: '/erp/admin',              label: 'Admin',          Icon: Settings },
];

export function ErpMobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { fullName, email, logout } = useCurrentUser();

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
            <div className="flex items-center gap-2">
              <Logo size={30} />
              <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a6e13]">
                Staff
              </span>
            </div>
            <Dialog.Close
              className="grid h-9 w-9 place-items-center rounded-md text-ink hover:bg-surface"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
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
