'use client';

// ─────────────────────────────────────────────
// Portal sidebar — desktop only (lg+).
// Matches the AppShell contract from spec §5.4.
// ─────────────────────────────────────────────

import {
  Bell,
  FileBadge2,
  FolderLock,
  LayoutGrid,
  LogOut,
  Megaphone,
  Receipt,
  User,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { cn } from '@/lib/cn';

interface NavLink {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const LINKS: NavLink[] = [
  { href: '/portal/dashboard',    label: 'Dashboard',    Icon: LayoutGrid },
  { href: '/portal/properties',   label: 'My properties', Icon: Receipt },
  { href: '/portal/applications', label: 'Applications', Icon: FileBadge2 },
  { href: '/portal/requests',     label: 'Service requests', Icon: Megaphone },
  { href: '/portal/documents',    label: 'Documents',    Icon: FolderLock },
  { href: '/portal/profile',      label: 'Profile',      Icon: User },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { fullName, email, logout } = useCurrentUser();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-card">
      <div className="border-b border-line px-5 py-5">
        <Link
          href="/portal/dashboard"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <Logo size={32} />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {LINKS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-small font-medium transition-colors duration-fast ease-out-expo',
                active
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-ink/70 hover:bg-surface hover:text-ink',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate-line">{label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar name={fullName ?? ''} />
          <div className="min-w-0 flex-1">
            <div className="truncate-line text-small font-semibold text-ink">{fullName ?? '—'}</div>
            <div className="truncate-line text-micro text-muted">{email ?? ''}</div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface hover:text-ink"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-small font-medium text-muted transition-colors hover:bg-danger/8 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary/10 text-small font-semibold text-brand-primary"
      aria-hidden
    >
      {initials || 'U'}
    </span>
  );
}
