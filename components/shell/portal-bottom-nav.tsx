'use client';

// Mobile bottom tab bar. Renders under `lg`.
// 5 slots: Home, Properties, Pay (emphasized FAB),
// Requests, Profile.

import {
  LayoutGrid,
  Megaphone,
  Receipt,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface Tab {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Centerpiece — renders as a raised primary button. */
  primary?: boolean;
}

const TABS: Tab[] = [
  { href: '/portal/dashboard',    label: 'Home',       Icon: LayoutGrid },
  { href: '/portal/properties',   label: 'Properties', Icon: Receipt },
  { href: '/portal/pay',          label: 'Pay',        Icon: Wallet, primary: true },
  { href: '/portal/requests',     label: 'Requests',   Icon: Megaphone },
  { href: '/portal/profile',      label: 'Profile',    Icon: User },
];

export function PortalBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-[40] safe-bottom border-t border-line bg-card/95 backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-[1200px] items-end justify-between px-1 py-1.5">
        {TABS.map(({ href, label, Icon, primary }) => {
          const active =
            pathname === href ||
            (href !== '/portal/pay' && pathname.startsWith(href + '/'));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-0.5 px-2 py-1 text-micro',
                  active ? 'text-brand-primary' : 'text-muted',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {primary ? (
                  <span className="mb-1 grid h-12 w-12 -translate-y-3 place-items-center rounded-full bg-brand-primary text-white shadow-card-md ring-4 ring-card">
                    <Icon className="h-5 w-5" />
                  </span>
                ) : (
                  <Icon className="h-5 w-5" aria-hidden />
                )}
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
