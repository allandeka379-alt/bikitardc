'use client';

// Admin publisher for site-wide alerts (spec §3.1
// emergency + service-disruption + info banners).

import { Info, Send, Siren, Trash2, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { formatRelative } from '@/lib/format';
import { useAlertsStore, type AlertTone, type SiteAlert } from '@/lib/stores/alerts';
import { cn } from '@/lib/cn';

const TONES: { id: AlertTone; label: string; desc: string; Icon: LucideIcon }[] = [
  { id: 'emergency',           label: 'Emergency',           desc: 'Red banner — floods, outbreaks, safety alerts.', Icon: Siren },
  { id: 'service-disruption',  label: 'Service disruption',  desc: 'Amber banner — water, road or refuse outages.',  Icon: TriangleAlert },
  { id: 'info',                label: 'Info',                desc: 'Navy banner — public hearings, procedural notices.', Icon: Info },
];

export default function AlertsAdminPage() {
  const items = useAlertsStore((s) => s.items);
  const publish = useAlertsStore((s) => s.publish);
  const expire = useAlertsStore((s) => s.expire);
  const remove = useAlertsStore((s) => s.remove);
  const { fullName } = useCurrentUser();

  const [tone, setTone] = useState<AlertTone>('service-disruption');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [wards, setWards] = useState('');
  const [expires, setExpires] = useState('');
  const [href, setHref] = useState('/news');

  const save = () => {
    if (!title.trim() || !body.trim()) {
      return toast({ title: 'Title and body are required.', tone: 'danger' });
    }
    publish({
      tone,
      title: title.trim(),
      body: body.trim(),
      href: href.trim() || undefined,
      wards: wards
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean),
      startsAt: new Date().toISOString(),
      expiresAt: expires ? new Date(expires).toISOString() : null,
      createdBy: fullName ?? 'Admin',
    });
    toast({ title: 'Alert published', description: 'Live on every page now.', tone: 'success' });
    setTitle('');
    setBody('');
    setWards('');
    setExpires('');
  };

  const now = Date.now();
  const isActive = (a: SiteAlert) => {
    const starts = new Date(a.startsAt).getTime();
    if (starts > now) return false;
    if (a.expiresAt && new Date(a.expiresAt).getTime() <= now) return false;
    return true;
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Site-wide alerts</h1>
          <p className="mt-1 text-small text-muted">
            Publish emergency, service-disruption or informational banners. Everyone sees them until they
            expire or are dismissed.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-h3 text-ink">Publish an alert</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label>Severity</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {TONES.map((t) => {
                  const active = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={cn(
                        'flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-all duration-base ease-out-expo',
                        active
                          ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                          : 'border-line bg-card hover:border-brand-primary/25',
                      )}
                      aria-pressed={active}
                    >
                      <span
                        className={cn(
                          'grid h-8 w-8 place-items-center rounded-md text-white',
                          t.id === 'emergency' ? 'bg-danger' : t.id === 'service-disruption' ? 'bg-warning' : 'bg-brand-primary',
                        )}
                      >
                        <t.Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-small font-semibold text-ink">{t.label}</span>
                        <span className="block text-micro text-muted">{t.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="a-title">Title</Label>
              <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="a-body">Message</Label>
              <textarea
                id="a-body"
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="a-wards">Affected wards (optional, comma-separated)</Label>
                <Input
                  id="a-wards"
                  value={wards}
                  onChange={(e) => setWards(e.target.value)}
                  placeholder="Mupani, Nyika"
                />
              </div>
              <div>
                <Label htmlFor="a-expires">Expires (optional)</Label>
                <Input
                  id="a-expires"
                  type="datetime-local"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="a-href">Link to (optional)</Label>
              <Input id="a-href" value={href} onChange={(e) => setHref(e.target.value)} placeholder="/news" />
            </div>
            <Button onClick={save} leadingIcon={<Send className="h-4 w-4" />}>
              Publish alert
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h3 className="text-small font-semibold text-ink">Alert history</h3>
            <Badge tone="brand">{items.length}</Badge>
          </div>
          {items.length === 0 ? (
            <div className="px-5 py-10 text-center text-small text-muted">No alerts on file.</div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3 text-small">
                  <span
                    className={cn(
                      'mt-0.5 inline-block h-1.5 w-1.5 rounded-full',
                      a.tone === 'emergency'
                        ? 'bg-danger'
                        : a.tone === 'service-disruption'
                          ? 'bg-warning'
                          : 'bg-brand-primary',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-small font-semibold text-ink">{a.title}</span>
                      {isActive(a) ? <Badge tone="success">Live</Badge> : <Badge tone="neutral">Expired</Badge>}
                    </div>
                    <div className="mt-0.5 text-micro text-muted">
                      Published {formatRelative(a.createdAt)} by {a.createdBy}
                      {a.wards.length > 0 && ` · ${a.wards.join(', ')}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {isActive(a) && (
                      <Button variant="ghost" size="sm" onClick={() => expire(a.id)}>
                        Expire now
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(a.id)}
                      leadingIcon={<Trash2 className="h-3.5 w-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
