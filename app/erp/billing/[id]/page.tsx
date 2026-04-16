// ─────────────────────────────────────────────
// Billing run detail — shows the run header,
// lifecycle timeline, and per-stage actions
// (approve · post · notify).
// ─────────────────────────────────────────────

'use client';

import { AlertTriangle, ArrowLeft, Check, Send } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  STATUS_LABEL,
  STATUS_TONE,
  findBillingRun,
  type BillingRunStatus,
} from '@/mocks/fixtures/billing-runs';
import { findRevenueSource } from '@/mocks/fixtures/revenue-sources';
import { cn } from '@/lib/cn';

const STAGES: { id: BillingRunStatus; label: string; body: string }[] = [
  { id: 'draft',    label: 'Draft',    body: 'Lines computed, nothing posted yet.' },
  { id: 'approved', label: 'Approved', body: 'CFO has locked the figures.' },
  { id: 'posted',   label: 'Posted',   body: 'Invoices and ledger entries created.' },
  { id: 'notified', label: 'Notified', body: 'SMS / WhatsApp / email dispatched.' },
];

export default function BillingRunDetailPage() {
  const params = useParams<{ id: string }>();
  const seed = findBillingRun(params.id);

  // Local draft-state so the demo can advance the run through its lifecycle
  // without mutating the fixture. Must be declared before any early return.
  const [status, setStatus] = useState<BillingRunStatus>(seed?.status ?? 'draft');

  if (!seed) return notFound();

  const source = findRevenueSource(seed.source);
  const currentStageIndex = STAGES.findIndex((s) => s.id === status);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/billing"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Billing runs
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h1 text-ink">{source?.label ?? seed.source}</h1>
                <Badge tone={STATUS_TONE[status]} dot>{STATUS_LABEL[status]}</Badge>
              </div>
              <div className="mt-1 text-small text-muted">
                Period <span className="font-semibold text-ink">{seed.period}</span>
                {' · '}
                <span className="font-mono">{seed.id}</span>
              </div>
              {seed.notes && (
                <div className="mt-3 rounded-md border border-warning/20 bg-warning/5 p-3 text-small text-warning">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{seed.notes}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Metric label="Accounts"    value={seed.accountCount.toLocaleString()} />
              <Metric label="Total USD"   value={formatCurrency(seed.totalUsd)} emphasis />
              <Metric label="Errors"      value={seed.errorCount.toString()} tone={seed.errorCount > 0 ? 'danger' : 'muted'} />
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Lifecycle stepper */}
      <div className="mt-6">
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Lifecycle</h2>
          <p className="mt-1 text-small text-muted">
            Every billing run moves through four stages. Demo actions below advance the run locally.
          </p>

          <ol className="mt-5 grid gap-4 sm:grid-cols-4">
            {STAGES.map((stage, i) => {
              const done = i <= currentStageIndex;
              const active = i === currentStageIndex;
              return (
                <li
                  key={stage.id}
                  className={cn(
                    'relative rounded-md border p-4 transition-all',
                    active ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand' :
                    done   ? 'border-success/30 bg-success/5' :
                             'border-line bg-surface/30',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold',
                      active ? 'bg-brand-primary text-white' :
                      done   ? 'bg-success text-white' :
                               'bg-line text-muted',
                    )}>
                      {i + 1}
                    </span>
                    <span className={cn('text-small font-semibold', done ? 'text-ink' : 'text-muted')}>
                      {stage.label}
                    </span>
                  </div>
                  <p className={cn('mt-2 text-micro', done ? 'text-ink/80' : 'text-muted')}>
                    {stage.body}
                  </p>
                  {active && stage.id === 'draft' && (
                    <Button
                      size="sm"
                      className="mt-3"
                      leadingIcon={<Check className="h-3 w-3" />}
                      onClick={() => setStatus('approved')}
                    >
                      Approve
                    </Button>
                  )}
                  {active && stage.id === 'approved' && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => setStatus('posted')}
                    >
                      Post to GL
                    </Button>
                  )}
                  {active && stage.id === 'posted' && (
                    <Button
                      size="sm"
                      className="mt-3"
                      leadingIcon={<Send className="h-3 w-3" />}
                      onClick={() => setStatus('notified')}
                    >
                      Dispatch notifications
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      {/* Audit timeline */}
      <div className="mt-6">
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Audit trail</h2>
          <ol className="mt-4 flex flex-col gap-3">
            <AuditRow label="Generated" actor={seed.generatedBy} at={seed.createdAt} />
            {seed.approvedAt && <AuditRow label="Approved" actor={seed.approvedBy ?? '—'} at={seed.approvedAt} />}
            {seed.postedAt   && <AuditRow label="Posted to GL"   actor="System" at={seed.postedAt} />}
            {seed.notifiedAt && <AuditRow label="Notifications dispatched" actor="System" at={seed.notifiedAt} />}
          </ol>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, emphasis, tone }: { label: string; value: string; emphasis?: boolean; tone?: 'danger' | 'muted' }) {
  return (
    <div className={cn('rounded-md border px-4 py-2.5', emphasis ? 'border-brand-primary bg-brand-primary/5' : 'border-line bg-card')}>
      <div className="text-micro text-muted">{label}</div>
      <div className={cn(
        'text-h3 font-bold tabular-nums',
        emphasis ? 'text-brand-primary' : tone === 'danger' ? 'text-danger' : 'text-ink',
      )}>
        {value}
      </div>
    </div>
  );
}

function AuditRow({ label, actor, at }: { label: string; actor: string; at: string }) {
  return (
    <li className="flex items-center justify-between border-b border-line pb-2 text-small last:border-b-0 last:pb-0">
      <div>
        <div className="font-semibold text-ink">{label}</div>
        <div className="text-micro text-muted">by {actor}</div>
      </div>
      <div className="text-micro text-muted">{formatDate(at)}</div>
    </li>
  );
}
