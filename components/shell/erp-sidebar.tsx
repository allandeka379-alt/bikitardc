'use client';

// ERP desktop sidebar — mirrors the portal sidebar
// structurally, but with staff-oriented nav items
// and a subtle gold accent to distinguish the
// workspace from the citizen portal.

import {
  BookOpen,
  Building2,
  CalendarClock,
  ClipboardList,
  FileBadge2,
  FileBarChart,
  FlaskConical,
  HandCoins,
  History,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Map,
  Receipt,
  ReceiptText,
  ScrollText,
  Settings,
  Store,
  Trees,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { cn } from '@/lib/cn';

interface NavGroup {
  heading: string;
  items: { href: string; label: string; Icon: LucideIcon; badge?: string }[];
}

const GROUPS: NavGroup[] = [
  {
    heading: 'Workspace',
    items: [
      { href: '/erp/dashboard',   label: 'Dashboard',         Icon: LayoutDashboard },
      { href: '/erp/residents',   label: 'Residents',         Icon: Users },
      { href: '/erp/properties',  label: 'Properties',        Icon: Receipt },
    ],
  },
  {
    heading: 'Revenue',
    items: [
      { href: '/erp/billing',              label: 'Billing runs',    Icon: HandCoins },
      { href: '/erp/billing/market-fees',  label: 'Market stalls',   Icon: Store },
      { href: '/erp/billing/beer-hall',    label: 'Beer halls',      Icon: FlaskConical },
      { href: '/erp/billing/campfire',     label: 'CAMPFIRE',        Icon: Trees },
      { href: '/erp/payments',             label: 'Payments',        Icon: Wallet },
      { href: '/erp/payments/reconcile',   label: 'Reconciliation',  Icon: ClipboardList, badge: '2' },
      { href: '/erp/arrangements',         label: 'Arrangements',    Icon: CalendarClock },
      { href: '/erp/adjustments',          label: 'Adjustments',     Icon: ClipboardList },
    ],
  },
  {
    heading: 'Finance',
    items: [
      { href: '/erp/finance',                     label: 'Finance overview',    Icon: Landmark },
      { href: '/erp/finance/gl',                  label: 'General ledger',      Icon: BookOpen },
      { href: '/erp/finance/budget',              label: 'Budget vs actual',    Icon: FileBarChart },
      { href: '/erp/finance/bank-reconciliation', label: 'Bank reconciliation', Icon: Landmark },
      { href: '/erp/finance/creditors',           label: 'Creditors',           Icon: ReceiptText },
      { href: '/erp/finance/debtors',             label: 'Debtors',             Icon: Users },
      { href: '/erp/finance/fixed-assets',        label: 'Fixed assets',        Icon: Building2 },
      { href: '/erp/finance/reports',             label: 'Statutory reports',   Icon: ScrollText },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { href: '/erp/applications', label: 'Applications',     Icon: FileBadge2 },
      { href: '/erp/inspections',  label: 'Inspections',      Icon: CalendarClock },
      { href: '/erp/field',        label: 'Field mode',       Icon: LifeBuoy },
      { href: '/erp/requests',     label: 'Service requests', Icon: LifeBuoy },
      { href: '/erp/requests/map', label: 'Requests map',     Icon: Map },
      { href: '/erp/valuation',    label: 'Valuation cycle',  Icon: CalendarClock },
    ],
  },
  {
    heading: 'Insights',
    items: [
      { href: '/erp/reports',            label: 'Reports',         Icon: History },
      { href: '/erp/admin',              label: 'Admin',           Icon: Settings },
      { href: '/erp/admin/content',      label: 'Content manager', Icon: Settings },
      { href: '/erp/admin/rate-cards',   label: 'Rate cards',      Icon: Settings },
      { href: '/erp/admin/alerts',       label: 'Alerts',          Icon: Settings },
      { href: '/erp/admin/messaging',    label: 'Bulk messaging',  Icon: Settings },
      { href: '/erp/admin/workflows',    label: 'Workflows & rules', Icon: Settings },
      { href: '/erp/admin/health',       label: 'System health',   Icon: Settings },
      { href: '/erp/dpa',                label: 'Data rights',     Icon: Settings },
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
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-card">
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

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.heading} className="mb-5">
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
              {group.heading}
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, Icon, badge }) => {
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
