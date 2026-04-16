'use client';

// ─────────────────────────────────────────────
// Inspection scheduler (spec §3.2). Week-view of
// upcoming inspections grouped by day, plus a
// history strip of completed ones. Clicking an
// item jumps to the linked application where
// applicable.
// ─────────────────────────────────────────────

import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Link2,
  MapPin,
  User2,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  INSPECTION_LABEL,
  INSPECTION_TONE,
  INSPECTIONS,
  groupByDay,
  pastInspections,
  upcomingInspections,
  type Inspection,
} from '@/mocks/fixtures/inspections';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function InspectionsPage() {
  const upcoming = useMemo(() => upcomingInspections(), []);
  const past = useMemo(() => pastInspections(), []);
  const [kindFilter, setKindFilter] = useState<'all' | Inspection['kind']>('all');

  const filteredUpcoming =
    kindFilter === 'all' ? upcoming : upcoming.filter((i) => i.kind === kindFilter);
  const grouped = groupByDay(filteredUpcoming);

  const byKind = {
    'building-plan':    INSPECTIONS.filter((i) => i.kind === 'building-plan').length,
    'business-licence': INSPECTIONS.filter((i) => i.kind === 'business-licence').length,
    health:             INSPECTIONS.filter((i) => i.kind === 'health').length,
    environment:        INSPECTIONS.filter((i) => i.kind === 'environment').length,
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Inspections</h1>
            <p className="mt-1 text-small text-muted">
              Upcoming site visits across the district — grouped by day. Past inspections and outcomes
              appear below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warning">{upcoming.length} upcoming</Badge>
            <Badge tone="success">{past.filter((i) => i.status === 'completed').length} completed</Badge>
          </div>
        </div>
      </ScrollReveal>

      <div className="mb-5 grid gap-2 sm:grid-cols-4">
        {(
          [
            'all',
            'business-licence',
            'building-plan',
            'health',
            'environment',
          ] as const
        ).map((k) => {
          const active = kindFilter === k;
          const label = k === 'all' ? 'All' : INSPECTION_LABEL[k];
          const count =
            k === 'all'
              ? upcoming.length
              : upcoming.filter((i) => i.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={cn(
                'flex items-center justify-between rounded-md border px-4 py-2.5 text-left transition-colors',
                active
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-line bg-card text-ink hover:border-brand-primary/30',
              )}
            >
              <span className="text-small font-medium capitalize">{label}</span>
              <span className="text-micro font-semibold tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      <ScrollReveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted" />
              <h2 className="text-small font-semibold text-ink">This week</h2>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled>
                <ChevronLeft className="h-3.5 w-3.5" />
                Earlier
              </Button>
              <Button variant="ghost" size="sm" disabled>
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {grouped.length === 0 ? (
            <div className="px-5 py-12">
              <EmptyState title="Nothing scheduled for this filter." />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {grouped.map(({ day, items }) => (
                <li key={day} className="px-5 py-4">
                  <div className="mb-3 flex items-baseline justify-between">
                    <h3 className="text-small font-semibold text-ink">
                      {formatDate(day, 'en', { weekday: 'long', day: '2-digit', month: 'short' })}
                    </h3>
                    <span className="text-micro text-muted">{items.length} visit{items.length > 1 ? 's' : ''}</span>
                  </div>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {items.map((i) => (
                      <InspectionRow key={i.id} inspection={i} />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </ScrollReveal>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ScrollReveal>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-small font-semibold text-ink">Completed & history</h3>
              <Badge tone="neutral">{past.length}</Badge>
            </div>
            {past.length === 0 ? (
              <div className="px-5 py-10 text-center text-small text-muted">
                No past inspections recorded.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {past.map((i) => (
                  <li key={i.id} className="flex items-start gap-3 px-5 py-3 text-small">
                    <span
                      className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md', INSPECTION_TONE[i.kind].bg, INSPECTION_TONE[i.kind].text)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate-line text-small font-medium text-ink">{i.title}</div>
                      <div className="text-micro text-muted">
                        {formatDate(i.scheduledAt)} · {i.officer} · {INSPECTION_LABEL[i.kind]}
                      </div>
                      {i.outcomeNote && (
                        <p className="mt-1 text-micro text-ink">{i.outcomeNote}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <Card className="p-5">
            <h3 className="text-h3 text-ink">Caseload</h3>
            <p className="mt-1 text-small text-muted">Inspections on file by kind.</p>
            <ul className="mt-3 space-y-2.5 text-small">
              {Object.entries(byKind).map(([kind, n]) => {
                const k = kind as Inspection['kind'];
                const max = Math.max(...Object.values(byKind));
                const pct = (n / Math.max(1, max)) * 100;
                return (
                  <li key={kind}>
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-ink">{INSPECTION_LABEL[k]}</span>
                      <span className="tabular-nums text-muted">{n}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <span
                        className={cn('block h-full rounded-full', INSPECTION_TONE[k].bg)}
                        style={{ width: `${pct}%`, backgroundColor: 'currentColor' }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

function InspectionRow({ inspection: i }: { inspection: Inspection }) {
  const tone = INSPECTION_TONE[i.kind];
  const time = new Date(i.scheduledAt).toLocaleTimeString('en-ZW', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li>
      <Card className="h-full p-3 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-card-sm">
        <div className="flex items-start gap-3">
          <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-md', tone.bg, tone.text)} aria-hidden>
            <CalendarClock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{INSPECTION_LABEL[i.kind]}</Badge>
              <span className="font-mono text-[10px] text-muted">{i.reference}</span>
            </div>
            <div className="mt-1 text-small font-semibold text-ink">{i.title}</div>
            <ul className="mt-1 space-y-0.5 text-micro text-muted">
              <li className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3 w-3" /> {time} · {i.durationMinutes}m
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {i.address} · {i.ward}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <User2 className="h-3 w-3" /> {i.officer}
              </li>
            </ul>
            {i.applicationRef && (
              <Link
                href={`/erp/applications/${i.applicationRef}`}
                className="mt-2 inline-flex items-center gap-1 text-micro font-medium text-brand-primary hover:underline"
              >
                <Link2 className="h-3 w-3" />
                Open {i.applicationRef}
              </Link>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}
