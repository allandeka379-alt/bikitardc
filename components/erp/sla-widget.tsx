'use client';

// SLA health widget — shows open service requests
// grouped by SLA status (on-track / at-risk /
// breached), sourced from the request fixture
// and the ERP store's status overrides.

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useAllServiceRequests } from '@/lib/hooks/use-service-requests';
import { slaHealth, STATUS_LABEL, type SlaHealth } from '@/mocks/fixtures/service-requests';
import { cn } from '@/lib/cn';

const TONE: Record<SlaHealth, { bg: string; text: string; label: string }> = {
  'on-track': { bg: 'bg-success/10', text: 'text-success', label: 'On track' },
  'at-risk':  { bg: 'bg-warning/10', text: 'text-warning', label: 'At risk' },
  breached:   { bg: 'bg-danger/10',  text: 'text-danger',  label: 'Breached' },
};

export function SlaWidget() {
  const all = useAllServiceRequests();
  const open = all.filter((r) => r.status !== 'resolved');

  const grouped: Record<SlaHealth, typeof open> = {
    'on-track': [],
    'at-risk':  [],
    breached:   [],
  };
  for (const r of open) grouped[slaHealth(r)].push(r);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h3 className="text-h3 text-ink">Service request SLA</h3>
          <p className="mt-0.5 text-micro text-muted">{open.length} open tickets across Bikita</p>
        </div>
        <Link
          href="/erp/requests"
          className="rounded-sm text-small font-medium text-brand-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-0 divide-x divide-line">
        {(Object.keys(grouped) as SlaHealth[]).map((k) => (
          <div key={k} className="px-5 py-4 text-center">
            <div className="text-[28px] font-bold tabular-nums text-ink">
              {grouped[k].length}
            </div>
            <div
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-semibold',
                TONE[k].bg,
                TONE[k].text,
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {TONE[k].label}
            </div>
          </div>
        ))}
      </div>

      <ul className="divide-y divide-line">
        {open
          .sort((a, b) => (slaHealth(a) === 'breached' ? -1 : 1))
          .slice(0, 4)
          .map((r) => {
            const health = slaHealth(r);
            const status = r.status;
            return (
              <li key={r.id}>
                <Link
                  href={`/erp/requests?id=${r.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface/60"
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', TONE[health].bg.replace('/10', ''), 'bg-current', TONE[health].text)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate-line text-small font-medium text-ink">{r.title}</div>
                    <div className="text-micro text-muted">
                      {r.ward} ward · {r.priority.toUpperCase()} · {STATUS_LABEL[status]}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-micro font-semibold',
                      TONE[health].bg,
                      TONE[health].text,
                    )}
                  >
                    {TONE[health].label}
                  </span>
                </Link>
              </li>
            );
          })}
      </ul>
    </Card>
  );
}

