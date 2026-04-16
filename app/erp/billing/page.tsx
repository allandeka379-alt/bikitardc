'use client';

// Billing runs — spec §3.2.
// Lists scheduled/past runs with a diff-preview
// pattern (only visual in demo).

import { CalendarClock, CheckCircle2, Clock3, Play, RefreshCw } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BillingRun {
  id: string;
  title: string;
  scheduled: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  records: number;
  totalUsd: number;
  diffPct?: number;
}

const RUNS: BillingRun[] = [
  { id: 'br_apr',  title: 'April 2026 — Residential rates',      scheduled: '2026-04-01', status: 'completed', records: 1_540, totalUsd: 85_300, diffPct:  +4.2 },
  { id: 'br_mar',  title: 'March 2026 — Residential rates',      scheduled: '2026-03-01', status: 'completed', records: 1_536, totalUsd: 81_880, diffPct:  +1.8 },
  { id: 'br_comm', title: 'Q1 2026 — Commercial rates',           scheduled: '2026-01-10', status: 'completed', records:   212, totalUsd: 28_720, diffPct:  +0.5 },
  { id: 'br_may',  title: 'May 2026 — Residential rates (draft)', scheduled: '2026-05-01', status: 'scheduled', records: 1_548, totalUsd: 87_600, diffPct:  +2.7 },
  { id: 'br_market', title: 'Q2 2026 — Market stalls',             scheduled: '2026-04-20', status: 'scheduled', records:    86, totalUsd:  2_580 },
];

const STATUS_TONE: Record<BillingRun['status'], 'success' | 'warning' | 'info' | 'danger'> = {
  completed: 'success',
  scheduled: 'warning',
  running: 'info',
  failed: 'danger',
};

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Billing runs</h1>
            <p className="mt-1 text-small text-muted">
              Monthly and quarterly billing jobs. Preview the diff vs the prior period before approving.
            </p>
          </div>
          <Button leadingIcon={<Play className="h-4 w-4" />}>Queue a run</Button>
        </div>
      </ScrollReveal>

      <ul className="grid gap-3 md:grid-cols-2">
        {RUNS.map((r) => (
          <li key={r.id}>
            <Card className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONE[r.status]} dot>
                  {r.status}
                </Badge>
                <span className="inline-flex items-center gap-1 text-micro text-muted">
                  <CalendarClock className="h-3 w-3" /> {r.scheduled}
                </span>
              </div>
              <h3 className="text-body font-semibold text-ink">{r.title}</h3>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-small">
                <div>
                  <dt className="text-micro text-muted">Records</dt>
                  <dd className="font-semibold tabular-nums text-ink">{r.records.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-micro text-muted">Projected total</dt>
                  <dd className="font-semibold tabular-nums text-ink">${r.totalUsd.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-micro text-muted">Δ vs prior</dt>
                  <dd className="font-semibold tabular-nums text-success">
                    {typeof r.diffPct === 'number' ? `+${r.diffPct.toFixed(1)}%` : '—'}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                {r.status === 'scheduled' ? (
                  <>
                    <Button size="sm" variant="secondary" leadingIcon={<Clock3 className="h-3.5 w-3.5" />}>
                      Preview diff
                    </Button>
                    <Button size="sm" leadingIcon={<Play className="h-3.5 w-3.5" />}>
                      Approve & run
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" leadingIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                      View invoices
                    </Button>
                    <Button size="sm" variant="ghost" leadingIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                      Re-run
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
