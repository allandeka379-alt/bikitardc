'use client';

// Valuation & revaluation cycle (spec §3.2
// "Valuation & revaluation workflow" Phase 2).
// Long-running multi-year process rendered as a
// phased timeline plus a property-level
// snapshot table.

import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Map,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { cn } from '@/lib/cn';

type PhaseStatus = 'completed' | 'active' | 'upcoming';

interface Phase {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  status: PhaseStatus;
  Icon: LucideIcon;
}

const PHASES: Phase[] = [
  {
    id: 'prep',
    title: 'Prep & scoping',
    description:
      'Appoint a valuer, publish terms of reference, agree methodology with Ministry and council.',
    startsAt: '2025-07-01',
    endsAt: '2025-09-30',
    status: 'completed',
    Icon: Scale,
  },
  {
    id: 'field',
    title: 'Field data capture',
    description:
      'Surveyors visit every stand, record GPS boundaries, dimensions and improvements. GIS ingest.',
    startsAt: '2025-10-01',
    endsAt: '2026-03-31',
    status: 'completed',
    Icon: Map,
  },
  {
    id: 'compute',
    title: 'Valuation computation',
    description:
      'Computed market values run through peer review. Draft roll produced for objections.',
    startsAt: '2026-04-01',
    endsAt: '2026-06-30',
    status: 'active',
    Icon: CalendarClock,
  },
  {
    id: 'objections',
    title: 'Objections window',
    description: 'Residents have 60 days to lodge objections. Tribunal hears disputed valuations.',
    startsAt: '2026-07-01',
    endsAt: '2026-08-31',
    status: 'upcoming',
    Icon: Clock3,
  },
  {
    id: 'gazette',
    title: 'Gazette & adoption',
    description: 'Final valuation roll gazetted and adopted by full council. New rates apply next cycle.',
    startsAt: '2026-09-15',
    endsAt: '2026-12-31',
    status: 'upcoming',
    Icon: CheckCircle2,
  },
];

const STATUS_TONE: Record<PhaseStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-success/10', text: 'text-success', label: 'Done' },
  active:    { bg: 'bg-brand-primary/10', text: 'text-brand-primary', label: 'In progress' },
  upcoming:  { bg: 'bg-line', text: 'text-muted', label: 'Upcoming' },
};

export default function ValuationPage() {
  const [openId, setOpenId] = useState<string | null>('compute');

  // Fabricate valuation deltas per property so the table feels live
  const snapshots = PROPERTIES.map((p) => {
    // Deterministic pseudo-random between 0.85 and 1.45 based on id length
    const factor = 0.85 + ((p.id.length * 13) % 60) / 100;
    const lastRoll = Math.round(p.areaSqm * 5 + 4000);
    const draftRoll = Math.round(lastRoll * factor);
    const deltaPct = ((draftRoll - lastRoll) / Math.max(1, lastRoll)) * 100;
    return { property: p, lastRoll, draftRoll, deltaPct };
  });

  const totalLast = snapshots.reduce((s, x) => s + x.lastRoll, 0);
  const totalDraft = snapshots.reduce((s, x) => s + x.draftRoll, 0);
  const overallDelta = ((totalDraft - totalLast) / Math.max(1, totalLast)) * 100;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Valuation & revaluation cycle</h1>
            <p className="mt-1 text-small text-muted">
              Statutory revaluation cycle of the district property roll. Current cycle runs 2025-2026.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">Cycle 2025–2026</Badge>
            <Badge
              tone={overallDelta >= 0 ? 'warning' : 'success'}
              dot
            >
              District average {overallDelta >= 0 ? '+' : ''}
              {overallDelta.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </ScrollReveal>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Previous roll total" value={formatCurrency(totalLast)} />
        <Metric label="Draft roll total" value={formatCurrency(totalDraft)} tone="brand" />
        <Metric
          label="Objections so far"
          value="23"
          tone={overallDelta >= 10 ? 'warning' : 'neutral'}
        />
      </div>

      <ScrollReveal>
        <Card className="mb-4 overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-small font-semibold text-ink">Phases</h2>
          </div>
          <ol className="flex flex-col">
            {PHASES.map((p, i) => {
              const isOpen = openId === p.id;
              const tone = STATUS_TONE[p.status];
              return (
                <li key={p.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : p.id)}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-surface/60"
                    aria-expanded={isOpen}
                  >
                    <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full', tone.bg, tone.text)}>
                      {p.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : p.status === 'active' ? (
                        <p.Icon className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-small font-semibold text-ink">{`${i + 1}. ${p.title}`}</span>
                        <Badge
                          tone={
                            p.status === 'completed'
                              ? 'success'
                              : p.status === 'active'
                                ? 'brand'
                                : 'neutral'
                          }
                        >
                          {tone.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-small text-muted">{p.description}</p>
                      <p className="mt-1 text-micro text-muted">
                        {formatDate(p.startsAt)} – {formatDate(p.endsAt)}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn('h-4 w-4 shrink-0 text-muted transition-transform', isOpen && 'rotate-90 text-brand-primary')}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line bg-surface/40 px-5 py-3 text-small text-ink">
                      <p className="mb-2 font-semibold">Deliverables</p>
                      <ul className="grid gap-1 text-micro text-muted">
                        <li>• Approved methodology document</li>
                        <li>• Ward-level progress report</li>
                        <li>• Draft valuation spreadsheet lodged with Ministry</li>
                        <li>• Public-notice issued via SMS + WhatsApp + gazette</li>
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-small font-semibold text-ink">Draft roll snapshot</h2>
            <Button variant="secondary" size="sm">
              Export draft roll
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Stand</th>
                  <th className="px-5 py-3 text-left">Owner</th>
                  <th className="px-5 py-3 text-right">Previous</th>
                  <th className="px-5 py-3 text-right">Draft</th>
                  <th className="px-5 py-3 text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map(({ property: p, lastRoll, draftRoll, deltaPct }) => (
                  <tr key={p.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3">
                      <div className="text-small font-semibold text-ink">{p.stand}</div>
                      <div className="text-micro text-muted">{p.ward} · {p.classKind}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{p.ownerName}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(lastRoll)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">
                      {formatCurrency(draftRoll)}
                    </td>
                    <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', deltaPct >= 0 ? 'text-warning' : 'text-success')}>
                      {deltaPct >= 0 ? '+' : ''}
                      {deltaPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'brand' | 'warning' | 'neutral';
}) {
  return (
    <Card className="p-4">
      <div className="text-micro text-muted">{label}</div>
      <div
        className={cn(
          'text-h3 font-bold tabular-nums',
          tone === 'brand' ? 'text-brand-primary' : tone === 'warning' ? 'text-warning' : 'text-ink',
        )}
      >
        {value}
      </div>
    </Card>
  );
}
