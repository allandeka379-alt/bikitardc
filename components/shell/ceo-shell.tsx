'use client';

// ─────────────────────────────────────────────
// CEO shell — separate workspace for the Chief
// Executive. Only accessible to users whose role
// is `ceo`; everyone else is redirected back to
// their own dashboard.
//
// The nav here is deliberately leadership-focused
// — executive dashboard, finance, operations, HR,
// council — and intentionally does NOT expose the
// clerical data-entry screens that make up most of
// the /erp tree.
// ─────────────────────────────────────────────

import {
  BarChart3,
  Building2,
  Gavel,
  HardHat,
  LandPlot,
  LogOut,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Logo } from '@/components/ui/logo';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { cn } from '@/lib/cn';

interface NavItem { href: string; label: string; Icon: LucideIcon }

const NAV: NavItem[] = [
  { href: '/ceo',             label: 'Executive dashboard', Icon: BarChart3 },
  { href: '/ceo/finance',     label: 'Finance & revenue',   Icon: Wallet },
  { href: '/ceo/operations',  label: 'Operations',          Icon: HardHat },
  { href: '/ceo/hr',          label: 'People',              Icon: Users },
  { href: '/ceo/council',     label: 'Governance',          Icon: Gavel },
  { href: '/ceo/wards',       label: 'Wards & projects',    Icon: LandPlot },
  { href: '/ceo/assets',      label: 'Assets & estate',     Icon: Building2 },
];

export function CeoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, userId, role, fullName, email, logout } = useCurrentUser();

  useEffect(() => {
    if (!hydrated) return;
    if (!userId) {
      router.replace('/login?redirect=/ceo');
    } else if (role !== 'ceo') {
      router.replace('/erp/dashboard');
    }
  }, [hydrated, userId, role, router]);

  if (!hydrated || !userId || role !== 'ceo') {
    return <Skeleton />;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-card">
        <div className="flex items-center justify-between border-b border-line px-5 py-5">
          <Link href="/ceo" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40">
            <Logo size={32} />
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-ink">
            <ShieldCheck className="h-3 w-3" />
            CEO
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-small font-medium transition-colors duration-fast ease-out-expo',
                      active
                        ? 'bg-brand-accent/15 text-[#8a6e13]'
                        : 'text-ink/70 hover:bg-surface hover:text-ink',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate-line">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-line p-3">
          <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent/15 text-small font-semibold text-[#8a6e13]" aria-hidden>
              {(fullName ?? '').split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate-line text-small font-semibold text-ink">{fullName ?? '—'}</div>
              <div className="truncate-line text-micro text-muted">{email ?? ''}</div>
            </div>
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

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-accent" />
    </div>
  );
}
