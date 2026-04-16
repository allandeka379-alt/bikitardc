// Colour-coded balance pill (spec §3.1: green / amber / red).

import type { BalanceTier } from '@/mocks/fixtures/properties';
import { cn } from '@/lib/cn';

const STYLE: Record<BalanceTier, string> = {
  clear:     'bg-success/10 text-success ring-1 ring-success/20',
  'due-soon': 'bg-warning/10 text-warning ring-1 ring-warning/20',
  overdue:   'bg-danger/10 text-danger ring-1 ring-danger/20',
};

const LABEL: Record<BalanceTier, string> = {
  clear: 'Paid up',
  'due-soon': 'Due soon',
  overdue: 'Overdue',
};

export function BalancePill({ tier, className }: { tier: BalanceTier; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-micro font-semibold',
        STYLE[tier],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {LABEL[tier]}
    </span>
  );
}
