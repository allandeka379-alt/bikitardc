'use client';

// ─────────────────────────────────────────────
// Report an issue — citizen-side wizard (spec §3.1).
// 3 steps: category → details → review + submit.
// Auto-routes to the right team based on category.
// ─────────────────────────────────────────────

import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Construction,
  Droplets,
  Flag,
  Hospital,
  Lightbulb,
  MapPin,
  Send,
  Trash2,
  TriangleAlert,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { teamForCategory } from '@/lib/hooks/use-service-requests';
import { useErpStore } from '@/lib/stores/erp';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import {
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  type RequestCategory,
  type ServiceRequest,
} from '@/mocks/fixtures/service-requests';
import { cn } from '@/lib/cn';

const LocationPicker = dynamic(() => import('@/components/portal/location-picker'), {
  ssr: false,
  loading: () => (
    <div className="grid h-[320px] w-full place-items-center rounded-md border border-line bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-brand-primary" />
    </div>
  ),
});

interface CategoryTile {
  id: RequestCategory;
  label: string;
  Icon: LucideIcon;
  slaHours: number;
  tagline: string;
}

const CATEGORIES: CategoryTile[] = [
  { id: 'water',             label: CATEGORY_LABEL.water,               Icon: Droplets,    slaHours: 24, tagline: 'Boreholes, pipes, taps.' },
  { id: 'road',              label: CATEGORY_LABEL.road,                Icon: Construction, slaHours: 48, tagline: 'Potholes, bridges, signage.' },
  { id: 'refuse',            label: CATEGORY_LABEL.refuse,              Icon: Trash2,      slaHours: 72, tagline: 'Refuse, illegal dumping.' },
  { id: 'drainage',          label: CATEGORY_LABEL.drainage,            Icon: Waves,       slaHours: 72, tagline: 'Flooding, blocked drains.' },
  { id: 'streetlight',       label: CATEGORY_LABEL.streetlight,         Icon: Lightbulb,   slaHours: 96, tagline: 'Streetlights, public safety.' },
  { id: 'illegal-structure', label: CATEGORY_LABEL['illegal-structure'], Icon: AlertOctagon, slaHours: 120, tagline: 'Unauthorised builds.' },
  { id: 'health',            label: CATEGORY_LABEL.health,              Icon: Hospital,    slaHours: 48, tagline: 'Health hazards, outbreaks.' },
];

const STEPS = [
  { id: 'category', label: 'Category' },
  { id: 'details',  label: 'Details'  },
  { id: 'review',   label: 'Review'   },
];

interface ReportForm {
  category: RequestCategory | null;
  title: string;
  description: string;
  latlng: [number, number] | null;
  ward: string;
  photoPreview: string | null;
}

const EMPTY: ReportForm = {
  category: null,
  title: '',
  description: '',
  latlng: null,
  ward: '',
  photoPreview: null,
};

export default function ReportPage() {
  const router = useRouter();
  const { userId, fullName } = useCurrentUser();
  const me = DEMO_USERS.find((u) => u.id === userId);
  const submit = useErpStore((s) => s.submitServiceRequest);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ReportForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof ReportForm>(key: K, value: ReportForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (s: number): string | null => {
    if (s === 0 && !form.category) return 'Pick a category.';
    if (s === 1) {
      if (!form.title.trim()) return 'Add a short title for the issue.';
      if (!form.description.trim()) return 'Describe the issue briefly.';
      if (!form.latlng) return 'Tap the map to place a pin on the location.';
      if (!form.ward.trim()) return 'Enter the ward (e.g. Nyika).';
    }
    return null;
  };

  const next = () => {
    const err = validate(step);
    if (err) return toast({ title: err, tone: 'danger' });
    if (step < STEPS.length - 1) setStep(step + 1);
    else actuallySubmit();
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const actuallySubmit = () => {
    if (!form.category || !form.latlng || !userId) return;
    setSubmitting(true);

    const ref = `SR-${new Date().getFullYear()}-${String(
      5000 + Math.floor(Math.random() * 4999),
    )}`;

    const sla = CATEGORIES.find((c) => c.id === form.category)!.slaHours;
    const now = new Date().toISOString();
    const team = teamForCategory(form.category);

    const req: ServiceRequest = {
      id: `sr_rt_${Math.random().toString(36).slice(2, 10)}`,
      reference: ref,
      category: form.category,
      title: form.title,
      description: form.description,
      reporterName: fullName ?? 'Resident',
      reporterPhone: me?.phone ?? '+263771234567',
      ward: form.ward,
      lat: form.latlng[0],
      lng: form.latlng[1],
      photoUrl: form.photoPreview ?? undefined,
      status: 'assigned',
      assignedTeam: team,
      priority: 'normal',
      slaHours: sla,
      createdAt: now,
    };

    submit(req);
    setTimeout(() => {
      toast({
        title: `Ticket ${ref} created`,
        description: `Routed to ${team}. SLA ${sla}h.`,
        tone: 'success',
      });
      router.replace('/portal/requests');
    }, 400);
  };

  const onPhotoSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => set('photoPreview', reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/portal/requests"
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to my requests
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Report an issue</h1>
          <p className="mt-1 text-small text-muted">
            Tell us what's wrong. We'll route your report to the right team and text you updates.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 pb-5 pt-5">
          <Stepper steps={STEPS} current={step} />
        </div>

        <div className="p-5 sm:p-6">
          {step === 0 && <StepCategory form={form} set={set} />}
          {step === 1 && <StepDetails form={form} set={set} onPhotoSelect={onPhotoSelect} />}
          {step === 2 && <StepReview form={form} />}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface/40 px-5 py-4">
          <Button variant="secondary" onClick={back} disabled={step === 0} leadingIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
          <Button
            onClick={next}
            loading={submitting}
            trailingIcon={
              step === STEPS.length - 1 ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />
            }
          >
            {step === STEPS.length - 1 ? 'Submit report' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StepCategory({
  form,
  set,
}: {
  form: ReportForm;
  set: <K extends keyof ReportForm>(k: K, v: ReportForm[K]) => void;
}) {
  return (
    <div>
      <Label>What's the issue about?</Label>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const active = form.category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => set('category', c.id)}
              className={cn(
                'group flex items-start gap-3 rounded-md border px-4 py-3 text-left transition-all duration-base ease-out-expo',
                active
                  ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                  : 'border-line bg-card hover:border-brand-primary/25 hover:shadow-card-sm',
              )}
              aria-pressed={active}
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-white"
                style={{ backgroundColor: CATEGORY_COLOR[c.id] }}
                aria-hidden
              >
                <c.Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-small font-semibold text-ink">{c.label}</span>
                <span className="block truncate-line text-micro text-muted">{c.tagline}</span>
                <Badge tone="neutral" className="mt-1">
                  SLA {c.slaHours}h
                </Badge>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDetails({
  form,
  set,
  onPhotoSelect,
}: {
  form: ReportForm;
  set: <K extends keyof ReportForm>(k: K, v: ReportForm[K]) => void;
  onPhotoSelect: (f: File) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="title">Short title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Broken borehole at Nyika Primary"
        />
      </div>
      <div>
        <Label htmlFor="description">What's happening?</Label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Describe the issue, how long it's been happening, and how many people are affected."
          className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div>
          <Label>Where is it?</Label>
          <p className="mb-2 text-micro text-muted">Tap the map to place a pin on the exact spot.</p>
          <LocationPicker value={form.latlng} onChange={(ll) => set('latlng', ll)} />
          {form.latlng && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-micro text-muted">
              <MapPin className="h-3 w-3" />
              <span className="font-mono tabular-nums text-ink">
                {form.latlng[0].toFixed(5)}, {form.latlng[1].toFixed(5)}
              </span>
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="ward">Ward</Label>
          <Input
            id="ward"
            value={form.ward}
            onChange={(e) => set('ward', e.target.value)}
            placeholder="e.g. Nyika"
          />
        </div>
      </div>

      <div>
        <Label>Photo (optional)</Label>
        <p className="text-micro text-muted">
          A picture helps the field team know what to expect.
        </p>
        {form.photoPreview ? (
          <div className="relative mt-2 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.photoPreview}
              alt="Photo preview"
              className="max-h-40 rounded-md border border-line"
            />
            <button
              type="button"
              onClick={() => set('photoPreview', null)}
              className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-white hover:bg-ink"
              aria-label="Remove photo"
            >
              <TriangleAlert className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-line bg-card px-3.5 py-2.5 text-small text-muted hover:border-brand-primary/40 hover:text-ink">
            <Camera className="h-4 w-4" />
            Take / upload photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPhotoSelect(e.target.files[0])}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function StepReview({ form }: { form: ReportForm }) {
  const tile = CATEGORIES.find((c) => c.id === form.category)!;
  const team = form.category ? teamForCategory(form.category) : '';

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-4 text-small text-brand-primary">
        <div className="mb-1 inline-flex items-center gap-1.5 font-semibold">
          <Flag className="h-3.5 w-3.5" />
          Auto-routing
        </div>
        <p>
          This report will be routed to <span className="font-semibold">{team}</span> with an SLA of{' '}
          <span className="font-semibold">{tile.slaHours} hours</span>. You'll receive SMS and WhatsApp
          updates as the ticket progresses.
        </p>
      </div>

      <Card className="overflow-hidden">
        <dl className="divide-y divide-line px-5 text-small">
          <Row label="Category" value={tile.label} />
          <Row label="Title" value={form.title} />
          <Row label="Description" value={form.description} />
          <Row
            label="Location"
            value={
              form.latlng
                ? `${form.ward} · ${form.latlng[0].toFixed(4)}, ${form.latlng[1].toFixed(4)}`
                : '—'
            }
          />
          <Row label="Photo" value={form.photoPreview ? 'Attached' : 'None'} />
        </dl>
      </Card>

      <div className="flex items-start gap-2 rounded-md border border-success/20 bg-success/6 p-3 text-small text-success">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>A ticket reference and SLA clock will appear immediately after you submit.</span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] whitespace-pre-line text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
