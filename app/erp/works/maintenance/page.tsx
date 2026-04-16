// Maintenance plan — forward-looking schedule for roads, water
// and plant maintenance. Derived from the existing WORK_ORDERS
// fixture (completed + scheduled items) plus a synthetic forward
// plan for recurring programmes.

'use client';

import { ArrowLeft, Calendar, Droplets, Signpost, Wrench, Zap } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

type Programme = 'roads' | 'water' | 'fleet' | 'electrical';

interface PlanItem {
  id: string;
  title: string;
  programme: Programme;
  ward: string;
  scheduledAt: string;
  recurrence: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'once';
  estimatedCostUsd: number;
  lead: string;
}

const PROGRAMME_META: Record<Programme, { label: string; tone: 'brand' | 'info' | 'warning' | 'success'; Icon: React.ElementType }> = {
  roads:      { label: 'Roads',          tone: 'brand',   Icon: Signpost },
  water:      { label: 'Water & sewer',  tone: 'info',    Icon: Droplets },
  fleet:      { label: 'Fleet',          tone: 'warning', Icon: Wrench },
  electrical: { label: 'Electrical',     tone: 'success', Icon: Zap },
};

const PLAN: PlanItem[] = [
  { id: 'mp_001', title: 'Nhema–Mazungunye grading (final pass)', programme: 'roads',      ward: 'Nhema',   scheduledAt: '2026-04-22', recurrence: 'once',      estimatedCostUsd: 2_400, lead: 'Fortune Marimo' },
  { id: 'mp_002', title: 'Kamungoma junction streetlight review', programme: 'electrical', ward: 'Kamungoma', scheduledAt: '2026-04-18', recurrence: 'once',      estimatedCostUsd:   260, lead: 'Blessing Mpofu' },
  { id: 'mp_003', title: 'Silveira Mission tank chlorination',     programme: 'water',      ward: 'Silveira', scheduledAt: '2026-04-16', recurrence: 'quarterly', estimatedCostUsd:    45, lead: 'Stephen Maseko' },
  { id: 'mp_004', title: 'Grader — 9,200 km service',              programme: 'fleet',      ward: 'Chikwanda', scheduledAt: '2026-04-22', recurrence: 'once',      estimatedCostUsd:   620, lead: 'Blessing Mpofu' },
  { id: 'mp_005', title: 'Refuse route — Nyika township',          programme: 'roads',      ward: 'Nyika',    scheduledAt: '2026-04-18', recurrence: 'weekly',    estimatedCostUsd:   120, lead: 'Munyaradzi Zvobgo' },
  { id: 'mp_006', title: 'Refuse route — Mupani township',         programme: 'roads',      ward: 'Mupani',   scheduledAt: '2026-04-19', recurrence: 'weekly',    estimatedCostUsd:   120, lead: 'Munyaradzi Zvobgo' },
  { id: 'mp_007', title: 'Bota borehole pump quarterly check',     programme: 'water',      ward: 'Bota',     scheduledAt: '2026-05-02', recurrence: 'quarterly', estimatedCostUsd:    80, lead: 'Stephen Maseko' },
  { id: 'mp_008', title: 'Civic centre generator monthly run',     programme: 'electrical', ward: 'Chikwanda', scheduledAt: '2026-04-30', recurrence: 'monthly',   estimatedCostUsd:    30, lead: 'Kudakwashe Njanji' },
  { id: 'mp_009', title: 'Dam rehab — Siya silting survey',        programme: 'water',      ward: 'Nhema',    scheduledAt: '2026-05-12', recurrence: 'once',      estimatedCostUsd: 1_800, lead: 'Edgar Chimwemwe' },
  { id: 'mp_010', title: 'Iveco 7T — post-overhaul test drive',    programme: 'fleet',      ward: 'Chikwanda', scheduledAt: '2026-04-25', recurrence: 'once',      estimatedCostUsd:    80, lead: 'Blessing Mpofu' },
];

export default function MaintenancePlanPage() {
  const grouped = PLAN.reduce<Record<string, PlanItem[]>>((acc, p) => {
    (acc[p.scheduledAt] ||= []).push(p);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/works" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Works &amp; assets
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Maintenance plan</h1>
          <p className="mt-1 text-small text-muted">
            Forward-looking schedule of road, water, fleet and electrical maintenance over the next 4 weeks.
          </p>
        </div>
      </ScrollReveal>

      <Card className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
            <Calendar className="h-4 w-4" />
          </span>
          <h2 className="text-h3 text-ink">Schedule</h2>
        </div>

        <ol className="flex flex-col gap-4">
          {sortedDates.map((date) => (
            <li key={date} className="border-l-2 border-brand-primary/20 pl-4">
              <div className="mb-2 text-small font-semibold text-ink">{formatDate(date)}</div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {grouped[date]!.map((p) => {
                  const meta = PROGRAMME_META[p.programme];
                  const Icon = meta.Icon;
                  return (
                    <div key={p.id} className="flex items-start gap-3 rounded-md border border-line bg-card p-3">
                      <span className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-md',
                        meta.tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
                        meta.tone === 'warning' ? 'bg-warning/10 text-warning' :
                        meta.tone === 'success' ? 'bg-success/10 text-success' :
                                                  'bg-info/10 text-info',
                      )}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-small font-semibold text-ink">{p.title}</span>
                          <Badge tone="neutral">{p.recurrence}</Badge>
                        </div>
                        <div className="mt-0.5 text-micro text-muted">{p.ward} · lead {p.lead}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-micro text-muted">est.</div>
                        <div className="text-small font-semibold tabular-nums text-ink">${p.estimatedCostUsd}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
