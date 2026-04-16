'use client';

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { useAllMeetings } from '@/lib/hooks/use-public-content';
import { KIND_LABEL } from '@/mocks/fixtures/meetings';

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const all = useAllMeetings();
  const m = all.find((x) => x.id === id);
  if (!m) return notFound();

  const totalMinutes = m.agenda.reduce((s, a) => s + (a.duration ?? 0), 0);

  return (
    <>
      <PageHero
        eyebrow={KIND_LABEL[m.kind]}
        title={m.title}
        description={m.summary}
        badge={
          <div className="flex flex-wrap gap-2">
            {!m.isPublic && <Badge tone="neutral">Closed sitting</Badge>}
            {m.minutesPublished && <Badge tone="success">Minutes published</Badge>}
            <Badge tone={m.status === 'scheduled' ? 'warning' : m.status === 'completed' ? 'success' : 'danger'}>
              {m.status}
            </Badge>
          </div>
        }
        actions={
          <>
            {m.minutesPublished && (
              <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
                Download minutes
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/meetings">All meetings</Link>
            </Button>
          </>
        }
      />

      <section className="mx-auto max-w-[1100px] px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-14">
        <Link
          href="/meetings"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to meetings
        </Link>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <Card className="p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted" />
              <h2 className="text-h3 text-ink">Agenda</h2>
              <span className="ml-auto text-micro text-muted">{m.agenda.length} items · {totalMinutes || '—'} min</span>
            </div>

            {m.agenda.length === 0 ? (
              <p className="text-small text-muted">
                Agenda details for this past meeting were not attached to the published record. Minutes
                capture all items discussed — download above where available.
              </p>
            ) : (
              <ol className="flex flex-col gap-3">
                {m.agenda.map((a) => (
                  <li key={a.order} className="rounded-md border border-line bg-surface/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-brand-primary/10 text-micro font-semibold text-brand-primary">
                          {a.order}
                        </span>
                        <div>
                          <div className="text-body font-semibold text-ink">{a.title}</div>
                          {a.presenter && (
                            <div className="mt-0.5 text-micro text-muted">
                              Presenter: <span className="font-medium text-ink">{a.presenter}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {a.duration && (
                        <Badge tone="neutral">
                          <Clock3 className="h-3 w-3" />
                          {a.duration} min
                        </Badge>
                      )}
                    </div>
                    {a.doc && (
                      <Button variant="ghost" size="sm" leadingIcon={<Download className="h-3 w-3" />} className="mt-2">
                        {a.doc.label}
                      </Button>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-5 sm:p-6">
              <h3 className="text-h3 text-ink">Logistics</h3>
              <dl className="mt-3 space-y-2.5 text-small">
                <Row
                  label="Date"
                  value={formatDate(m.startAt, 'en', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                />
                <Row
                  label="Time"
                  value={`${new Date(m.startAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}–${new Date(
                    m.endAt,
                  ).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}`}
                />
                <Row label="Venue" value={m.venue} icon={<MapPin className="h-3.5 w-3.5" />} />
                <Row label="Chair" value={m.chair} />
                <Row
                  label="Expected"
                  value={`${m.attendeesExpected} attendees`}
                  icon={<Users className="h-3.5 w-3.5" />}
                />
                <Row label="Reference" value={m.reference} mono />
              </dl>
            </Card>

            {m.isPublic && m.status === 'scheduled' && (
              <Card className="border-success/20 bg-success/5 p-5 sm:p-6">
                <div className="mb-2 inline-flex items-center gap-1.5 text-small font-semibold text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Open to the public
                </div>
                <p className="text-small text-ink">
                  Residents are welcome to attend and participate during the public question time. Doors
                  open 30 minutes before the scheduled start.
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Row({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`flex items-center gap-1.5 text-right font-medium text-ink ${mono ? 'font-mono text-micro' : ''}`}>
        {icon && <span className="text-muted">{icon}</span>}
        {value}
      </dd>
    </div>
  );
}
