'use client';

import { CalendarDays, CheckCircle2, Clock3, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { useAllMeetings } from '@/lib/hooks/use-public-content';
import { KIND_LABEL, type Meeting } from '@/mocks/fixtures/meetings';
import { cn } from '@/lib/cn';

const TABS = ['upcoming', 'past', 'all'] as const;
type Tab = (typeof TABS)[number];

export default function MeetingsPage() {
  const all = useAllMeetings();
  const [tab, setTab] = useState<Tab>('upcoming');
  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const up: Meeting[] = [];
    const pa: Meeting[] = [];
    for (const m of all) {
      if (m.status === 'scheduled' && new Date(m.startAt) >= now) up.push(m);
      else pa.push(m);
    }
    up.sort((a, b) => (a.startAt < b.startAt ? -1 : 1));
    pa.sort((a, b) => (a.startAt < b.startAt ? 1 : -1));
    return { upcoming: up, past: pa };
  }, [all, now]);

  const items = tab === 'upcoming' ? upcoming : tab === 'past' ? past : [...upcoming, ...past];

  return (
    <>
      <PageHero
        eyebrow="Council meetings"
        title="Schedules, agendas and minutes."
        description="Full-council sittings, committee meetings and public hearings — open to residents unless closed for procurement."
        badge={
          <div className="hidden rounded-md border border-line bg-card px-4 py-2.5 sm:block">
            <div className="text-micro text-muted">Next meeting</div>
            <div className="text-h3 font-semibold tabular-nums text-ink">
              {upcoming[0] ? formatDate(upcoming[0].startAt) : '—'}
            </div>
          </div>
        }
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        <div className="mb-6 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-small font-medium capitalize transition-colors',
                tab === t
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-line bg-card text-ink hover:border-brand-primary/30',
              )}
            >
              {t}
              {t === 'upcoming' && upcoming.length > 0 && (
                <span className="ml-1.5 rounded-full bg-brand-primary/10 px-1.5 text-[10px] font-bold">
                  {upcoming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <ul className="grid gap-3">
          {items.map((m, i) => (
            <li key={m.id}>
              <ScrollReveal delay={i * 40}>
                <Link href={`/meetings/${m.id}`}>
                  <Card className="group p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <span
                          className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary"
                          aria-hidden
                        >
                          <CalendarDays className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge tone="brand">{KIND_LABEL[m.kind]}</Badge>
                            {!m.isPublic && <Badge tone="neutral">Closed</Badge>}
                            {m.minutesPublished && (
                              <Badge tone="success">
                                <CheckCircle2 className="h-3 w-3" />
                                Minutes published
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-body font-semibold text-ink group-hover:text-brand-primary">
                            {m.title}
                          </h3>
                          <p className="mt-0.5 text-small text-muted">{m.summary}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-micro text-muted">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" /> {formatDate(m.startAt, 'en', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3 w-3" />
                              {new Date(m.startAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {m.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-micro text-muted">Chair</div>
                        <div className="text-small font-medium text-ink">{m.chair}</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
