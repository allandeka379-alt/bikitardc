// Meeting detail — agenda, attendees, resolutions, actions.

'use client';

import { ArrowLeft, Clock, FileText, MapPin, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import {
  ACT_STATUS_LABEL,
  ACT_STATUS_TONE,
  KIND_LABEL,
  MEETING_STATUS_LABEL,
  MEETING_STATUS_TONE,
  RES_STATUS_LABEL,
  RES_STATUS_TONE,
  actionsFor,
  findMeeting,
  resolutionsFor,
} from '@/mocks/fixtures/council';
import { cn } from '@/lib/cn';

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const meeting = findMeeting(params.id);
  if (!meeting) return notFound();

  const resolutions = resolutionsFor(meeting.id);
  const actions = actionsFor(meeting.id);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/council/meetings" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Meetings
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-small text-muted">{meeting.reference}</span>
                <Badge tone="brand">{KIND_LABEL[meeting.kind]}</Badge>
                <Badge tone={MEETING_STATUS_TONE[meeting.status]} dot>{MEETING_STATUS_LABEL[meeting.status]}</Badge>
              </div>
              <h1 className="mt-1 text-h1 text-ink">{meeting.title}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-small text-muted">
                <span className="inline-flex items-center gap-1.5"><Clock  className="h-3 w-3" />{formatDate(meeting.startsAt)} · {meeting.durationMinutes} min</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" />{meeting.venue}</span>
                <span className="inline-flex items-center gap-1.5"><UserCheck className="h-3 w-3" />Chair {meeting.chair}</span>
              </div>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Attendees */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Attendees</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {meeting.attendees.map((a) => (<li key={a}><Badge tone="success">{a}</Badge></li>))}
          </ul>
          {meeting.apologies.length > 0 && (
            <>
              <h3 className="mt-4 text-small font-semibold text-muted">Apologies</h3>
              <ul className="mt-1 flex flex-wrap gap-2">
                {meeting.apologies.map((a) => (<li key={a}><Badge tone="warning">{a}</Badge></li>))}
              </ul>
            </>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-h3 text-ink">Summary</h2>
          <dl className="mt-3 divide-y divide-line text-small">
            <Row label="Secretary"     value={meeting.secretary} />
            <Row label="Agenda items"  value={meeting.agenda.length.toString()} />
            <Row label="Resolutions"   value={resolutions.length.toString()} />
            <Row label="Action items"  value={actions.length.toString()} />
          </dl>
        </Card>
      </div>

      {/* Agenda */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-body font-semibold text-ink">Agenda</h2>
        </div>
        <ul className="divide-y divide-line">
          {meeting.agenda.map((a) => (
            <li key={a.id} className="flex items-start gap-4 px-5 py-3 text-small">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-primary/10 text-[10px] font-bold text-brand-primary">{a.order}</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink">{a.title}</div>
                <div className="text-micro text-muted">{a.presenter} · {a.minutesAllocated} min{a.attachments > 0 && ` · ${a.attachments} attachment${a.attachments === 1 ? '' : 's'}`}</div>
                {a.notes && <div className="mt-1 text-micro italic text-warning">Note: {a.notes}</div>}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Resolutions */}
      {resolutions.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Resolutions</h2>
          </div>
          <ul className="divide-y divide-line">
            {resolutions.map((r) => (
              <li key={r.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-micro text-muted">{r.reference}</span>
                    <Badge tone={RES_STATUS_TONE[r.status]}>{RES_STATUS_LABEL[r.status]}</Badge>
                  </div>
                  <div className="text-micro text-muted">Proposer {r.proposer} · Seconder {r.seconder}</div>
                </div>
                <div className="mt-1 text-small font-semibold text-ink">{r.title}</div>
                <p className="mt-1 text-small text-muted">{r.summary}</p>
                <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-wide text-muted">
                  <span className="text-success">For {r.votesFor}</span>
                  <span className="text-danger">Against {r.votesAgainst}</span>
                  <span>Abstain {r.abstentions}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Action items */}
      {actions.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Action items</h2>
          </div>
          <ul className="divide-y divide-line">
            {actions.map((a) => (
              <li key={a.id} className="px-5 py-3 text-small">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-micro text-muted">{a.reference}</span>
                    <Badge tone={ACT_STATUS_TONE[a.status]}>{ACT_STATUS_LABEL[a.status]}</Badge>
                  </div>
                  <div className="text-micro text-muted">Due {formatDate(a.dueAt)}</div>
                </div>
                <div className="mt-1 text-ink">{a.description}</div>
                <div className="mt-0.5 text-micro text-muted">{a.owner} · {a.department}</div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                  <span className={cn('block h-full rounded-full', a.status === 'overdue' ? 'bg-danger' : a.progressPct >= 80 ? 'bg-success' : 'bg-brand-primary')} style={{ width: `${a.progressPct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 rounded-md border border-brand-primary/15 bg-brand-primary/5 p-4 text-small text-brand-primary">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-semibold">Minutes &amp; attachments are filed in /erp/documents under the &ldquo;Council minutes&rdquo; category.</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
