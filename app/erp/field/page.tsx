'use client';

// Mobile field-officer inspection view (spec §3.2
// "Mobile inspection app — offline-capable" Phase
// 2). This is the companion "app" built into the
// ERP shell — mobile-first checklist for each
// scheduled inspection with photo + note check-in.

import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  Send,
  User2,
  WifiOff,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  INSPECTION_LABEL,
  INSPECTION_TONE,
  INSPECTIONS,
  type Inspection,
} from '@/mocks/fixtures/inspections';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

interface CheckState {
  arrival?: string;
  note: string;
  photoPreview?: string;
  outcome?: 'pass' | 'action' | 'fail';
  submittedAt?: string;
}

const CHECKLIST: Record<Inspection['kind'], string[]> = {
  'business-licence': [
    'Premises address matches application',
    'Signage & trading hours compliant',
    'Fire extinguisher present & in date',
    'Refuse receptacles adequate',
    'No unauthorised alterations',
  ],
  'building-plan': [
    'Setbacks observed',
    'Foundation depth correct',
    'Approved plan on site',
    'Construction safety signage',
    'Waste disposal plan in place',
  ],
  health: [
    'Water source protected',
    'Sanitary facilities functional',
    'Food-handling surfaces clean',
    'Pest-control evidence',
    'Medical certificates current',
  ],
  environment: [
    'No illegal dumping on site',
    'Drainage flowing freely',
    'Vegetation buffer intact',
    'No effluent runoff',
    'Complaint addressed',
  ],
};

export default function FieldOfficerPage() {
  const upcoming = useMemo(
    () =>
      INSPECTIONS.filter(
        (i) => i.status === 'scheduled' && new Date(i.scheduledAt) >= new Date(),
      ).sort((a, b) => (a.scheduledAt < b.scheduledAt ? -1 : 1)),
    [],
  );
  const [index, setIndex] = useState(0);
  const [states, setStates] = useState<Record<string, CheckState>>({});
  const [ticks, setTicks] = useState<Record<string, Set<string>>>({});

  const active = upcoming[index];

  if (!active) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-10">
        <EmptyState
          icon={<CheckCircle2 className="h-8 w-8" />}
          title="No upcoming inspections assigned."
          description="New assignments sync to your device as the schedule is updated."
        />
      </div>
    );
  }

  const state = states[active.id] ?? { note: '' };
  const tickSet = ticks[active.id] ?? new Set<string>();
  const checklist = CHECKLIST[active.kind];
  const tone = INSPECTION_TONE[active.kind];
  const allTicked = checklist.every((item) => tickSet.has(item));

  const setStateFor = (patch: Partial<CheckState>) =>
    setStates((prev) => ({ ...prev, [active.id]: { ...(prev[active.id] ?? { note: '' }), ...patch } }));

  const toggleTick = (item: string) => {
    setTicks((prev) => {
      const curr = new Set(prev[active.id] ?? []);
      if (curr.has(item)) curr.delete(item);
      else curr.add(item);
      return { ...prev, [active.id]: curr };
    });
  };

  const onPhoto = (file: File) => {
    const r = new FileReader();
    r.onload = () => setStateFor({ photoPreview: String(r.result ?? '') });
    r.readAsDataURL(file);
  };

  const submit = () => {
    if (!state.outcome) return toast({ title: 'Pick an outcome.', tone: 'danger' });
    if (!allTicked) return toast({ title: 'Check every item or add a note.', tone: 'danger' });
    setStateFor({ submittedAt: new Date().toISOString() });
    toast({
      title: 'Inspection submitted',
      description: 'Syncs when back online.',
      tone: 'success',
    });
  };

  const checkIn = () => {
    setStateFor({ arrival: new Date().toISOString() });
    toast({ title: 'Checked in', description: 'Timestamp + location recorded.', tone: 'info' });
  };

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:py-8">
      <ScrollReveal>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-micro font-semibold uppercase tracking-wide text-muted">
              <WifiOff className="h-3 w-3" /> Field mode
            </div>
            <h1 className="mt-1 text-h1 text-ink sm:text-[1.625rem]">Your route</h1>
            <p className="text-small text-muted">
              Inspection {index + 1} of {upcoming.length} — swipe with the arrows.
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIndex((i) => Math.min(upcoming.length - 1, i + 1))}
              disabled={index === upcoming.length - 1}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex items-start gap-3 border-b border-line p-4">
          <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-md', tone.bg, tone.text)}>
            <Clock3 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <Badge tone="brand">{INSPECTION_LABEL[active.kind]}</Badge>
            <h2 className="mt-2 text-body font-semibold text-ink">{active.title}</h2>
            <ul className="mt-1 space-y-1 text-micro text-muted">
              <li className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3 w-3" />
                {formatDate(active.scheduledAt, 'en', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {active.durationMinutes}m
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {active.address} · {active.ward}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <User2 className="h-3 w-3" />
                {active.officer}
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          {/* Check-in */}
          <div className="rounded-md border border-line bg-surface/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-small font-semibold text-ink">Arrival check-in</div>
                <div className="text-micro text-muted">
                  {state.arrival
                    ? `Checked in ${formatRelative(state.arrival)}`
                    : 'Tap to record arrival (GPS + time)'}
                </div>
              </div>
              <Button
                size="sm"
                variant={state.arrival ? 'ghost' : 'primary'}
                onClick={checkIn}
                leadingIcon={<MapPin className="h-3.5 w-3.5" />}
                disabled={!!state.arrival}
              >
                {state.arrival ? 'Recorded' : 'Check in'}
              </Button>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <Label>Checklist</Label>
            <ul className="mt-1 grid gap-1.5">
              {checklist.map((item) => {
                const checked = tickSet.has(item);
                return (
                  <li key={item}>
                    <label
                      className={cn(
                        'flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-small cursor-pointer transition-colors',
                        checked
                          ? 'border-success/30 bg-success/5 text-success'
                          : 'border-line bg-card text-ink hover:border-brand-primary/25',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTick(item)}
                        className="mt-0.5 h-4 w-4 rounded border-line text-brand-primary focus:ring-brand-primary/40"
                      />
                      <span>{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Photo */}
          <div>
            <Label>Photo evidence</Label>
            {state.photoPreview ? (
              <div className="relative mt-1 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.photoPreview}
                  alt="Inspection evidence"
                  className="max-h-56 rounded-md border border-line"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setStateFor({ photoPreview: undefined })}
                >
                  Retake
                </Button>
              </div>
            ) : (
              <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-line bg-card px-3.5 py-2.5 text-small text-muted hover:border-brand-primary/40 hover:text-ink">
                <Camera className="h-4 w-4" />
                Take photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])}
                />
              </label>
            )}
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="field-note">Notes</Label>
            <textarea
              id="field-note"
              rows={3}
              value={state.note}
              onChange={(e) => setStateFor({ note: e.target.value })}
              placeholder="Anything noteworthy, or the reason you're failing an item."
              className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
            />
          </div>

          {/* Outcome */}
          <div>
            <Label>Outcome</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['pass', 'action', 'fail'] as const).map((o) => {
                const active = state.outcome === o;
                const palette = o === 'pass' ? 'success' : o === 'action' ? 'warning' : 'danger';
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setStateFor({ outcome: o })}
                    className={cn(
                      'rounded-md border px-3 py-2.5 text-small font-medium capitalize transition-colors',
                      active
                        ? palette === 'success'
                          ? 'border-success bg-success/10 text-success'
                          : palette === 'warning'
                            ? 'border-warning bg-warning/10 text-warning'
                            : 'border-danger bg-danger/10 text-danger'
                        : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    )}
                  >
                    {o === 'pass' ? 'Pass' : o === 'action' ? 'Action required' : 'Fail'}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={submit} leadingIcon={<Send className="h-4 w-4" />} disabled={!!state.submittedAt}>
            {state.submittedAt ? 'Submitted — will sync' : 'Submit inspection'}
          </Button>
        </div>
      </Card>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-info/20 bg-info/8 p-3 text-small text-info">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Field mode works offline — inspections are saved on your device and auto-sync next time
          you're online. Your caseload is pre-downloaded at the start of the shift.
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-line bg-card p-3 text-micro text-muted">
        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Report app issues: +263 39 2 000 000 · ops@bikita.gov.zw
      </div>
    </div>
  );
}
