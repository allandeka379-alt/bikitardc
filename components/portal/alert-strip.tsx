// Bill-ready / due-soon / emergency alert shown
// above the dashboard and property detail pages.

import { ArrowRight, CalendarDays, CheckCheck, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type AlertTone = 'info' | 'warning' | 'success' | 'danger';

interface AlertStripProps {
  tone: AlertTone;
  icon?: React.ReactNode;
  title: string;
  body?: string;
  href?: string;
  cta?: string;
}

const STYLES: Record<AlertTone, string> = {
  info:    'border-info/20 bg-info/8 text-info',
  warning: 'border-warning/25 bg-warning/10 text-warning',
  success: 'border-success/20 bg-success/8 text-success',
  danger:  'border-danger/25 bg-danger/10 text-danger',
};

const DEFAULT_ICON: Record<AlertTone, React.ReactNode> = {
  info:    <CalendarDays className="h-4 w-4" />,
  warning: <TriangleAlert className="h-4 w-4" />,
  success: <CheckCheck className="h-4 w-4" />,
  danger:  <TriangleAlert className="h-4 w-4" />,
};

export function AlertStrip({ tone, icon, title, body, href, cta }: AlertStripProps) {
  const content = (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border px-4 py-3 transition-colors',
        STYLES[tone],
        href && 'hover:brightness-95',
      )}
    >
      <span className="mt-0.5 shrink-0" aria-hidden>
        {icon ?? DEFAULT_ICON[tone]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-small font-semibold text-ink">{title}</div>
        {body && <div className="mt-0.5 text-small text-muted">{body}</div>}
      </div>
      {href && cta && (
        <span className="inline-flex shrink-0 items-center gap-1 text-small font-medium text-current">
          {cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
