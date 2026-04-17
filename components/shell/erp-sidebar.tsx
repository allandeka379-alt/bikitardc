'use client';

// ERP desktop sidebar — flat, one entry per module
// (professional-ERP pattern). Each module hub carries
// its own sub-navigation for drill-downs like
// market stalls, beer halls, CAMPFIRE, etc.
//
// Sections stay visible so scanning is fast and
// there's no need for expand/collapse on 12 items.

import {
  FileBadge2,
  Files,
  Gavel,
  HandCoins,
  HardHat,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Map,
  Receipt,
  Settings,
  ShoppingCart,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { cn } from '@/lib/cn';

interface NavItem { href: string; label: string; Icon: LucideIcon; badge?: string }
interface Section { heading: string; items: NavItem[] }

// 4 sections, ~12 total entries. Sub-pages (market stalls,
// GL accounts, work orders, etc.) live behind the module
// hub pages and show up in each hub's tile navigation + tab bar.
const SECTIONS: Section[] = [
  {
    heading: 'Core',
    items: [
      { href: '/erp/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
      { href: '/erp/residents',  label: 'Residents',  Icon: Users },
      { href: '/erp/properties', label: 'Properties', Icon: Receipt },
      { href: '/erp/cadastre',   label: 'Cadastre',   Icon: Map },
    ],
  },
  {
    heading: 'Revenue & Finance',
    items: [
      { href: '/erp/billing',  label: 'Revenue & Billing', Icon: HandCoins, badge: '2' },
      { href: '/erp/finance',  label: 'Finance',           Icon: Landmark },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { href: '/erp/applications', label: 'Applications',  Icon: FileBadge2 },
      { href: '/erp/requests',     label: 'Service requests', Icon: LifeBuoy },
      { href: '/erp/works',        label: 'Works & Assets', Icon: HardHat },
      { href: '/erp/hr',           label: 'HR & Payroll',   Icon: UserCog },
    ],
  },
  {
    heading: 'Governance',
    items: [
      { href: '/erp/procurement', label: 'Procurement', Icon: ShoppingCart },
      { href: '/erp/council',     label: 'Council',     Icon: Gavel },
      { href: '/erp/documents',   label: 'Documents',   Icon: Files },
      { href: '/erp/admin',       label: 'Admin',       Icon: Settings },
    ],
  },
];

export function ErpSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { fullName, email, logout } = useCurrentUser();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-5">
        <Link
          href="/erp/dashboard"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <Logo size={32} />
        </Link>
        <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-micro font-bold uppercase tracking-[0.08em] text-[#8a6e13]">
          Staff
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {SECTIONS.map((section) => (
          <div key={section.heading} className="mb-5">
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
              {section.heading}
            </div>
            <ul className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, Icon, badge }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-small font-medium transition-colors duration-fast ease-out-expo',
                        active
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'text-ink/70 hover:bg-surface hover:text-ink',
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate-line">{label}</span>
                      {badge && (
                        <span className="ml-auto rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-accent/15 text-small font-semibold text-[#8a6e13]"
            aria-hidden
          >
            {(fullName ?? '')
              .split(/\s+/)
              .slice(0, 2)
              .map((n) => n[0]?.toUpperCase())
              .join('')}
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
  );
}
