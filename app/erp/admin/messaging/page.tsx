'use client';

// Admin bulk messaging (spec §3.2). Compose a
// message, pick a segment, choose channels, send
// now or schedule. Delivery log surfaces
// delivered / failed counts.

import {
  Clock3,
  FileText,
  MessageSquare,
  Send,
  Smartphone,
  Trash2,
  Mail,
  Bot,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  SEGMENT_LABEL,
  estimateSegmentSize,
  useCampaignsStore,
  type Campaign,
  type CampaignChannel,
  type SegmentId,
} from '@/lib/stores/campaigns';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

const CHANNEL_META: Record<
  CampaignChannel,
  { label: string; Icon: LucideIcon; tint: string }
> = {
  sms:      { label: 'SMS',      Icon: Smartphone, tint: 'bg-brand-primary/10 text-brand-primary' },
  whatsapp: { label: 'WhatsApp', Icon: Bot,        tint: 'bg-success/10 text-success' },
  email:    { label: 'Email',    Icon: Mail,       tint: 'bg-info/10 text-info' },
};

export default function MessagingAdminPage() {
  const items = useCampaignsStore((s) => s.items);
  const create = useCampaignsStore((s) => s.create);
  const schedule = useCampaignsStore((s) => s.schedule);
  const sendNow = useCampaignsStore((s) => s.send);
  const cancel = useCampaignsStore((s) => s.cancel);
  const remove = useCampaignsStore((s) => s.remove);
  const { fullName } = useCurrentUser();

  const [name, setName] = useState('');
  const [segment, setSegment] = useState<SegmentId>('overdue');
  const [channels, setChannels] = useState<CampaignChannel[]>(['sms']);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');

  const size = useMemo(() => estimateSegmentSize(segment), [segment]);

  const toggleChannel = (c: CampaignChannel) => {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const createCampaign = (mode: 'draft' | 'schedule' | 'send') => {
    if (!name.trim() || !body.trim()) {
      return toast({ title: 'Name and body are required.', tone: 'danger' });
    }
    if (channels.length === 0) return toast({ title: 'Pick at least one channel.', tone: 'danger' });
    if (channels.includes('email') && !subject.trim()) {
      return toast({ title: 'Email subject is required.', tone: 'danger' });
    }
    const c = create({
      name: name.trim(),
      channels,
      segment,
      subject: subject.trim() || undefined,
      body: body.trim(),
      recipients: size,
      createdBy: fullName ?? 'Admin',
    });

    if (mode === 'schedule') {
      if (!scheduleAt) return toast({ title: 'Pick a send date.', tone: 'danger' });
      schedule(c.id, new Date(scheduleAt).toISOString());
      toast({ title: 'Scheduled', description: `${c.name} will send ${formatDate(scheduleAt)}.`, tone: 'success' });
    } else if (mode === 'send') {
      sendNow(c.id);
      toast({
        title: 'Sent',
        description: `${c.name} dispatched to ${size.toLocaleString()} recipients.`,
        tone: 'success',
      });
    } else {
      toast({ title: 'Saved as draft', tone: 'info' });
    }

    setName('');
    setSubject('');
    setBody('');
    setScheduleAt('');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Bulk messaging</h1>
          <p className="mt-1 text-small text-muted">
            Compose an SMS / WhatsApp / email campaign for a segmented audience. Send now, schedule, or
            save a draft.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-h3 text-ink">Compose</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="cmp-name">Campaign name</Label>
              <Input id="cmp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. April billing reminder" />
            </div>
            <div>
              <Label>Audience</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SEGMENT_LABEL) as SegmentId[]).map((s) => {
                  const active = segment === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSegment(s)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                        active
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-line bg-card text-ink hover:border-brand-primary/30',
                      )}
                    >
                      {SEGMENT_LABEL[s]}
                      <span className="ml-1.5 text-[10px] tabular-nums text-muted">· {estimateSegmentSize(s)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-micro text-muted">
                Estimated recipients: <span className="font-semibold tabular-nums text-ink">{size}</span>
              </p>
            </div>
            <div>
              <Label>Channels</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(CHANNEL_META) as CampaignChannel[]).map((c) => {
                  const meta = CHANNEL_META[c];
                  const active = channels.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleChannel(c)}
                      className={cn(
                        'flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                          : 'border-line bg-card hover:border-brand-primary/25',
                      )}
                    >
                      <span className={`grid h-9 w-9 place-items-center rounded-md ${meta.tint}`}>
                        <meta.Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-small font-semibold text-ink">{meta.label}</div>
                        <div className="text-micro text-muted">
                          {c === 'sms' && 'Up to 160 chars per segment'}
                          {c === 'whatsapp' && 'Rich text, up to 4 kB'}
                          {c === 'email' && 'Plain text + links'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {channels.includes('email') && (
              <div>
                <Label htmlFor="cmp-subject">Email subject</Label>
                <Input id="cmp-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
            )}
            <div>
              <Label htmlFor="cmp-body">Message</Label>
              <textarea
                id="cmp-body"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
              />
              <p className="mt-1 text-micro text-muted">
                {body.length} chars · SMS will split every 160.
              </p>
            </div>
            <div>
              <Label htmlFor="cmp-when">Schedule (optional)</Label>
              <Input
                id="cmp-when"
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => createCampaign('draft')}>
                Save draft
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => createCampaign('schedule')}
                leadingIcon={<Clock3 className="h-3.5 w-3.5" />}
              >
                Schedule
              </Button>
              <Button onClick={() => createCampaign('send')} leadingIcon={<Send className="h-4 w-4" />}>
                Send now
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted" />
              <h3 className="text-small font-semibold text-ink">Delivery log</h3>
            </div>
            <Badge tone="brand">{items.length}</Badge>
          </div>
          {items.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState icon={<MessageSquare className="h-8 w-8" />} title="No campaigns yet." />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((c) => (
                <CampaignRow key={c.id} campaign={c} onSend={() => sendNow(c.id)} onCancel={() => cancel(c.id)} onRemove={() => remove(c.id)} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function CampaignRow({
  campaign: c,
  onSend,
  onCancel,
  onRemove,
}: {
  campaign: Campaign;
  onSend: () => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const tone =
    c.status === 'sent' ? 'success' : c.status === 'scheduled' ? 'warning' : c.status === 'cancelled' ? 'neutral' : 'brand';
  const deliveredPct = c.delivered && c.recipients ? (c.delivered / c.recipients) * 100 : 0;

  return (
    <li className="px-5 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={tone}>{c.status}</Badge>
            <span className="text-small font-semibold text-ink">{c.name}</span>
          </div>
          <div className="mt-0.5 text-micro text-muted">
            {SEGMENT_LABEL[c.segment]} · {c.recipients.toLocaleString()} recipients · {c.channels.join(', ')}
          </div>
          <p className="mt-1 line-clamp-2 text-micro text-ink">{c.body}</p>
          {c.status === 'sent' && c.delivered != null && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-micro text-muted">
                <span>Delivered</span>
                <span className="tabular-nums">
                  {c.delivered.toLocaleString()} / {c.recipients.toLocaleString()} ({deliveredPct.toFixed(1)}%)
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <span className="block h-full rounded-full bg-success" style={{ width: `${deliveredPct}%` }} />
              </div>
            </div>
          )}
          <div className="mt-1 text-[10px] text-muted">
            {c.status === 'scheduled' && c.scheduledAt && `Sends ${formatDate(c.scheduledAt)} · `}
            {c.status === 'sent' && c.sentAt && `Sent ${formatRelative(c.sentAt)} · `}
            Created by {c.createdBy}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {c.status === 'draft' && (
            <Button size="sm" onClick={onSend} leadingIcon={<Send className="h-3.5 w-3.5" />}>
              Send
            </Button>
          )}
          {c.status === 'scheduled' && (
            <>
              <Button size="sm" onClick={onSend} leadingIcon={<Send className="h-3.5 w-3.5" />}>
                Send now
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </>
          )}
          {(c.status === 'sent' || c.status === 'cancelled' || c.status === 'draft') && (
            <Button variant="ghost" size="sm" onClick={onRemove} leadingIcon={<Trash2 className="h-3.5 w-3.5" />}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
