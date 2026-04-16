'use client';

// ─────────────────────────────────────────────
// Link a property — citizen-side flow (spec §3.1).
//
// Three pathways:
//   • owner    — I own this stand (no verification)
//   • family   — I'm linking a relative's stand
//   • tenant   — I'm a tenant paying on behalf
//
// Owner pathway is auto-linked; the other two
// write a Verification into the ERP store where a
// clerk reviews and approves.
// ─────────────────────────────────────────────

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  File,
  HomeIcon,
  IdCard,
  Send,
  ShieldCheck,
  Users,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DocUploader, type UploadedFile } from '@/components/portal/doc-uploader';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useErpStore } from '@/lib/stores/erp';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import type { Verification, VerificationKind } from '@/mocks/fixtures/verifications';
import { cn } from '@/lib/cn';

type Pathway = 'owner' | 'family' | 'tenant';

interface PathwayDef {
  id: Pathway;
  label: string;
  description: string;
  Icon: LucideIcon;
  kind: VerificationKind | null;
  sla: string;
  requiresReview: boolean;
}

const PATHWAYS: PathwayDef[] = [
  {
    id: 'owner',
    label: "I'm the owner",
    description: 'You hold title to the stand or are the registered ratepayer.',
    Icon: HomeIcon,
    kind: null,
    sla: 'Instant',
    requiresReview: false,
  },
  {
    id: 'family',
    label: 'A family member owns it',
    description: 'You want to pay on behalf of a parent, spouse or sibling.',
    Icon: Users,
    kind: 'family-link',
    sla: '48 working hours',
    requiresReview: true,
  },
  {
    id: 'tenant',
    label: "I'm the tenant",
    description: 'You lease the property and pay rates directly.',
    Icon: UserRound,
    kind: 'tenant-link',
    sla: '48 working hours',
    requiresReview: true,
  },
];

const STEPS = [
  { id: 'pathway',  label: 'Link type' },
  { id: 'property', label: 'Stand' },
  { id: 'confirm',  label: 'Confirm' },
];

interface FormState {
  pathway: Pathway | null;
  standQuery: string;
  ownerName: string;
  relationship: string;
  reason: string;
  documents: UploadedFile[];
}

const EMPTY: FormState = {
  pathway: null,
  standQuery: '',
  ownerName: '',
  relationship: '',
  reason: '',
  documents: [],
};

export default function LinkPropertyPage() {
  const router = useRouter();
  const { userId, fullName } = useCurrentUser();
  const submit = useErpStore((s) => s.submitVerification);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const pathway = useMemo(() => PATHWAYS.find((p) => p.id === form.pathway), [form.pathway]);

  const matchedProperty = useMemo(() => {
    const q = form.standQuery.trim().toLowerCase();
    if (!q) return undefined;
    return PROPERTIES.find(
      (p) =>
        p.stand.toLowerCase().includes(q) ||
        p.id.toLowerCase() === q ||
        p.address.toLowerCase().includes(q),
    );
  }, [form.standQuery]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (s: number): string | null => {
    if (s === 0 && !form.pathway) return 'Pick how you relate to the property.';
    if (s === 1) {
      if (!matchedProperty) return 'Search a stand number we recognise.';
      if (pathway?.id === 'owner' && matchedProperty.ownerId !== userId) {
        return `This stand belongs to ${matchedProperty.ownerName}. Pick "family" or "tenant" instead.`;
      }
      if (pathway?.requiresReview && !form.relationship.trim()) return 'Describe your relationship to the owner.';
    }
    if (s === 2 && pathway?.requiresReview) {
      if (!form.reason.trim()) return 'Add a short reason for the council.';
      if (form.documents.length < 1) return 'Upload at least one supporting document.';
    }
    return null;
  };

  const advance = () => {
    const err = validate(step);
    if (err) return toast({ title: err, tone: 'danger' });
    if (step < STEPS.length - 1) setStep(step + 1);
    else actuallySubmit();
  };

  const actuallySubmit = () => {
    if (!matchedProperty || !userId || !pathway) return;
    setSubmitting(true);

    if (pathway.id === 'owner') {
      toast({
        title: 'Property linked',
        description: `${matchedProperty.stand} is now on your account.`,
        tone: 'success',
      });
      setTimeout(() => router.replace('/portal/properties'), 300);
      return;
    }

    const now = new Date().toISOString();
    const ref = `VR-${new Date().getFullYear()}-${String(9000 + Math.floor(Math.random() * 999))}`;
    const verification: Verification = {
      id: `v_rt_${Math.random().toString(36).slice(2, 10)}`,
      reference: ref,
      kind: pathway.kind!,
      applicantId: userId,
      applicantName: fullName ?? 'Resident',
      subjectPropertyId: matchedProperty.id,
      relationship: form.relationship.trim(),
      note: form.reason.trim(),
      supportingDocs: form.documents.map((d) => ({ label: d.name, type: 'id' })),
      submittedAt: now,
      status: 'pending',
    };

    submit(verification);
    setTimeout(() => {
      toast({
        title: `Verification ${ref} submitted`,
        description: 'A rates clerk will review within 48 working hours.',
        tone: 'success',
      });
      router.replace('/portal/properties');
    }, 300);
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/portal/properties"
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to my properties
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Link a property</h1>
          <p className="mt-1 text-small text-muted">
            Add a stand to your account so you can view statements and pay rates on its behalf.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 pb-5 pt-5">
          <Stepper steps={STEPS} current={step} />
        </div>

        <div className="p-5 sm:p-6">
          {step === 0 && <StepPathway form={form} set={set} />}
          {step === 1 && <StepProperty form={form} set={set} matched={matchedProperty} pathway={pathway} />}
          {step === 2 && <StepConfirm form={form} matched={matchedProperty} pathway={pathway} set={set} />}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface/40 px-5 py-4">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            leadingIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <Button
            onClick={advance}
            loading={submitting}
            trailingIcon={
              step === STEPS.length - 1 ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />
            }
          >
            {step === STEPS.length - 1
              ? pathway?.requiresReview
                ? 'Submit for review'
                : 'Link this property'
              : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StepPathway({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div>
      <Label>How do you relate to this property?</Label>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {PATHWAYS.map((p) => {
          const active = form.pathway === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => set('pathway', p.id)}
              className={cn(
                'flex h-full flex-col items-start gap-3 rounded-md border p-4 text-left transition-all duration-base ease-out-expo',
                active
                  ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                  : 'border-line bg-card hover:border-brand-primary/25 hover:shadow-card-sm',
              )}
              aria-pressed={active}
            >
              <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
                <p.Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-small font-semibold text-ink">{p.label}</div>
                <div className="mt-0.5 text-micro text-muted">{p.description}</div>
              </div>
              <Badge tone={p.requiresReview ? 'warning' : 'success'} className="mt-auto">
                SLA {p.sla}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepProperty({
  form,
  set,
  matched,
  pathway,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  matched: ReturnType<typeof PROPERTIES.find>;
  pathway: PathwayDef | undefined;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="stand">Stand number, owner or address</Label>
        <Input
          id="stand"
          value={form.standQuery}
          onChange={(e) => set('standQuery', e.target.value)}
          placeholder="e.g. Stand 6802, Rudo Sibanda, Nyika Road"
        />
        <p className="mt-1 text-micro text-muted">
          Try: <button type="button" onClick={() => set('standQuery', 'Stand 6802')} className="font-mono text-brand-primary hover:underline">Stand 6802</button>,{' '}
          <button type="button" onClick={() => set('standQuery', 'Stand 9044')} className="font-mono text-brand-primary hover:underline">Stand 9044</button>,{' '}
          <button type="button" onClick={() => set('standQuery', 'Stand 1177')} className="font-mono text-brand-primary hover:underline">Stand 1177</button>.
        </p>
      </div>

      {form.standQuery.trim().length > 0 && (
        <Card className={`p-4 ${matched ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
          {matched ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <div>
                <div className="text-small font-semibold text-ink">{matched.stand}</div>
                <div className="text-micro text-muted">{matched.address}</div>
                <div className="mt-1 text-micro text-ink">
                  Owner on record: <span className="font-medium">{matched.ownerName}</span> · {matched.ward} ward
                </div>
              </div>
            </div>
          ) : (
            <div className="text-small text-danger">No stand matches that search. Double-check the number.</div>
          )}
        </Card>
      )}

      {pathway?.requiresReview && (
        <>
          <div>
            <Label htmlFor="relationship">Your relationship to the owner</Label>
            <Input
              id="relationship"
              value={form.relationship}
              onChange={(e) => set('relationship', e.target.value)}
              placeholder="e.g. Son paying on my mother's behalf"
            />
          </div>
          <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
            We'll need supporting documents on the next step (IDs, affidavit, lease, etc.).
          </div>
        </>
      )}
    </div>
  );
}

function StepConfirm({
  form,
  matched,
  pathway,
  set,
}: {
  form: FormState;
  matched: ReturnType<typeof PROPERTIES.find>;
  pathway: PathwayDef | undefined;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  if (!matched || !pathway) return null;

  if (!pathway.requiresReview) {
    return (
      <div className="grid gap-4">
        <div className="flex items-start gap-3 rounded-md border border-success/20 bg-success/5 p-4 text-small text-success">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Owner pathway — no review needed. Clicking "Link this property" adds <span className="font-semibold">{matched.stand}</span> to your account immediately.
          </p>
        </div>
        <Card className="p-4">
          <dl className="space-y-2 text-small">
            <Row label="Stand" value={matched.stand} />
            <Row label="Address" value={matched.address} />
            <Row label="Ward" value={matched.ward} />
            <Row label="Pathway" value="I'm the owner" />
          </dl>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="reason">Why do you need to be linked?</Label>
        <textarea
          id="reason"
          rows={3}
          value={form.reason}
          onChange={(e) => set('reason', e.target.value)}
          placeholder="Briefly explain the situation so the clerk can approve quickly."
          className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
        />
      </div>

      <div>
        <Label>Supporting documents</Label>
        <DocUploader
          value={form.documents}
          onChange={(d) => set('documents', d)}
          expected={
            pathway.id === 'family'
              ? [
                  { label: 'Your national ID / passport', hint: 'Both sides, clear image.' },
                  { label: "Owner's national ID copy" },
                  { label: 'Affidavit of relationship', hint: 'From any commissioner of oaths.' },
                ]
              : [
                  { label: 'Your national ID / passport' },
                  { label: 'Lease / tenancy agreement' },
                  { label: 'Most recent rates bill or payment', hint: 'Helps us verify ongoing use.' },
                ]
          }
        />
      </div>

      <Card className="p-4">
        <dl className="space-y-2 text-small">
          <Row label="Stand" value={matched.stand} />
          <Row label="Owner on record" value={matched.ownerName} />
          <Row label="Pathway" value={pathway.label} />
          <Row label="Your relationship" value={form.relationship} />
          <Row label="Review SLA" value={pathway.sla} />
          <Row label="Documents" value={`${form.documents.length} uploaded`} />
        </dl>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
