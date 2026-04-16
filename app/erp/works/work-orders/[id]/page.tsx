// Work order detail — advance status locally and see everything.

'use client';

import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  findWorkOrder,
  type WorkOrderStatus,
} from '@/mocks/fixtures/work-orders';
import { cn } from '@/lib/cn';

const NEXT: Record<WorkOrderStatus, WorkOrderStatus | null> = {
  open:          'assigned',
  assigned:      'in-progress',
  'in-progress': 'completed',
  blocked:       'in-progress',
  completed:     null,
  cancelled:     null,
};

export default function WorkOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const seed = findWorkOrder(params.id);
  const [status, setStatus] = useState<WorkOrderStatus>(seed?.status ?? 'open');

  if (!seed) return notFound();

  const advance = () => {
    const n = NEXT[status];
    if (!n) return;
    setStatus(n);
    toast({ title: `Moved to ${STATUS_LABEL[n]}`, tone: 'success' });
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/works/work-orders" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Work orders
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-small text-muted">{seed.reference}</span>
                <Badge tone={PRIORITY_TONE[seed.priority]}>{seed.priority}</Badge>
                <Badge tone={STATUS_TONE[status]} dot>{STATUS_LABEL[status]}</Badge>
              </div>
              <h1 className="mt-1 text-h1 text-ink">{seed.title}</h1>
              <p className="mt-2 max-w-2xl text-small text-muted">{seed.description}</p>
            </div>
            {NEXT[status] && (
              <Button onClick={advance} leadingIcon={<CheckCircle2 className="h-4 w-4" />}>
                Move to {STATUS_LABEL[NEXT[status]!]}
              </Button>
            )}
          </div>
        </Card>
      </ScrollReveal>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Details</h2>
          <dl className="mt-3 divide-y divide-line text-small">
            <Row label="Team"         value={seed.team} />
            <Row label="Location"     value={seed.location} />
            <Row label="Ward"         value={seed.ward} />
            <Row label="Raised"       value={`${formatDate(seed.raisedAt)} · by ${seed.raisedBy}`} />
            <Row label="Assigned to"  value={seed.assignedTo ?? '— (unassigned)'} />
            <Row label="Scheduled"    value={seed.scheduledAt ? formatDate(seed.scheduledAt) : '—'} />
            <Row label="Completed"    value={seed.completedAt ? formatDate(seed.completedAt) : '—'} />
            {seed.assetTag && <Row label="Asset tag" value={seed.assetTag} mono />}
            {seed.linkedRequestId && <Row label="From citizen request" value={seed.linkedRequestId} mono />}
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-h3 text-ink">Cost &amp; estimate</h2>
          <dl className="mt-3 divide-y divide-line text-small">
            <Row label="Estimated hours" value={`${seed.estimatedHours} h`} />
            <Row label="Parts cost"      value={formatCurrency(seed.partsCostUsd)} />
          </dl>
          <div className={cn('mt-4 rounded-md p-3 text-small', status === 'blocked' ? 'border border-danger/20 bg-danger/5 text-danger' : 'border border-brand-primary/15 bg-brand-primary/5 text-brand-primary')}>
            {status === 'blocked'
              ? 'This work order is blocked. Typical cause: parts back-order or another work order dependency.'
              : 'Advancing status updates this screen locally; a real implementation writes an audit entry and notifies the team lead.'}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className={mono ? 'font-mono text-ink' : 'text-ink'}>{value}</dd>
    </div>
  );
}
