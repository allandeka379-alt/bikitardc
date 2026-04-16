'use client';

// ─────────────────────────────────────────────
// Admin content editor — spec §3.2 "Content
// management (news, by-laws, tenders)" Demo-Visual.
//
// Lightweight CRUD-lite over the ContentStore:
// items published here show up on the public
// /news, /meetings and /tenders pages alongside
// the seeded fixtures.
// ─────────────────────────────────────────────

import { CalendarClock, FileText, Gavel, Megaphone, Send, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/format';
import { useContentStore } from '@/lib/stores/content';
import type { MeetingKind } from '@/mocks/fixtures/meetings';
import type { NewsCategory } from '@/mocks/fixtures/news';
import { cn } from '@/lib/cn';

const NEWS_CATEGORIES: NewsCategory[] = ['notice', 'event', 'alert', 'tender', 'update'];
const MEETING_KINDS: MeetingKind[] = ['full-council', 'committee', 'special', 'public-hearing'];

export default function AdminContentPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Content management</h1>
          <p className="mt-1 text-small text-muted">
            Publish news, schedule meetings and post tender notices. Everything lands on the public site
            immediately.
          </p>
        </div>
      </ScrollReveal>

      <Tabs defaultValue="news">
        <TabsList className="flex-wrap">
          <TabsTrigger value="news">
            <Megaphone className="h-3.5 w-3.5" />
            News
          </TabsTrigger>
          <TabsTrigger value="meetings">
            <CalendarClock className="h-3.5 w-3.5" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="tenders">
            <Gavel className="h-3.5 w-3.5" />
            Tenders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <NewsEditor />
        </TabsContent>
        <TabsContent value="meetings">
          <MeetingEditor />
        </TabsContent>
        <TabsContent value="tenders">
          <TenderEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── News ───────────────────────────────────

function NewsEditor() {
  const extra = useContentStore((s) => s.extraNews);
  const publish = useContentStore((s) => s.publishNews);
  const remove = useContentStore((s) => s.removeNews);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<NewsCategory>('notice');
  const [ward, setWard] = useState('');

  const save = () => {
    if (!title.trim() || !summary.trim()) {
      return toast({ title: 'Title and summary are required.', tone: 'danger' });
    }
    publish({
      id: `n_${Math.random().toString(36).slice(2, 10)}`,
      title: title.trim(),
      summary: summary.trim(),
      category,
      date: new Date().toISOString(),
      ward: ward.trim() || undefined,
    });
    toast({ title: 'Published', description: 'Visible on /news now.', tone: 'success' });
    setTitle('');
    setSummary('');
    setWard('');
    setCategory('notice');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card className="p-5 sm:p-6">
        <h2 className="text-h3 text-ink">Publish a news item</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="news-title">Title</Label>
            <Input
              id="news-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Planned water outage — Mupani Ward"
            />
          </div>
          <div>
            <Label htmlFor="news-summary">Summary</Label>
            <textarea
              id="news-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {NEWS_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-micro font-medium capitalize transition-colors',
                      category === c
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="news-ward">Ward (optional)</Label>
              <Input
                id="news-ward"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Mupani"
              />
            </div>
          </div>
          <Button onClick={save} leadingIcon={<Send className="h-4 w-4" />}>
            Publish news item
          </Button>
        </div>
      </Card>

      <PublishedList
        title="Published by admins"
        emptyLabel="No news items published via the editor yet."
        items={extra.map((n) => ({
          id: n.id,
          line1: n.title,
          line2: `${n.category} · ${formatDate(n.date)}${n.ward ? ` · ${n.ward}` : ''}`,
        }))}
        onRemove={remove}
      />
    </div>
  );
}

// ─── Meetings ───────────────────────────────

function MeetingEditor() {
  const extra = useContentStore((s) => s.extraMeetings);
  const publish = useContentStore((s) => s.publishMeeting);
  const remove = useContentStore((s) => s.removeMeeting);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [venue, setVenue] = useState('');
  const [chair, setChair] = useState('');
  const [date, setDate] = useState('');
  const [durationHours, setDurationHours] = useState(3);
  const [kind, setKind] = useState<MeetingKind>('full-council');

  const save = () => {
    if (!title.trim() || !venue.trim() || !chair.trim() || !date) {
      return toast({ title: 'All fields are required.', tone: 'danger' });
    }
    const start = new Date(date);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    publish({
      id: `m_${Math.random().toString(36).slice(2, 10)}`,
      reference: `BRDC/M/${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}/${kind === 'full-council' ? 'FC' : kind === 'committee' ? 'CM' : kind === 'public-hearing' ? 'PH' : 'SP'}`,
      title: title.trim(),
      kind,
      status: 'scheduled',
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      venue: venue.trim(),
      chair: chair.trim(),
      attendeesExpected: 20,
      isPublic: kind !== 'committee',
      agenda: [],
      minutesPublished: false,
      summary: summary.trim(),
    });
    toast({ title: 'Meeting scheduled', description: 'Visible on /meetings now.', tone: 'success' });
    setTitle('');
    setSummary('');
    setVenue('');
    setChair('');
    setDate('');
    setDurationHours(3);
    setKind('full-council');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card className="p-5 sm:p-6">
        <h2 className="text-h3 text-ink">Schedule a meeting</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="m-title">Title</Label>
            <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="m-summary">Summary</Label>
            <Input id="m-summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Kind</Label>
              <div className="flex flex-wrap gap-1.5">
                {MEETING_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-micro font-medium capitalize transition-colors',
                      kind === k
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    )}
                  >
                    {k.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="m-date">Date & time</Label>
              <Input id="m-date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="m-venue">Venue</Label>
              <Input id="m-venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="m-chair">Chair</Label>
              <Input id="m-chair" value={chair} onChange={(e) => setChair(e.target.value)} />
            </div>
          </div>
          <Button onClick={save} leadingIcon={<Send className="h-4 w-4" />}>
            Schedule meeting
          </Button>
        </div>
      </Card>

      <PublishedList
        title="Published by admins"
        emptyLabel="No meetings scheduled via the editor yet."
        items={extra.map((m) => ({
          id: m.id,
          line1: m.title,
          line2: `${m.kind.replace('-', ' ')} · ${formatDate(m.startAt)} · ${m.venue}`,
        }))}
        onRemove={remove}
      />
    </div>
  );
}

// ─── Tenders ───────────────────────────────

function TenderEditor() {
  const extra = useContentStore((s) => s.extraTenders);
  const publish = useContentStore((s) => s.publishTender);
  const remove = useContentStore((s) => s.removeTender);

  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [closing, setClosing] = useState('');
  const [value, setValue] = useState(0);

  const save = () => {
    if (!title.trim() || !reference.trim() || !closing || !value) {
      return toast({ title: 'All fields are required.', tone: 'danger' });
    }
    publish({
      id: `t_${Math.random().toString(36).slice(2, 10)}`,
      title: title.trim(),
      reference: reference.trim(),
      closingDate: new Date(closing).toISOString(),
      estimatedValueUsd: Number(value),
      status: 'open',
    });
    toast({ title: 'Tender published', description: 'Visible on /tenders now.', tone: 'success' });
    setTitle('');
    setReference('');
    setClosing('');
    setValue(0);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card className="p-5 sm:p-6">
        <h2 className="text-h3 text-ink">Publish a tender</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="t-ref">Reference</Label>
              <Input
                id="t-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="BRDC/2026/T/004"
              />
            </div>
            <div>
              <Label htmlFor="t-close">Closing date</Label>
              <Input id="t-close" type="date" value={closing} onChange={(e) => setClosing(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="t-value">Estimated value (USD)</Label>
            <Input
              id="t-value"
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>
          <Button onClick={save} leadingIcon={<Send className="h-4 w-4" />}>
            Publish tender
          </Button>
        </div>
      </Card>

      <PublishedList
        title="Published by admins"
        emptyLabel="No tenders published via the editor yet."
        items={extra.map((t) => ({
          id: t.id,
          line1: t.title,
          line2: `${t.reference} · Closes ${formatDate(t.closingDate)}`,
        }))}
        onRemove={remove}
      />
    </div>
  );
}

// ─── Shared right-rail list ─────────────────

function PublishedList({
  title,
  emptyLabel,
  items,
  onRemove,
}: {
  title: string;
  emptyLabel: string;
  items: { id: string; line1: string; line2: string }[];
  onRemove: (id: string) => void;
}) {
  const sorted = useMemo(() => [...items].reverse(), [items]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted" />
          <h3 className="text-small font-semibold text-ink">{title}</h3>
        </div>
        <Badge tone="brand">{items.length}</Badge>
      </div>
      {sorted.length === 0 ? (
        <div className="px-5 py-10 text-center text-small text-muted">{emptyLabel}</div>
      ) : (
        <ul className="divide-y divide-line">
          {sorted.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <div className="truncate-line text-small font-medium text-ink">{it.line1}</div>
                <div className="truncate-line text-micro text-muted">{it.line2}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(it.id)}
                leadingIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
