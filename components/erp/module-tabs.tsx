'use client';

// ─────────────────────────────────────────────
// In-page sub-navigation for module hubs.
// Keeps the sidebar flat while still letting
// staff jump between sub-areas of a module
// (billing runs / market stalls / beer halls /
// CAMPFIRE; GL / budget / bank rec / reports etc).
//
// Renders as a horizontally-scrollable pill bar
// so it works on mobile as well.
// ─────────────────────────────────────────────

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export interface ModuleTabItem {
  href: string;
  label: string;
  badge?: string | number;
}

interface Props {
  items: ModuleTabItem[];
  className?: string;
}

export function ModuleTabs({ items, className }: Props) {
  const pathname = usePathname();

  return (
    <nav className={cn('mb-6 -mx-1 overflow-x-auto no-scrollbar', className)} aria-label="Module sections">
      <ul className="flex min-w-max items-center gap-1 px-1">
        {items.map(({ href, label, badge }) => {
          const active = pathname === href || (href !== items[0]?.href && pathname.startsWith(href + '/'));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-small font-medium transition-colors duration-fast ease-out-expo',
                  active
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-line bg-card text-ink/80 hover:border-brand-primary/25 hover:text-brand-primary',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {label}
                {badge !== undefined && badge !== null && badge !== 0 && badge !== '' && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                      active ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary',
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
