import {
  FileBadge2,
  FolderLock,
  Megaphone,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  href: string;
  label: string;
  Icon: LucideIcon;
  tint: string;
}

const ACTIONS: QuickAction[] = [
  { href: '/portal/apply/business-licence', label: 'Apply for a service', Icon: FileBadge2, tint: 'bg-brand-accent/15 text-[#8a6e13]' },
  { href: '/portal/report',                 label: 'Report an issue',     Icon: Megaphone,  tint: 'bg-danger/10 text-danger' },
  { href: '/portal/documents',              label: 'My documents',        Icon: FolderLock, tint: 'bg-info/10 text-info' },
  { href: '/portal/properties',             label: 'My properties',       Icon: Receipt,    tint: 'bg-brand-primary/10 text-brand-primary' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map(({ href, label, Icon, tint }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3 rounded-md border border-line bg-card p-3 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-card-sm"
        >
          <span className={`grid h-9 w-9 place-items-center rounded-md ${tint}`} aria-hidden>
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-small font-medium text-ink group-hover:text-brand-primary">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
