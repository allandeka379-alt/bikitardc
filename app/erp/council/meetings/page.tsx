// Council meetings list.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import {
  COUNCIL_MEETINGS,
  KIND_LABEL,
  MEETING_STATUS_LABEL,
  MEETING_STATUS_TONE,
} from '@/mocks/fixtures/council';

export default function MeetingsListPage() {
  const sorted = [...COUNCIL_MEETINGS].sort((a, b) => (a.startsAt < b.startsAt ? 1 : -1));
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/council" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Council workflow
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Meetings</h1>
          <p className="mt-1 text-small text-muted">{COUNCIL_MEETINGS.length} meetings across all committees.</p>
        </div>
      </ScrollReveal>

      <ul className="grid gap-3 md:grid-cols-2">
        {sorted.map((m) => (
          <li key={m.id}>
            <Link href={`/erp/council/meetings/${m.id}`} className="block">
              <Card className="h-full p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{KIND_LABEL[m.kind]}</Badge>
                  <Badge tone={MEETING_STATUS_TONE[m.status]} dot>{MEETING_STATUS_LABEL[m.status]}</Badge>
                  <span className="font-mono text-micro text-muted">{m.reference}</span>
                </div>
                <h2 className="text-body font-semibold text-ink">{m.title}</h2>
                <div className="mt-1 text-small text-muted">
                  {formatDate(m.startsAt)} · {m.venue}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-micro">
                  <div><div className="text-muted">Chair</div><div className="text-ink">{m.chair}</div></div>
                  <div><div className="text-muted">Secretary</div><div className="text-ink">{m.secretary}</div></div>
                  <div><div className="text-muted">Agenda</div><div className="text-ink">{m.agenda.length} items</div></div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
