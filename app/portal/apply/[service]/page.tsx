'use client';

// ─────────────────────────────────────────────
// Business licence wizard — Journey B end-to-end.
// Spec §7.2 flow:
//   1. Business details
//   2. Location (map pin)
//   3. Owner details (pre-filled)
//   4. Upload documents
//   5. Review and pay the $25 fee (inline)
// Other service slugs land on the ComingSoon stub.
// ─────────────────────────────────────────────

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  Save,
  User2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ComingSoon } from '@/components/portal/coming-soon';
import { DocUploader, type UploadedFile } from '@/components/portal/doc-uploader';
import { InlineMethodPicker } from '@/components/portal/inline-method-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { toast } from '@/components/ui/use-toast';
import { useApplicationStore } from '@/lib/stores/application';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { usePaymentStore } from '@/lib/stores/payment';
import { formatCurrency, formatRelative } from '@/lib/format';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import type { Application, ApplicationType } from '@/mocks/fixtures/applications';
import type { PaymentChannel } from '@/mocks/fixtures/transactions';
import { cn } from '@/lib/cn';

const LocationPicker = dynamic(() => import('@/components/portal/location-picker'), {
  ssr: false,
  loading: () => (
    <div className="grid h-[320px] w-full place-items-center rounded-md border border-line bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-brand-primary" />
    </div>
  ),
});

interface BusinessLicenceForm {
  businessName: string;
  tradingName: string;
  category: string;
  description: string;
  latlng: [number, number] | null;
  addressLine: string;
  ownerName: string;
  ownerNationalId: string;
  ownerPhone: string;
  ownerEmail: string;
  documents: UploadedFile[];
  channel: PaymentChannel;
  phone: string;
}

const EMPTY_FORM: BusinessLicenceForm = {
  businessName: '',
  tradingName: '',
  category: 'General dealer',
  description: '',
  latlng: null,
  addressLine: '',
  ownerName: '',
  ownerNationalId: '',
  ownerPhone: '',
  ownerEmail: '',
  documents: [],
  channel: 'ecocash',
  phone: '',
};

const LICENCE_FEE_USD = 25;

const STEPS = [
  { id: 'business',  label: 'Business',  Icon: Briefcase },
  { id: 'location',  label: 'Location',  Icon: MapPin },
  { id: 'owner',     label: 'Owner',     Icon: User2 },
  { id: 'documents', label: 'Documents', Icon: Building2 },
  { id: 'review',    label: 'Review & pay', Icon: CreditCard },
] as const;

export default function ApplyServicePage() {
  const { service } = useParams<{ service: string }>();
  if (service !== 'business-licence') {
    return (
      <ComingSoon
        title="Service application"
        description="This service will ship with its own wizard in a later milestone. The business licence wizard is live — try it from the Apply grid."
        backHref="/portal/apply"
        backLabel="Back to services"
      />
    );
  }
  return <BusinessLicenceWizard />;
}

function BusinessLicenceWizard() {
  const router = useRouter();
  const { userId, fullName, email } = useCurrentUser();
  const me = DEMO_USERS.find((u) => u.id === userId);

  const saveDraft = useApplicationStore((s) => s.saveDraft);
  const loadDraft = useApplicationStore((s) => s.loadDraft);
  const discardDraft = useApplicationStore((s) => s.discardDraft);
  const createApplication = useApplicationStore((s) => s.createApplication);
  const startPayment = usePaymentStore((s) => s.start);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BusinessLicenceForm>(EMPTY_FORM);
  const [draftLoadedAt, setDraftLoadedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setForm((f) => ({
      ...f,
      ownerName: f.ownerName || fullName || '',
      ownerEmail: f.ownerEmail || email || '',
      ownerPhone: f.ownerPhone || me?.phone || '',
      phone: f.phone || me?.phone || '',
    }));
    const draft = loadDraft('business-licence' as ApplicationType);
    if (draft) {
      const merged = { ...EMPTY_FORM, ...(draft.data as Partial<BusinessLicenceForm>) };
      setForm(merged);
      setStep(draft.step);
      setDraftLoadedAt(draft.updatedAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const set = <K extends keyof BusinessLicenceForm>(key: K, value: BusinessLicenceForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validateStep = (s: number): string | null => {
    const f = form;
    if (s === 0) {
      if (!f.businessName.trim()) return 'Business name is required.';
      if (!f.category.trim()) return 'Pick a category.';
    }
    if (s === 1) {
      if (!f.latlng) return 'Tap the map to place your business pin.';
      if (!f.addressLine.trim()) return 'Add a street/address line.';
    }
    if (s === 2) {
      if (!f.ownerName.trim() || !f.ownerNationalId.trim() || !f.ownerPhone.trim())
        return 'All owner fields are required.';
    }
    if (s === 3) {
      if (f.documents.length < 1) return 'Upload at least one supporting document.';
    }
    if (s === 4) {
      if (!f.channel) return 'Choose a payment method.';
      if ((['ecocash', 'onemoney', 'innbucks'] as PaymentChannel[]).includes(f.channel) && !/^[+\d\s]{7,}$/.test(f.phone))
        return 'Enter a valid mobile wallet number.';
    }
    return null;
  };

  const advance = () => {
    const err = validateStep(step);
    if (err) {
      toast({ title: err, tone: 'danger' });
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      saveDraft('business-licence' as ApplicationType, step + 1, form as unknown as Record<string, unknown>);
    } else {
      submit();
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const submit = () => {
    if (!userId) return;

    const now = new Date().toISOString();
    const ref = `BL-${new Date().getFullYear()}-${String(1000 + Math.floor(Math.random() * 8999))}`;
    const appId = `app_rt_${Math.random().toString(36).slice(2, 10)}`;

    const app: Application = {
      id: appId,
      reference: ref,
      type: 'business-licence',
      title: `${form.businessName} — new licence`,
      ownerId: userId,
      submittedAt: now,
      stage: 'submitted',
      feeUsd: LICENCE_FEE_USD,
      feePaid: false,
      events: [{ at: now, stage: 'submitted', note: 'Submitted via citizen portal.' }],
    };

    createApplication(app);
    discardDraft('business-licence' as ApplicationType);

    startPayment({
      subject: { type: 'application', id: app.id, label: ref },
      amount: LICENCE_FEE_USD,
      currency: 'USD',
      channel: form.channel,
      phone: form.phone,
      returnTo: `/portal/applications/${ref}`,
    });

    router.push('/portal/pay/processing');
  };

  const handleSaveDraft = () => {
    saveDraft('business-licence' as ApplicationType, step, form as unknown as Record<string, unknown>);
    toast({ title: 'Draft saved.', description: 'Pick up where you left off from My applications.', tone: 'success' });
  };

  const handleDiscardDraft = () => {
    discardDraft('business-licence' as ApplicationType);
    setForm(EMPTY_FORM);
    setStep(0);
    setDraftLoadedAt(null);
  };

  const completeness = useMemo(() => {
    const fields = [
      form.businessName,
      form.category,
      form.latlng ? 'yes' : '',
      form.addressLine,
      form.ownerName,
      form.ownerNationalId,
      form.ownerPhone,
      form.documents.length > 0 ? 'yes' : '',
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/portal/apply"
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to services
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">
            Business licence application
          </h1>
          <p className="mt-1 text-small text-muted">
            {draftLoadedAt ? (
              <>
                <Badge tone="brand" className="mr-2">
                  <Save className="h-3 w-3" />
                  Draft loaded
                </Badge>
                last updated {formatRelative(draftLoadedAt)} — your progress auto-saves.
              </>
            ) : (
              <>Estimated time: 3–5 minutes. You can save and resume at any step.</>
            )}
          </p>
        </div>
        <div className="rounded-md border border-line bg-card px-4 py-2.5">
          <div className="text-micro text-muted">Licence fee</div>
          <div className="text-h3 font-bold tabular-nums text-ink">
            {formatCurrency(LICENCE_FEE_USD)}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 pb-5 pt-5">
          <Stepper
            steps={STEPS.map((s) => ({ id: s.id, label: s.label }))}
            current={step}
          />
          <div className="mt-4 flex items-center justify-between text-micro text-muted">
            <span>Application completeness</span>
            <span className="font-semibold tabular-nums text-ink">{completeness}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-[width] duration-slow ease-out-expo"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {step === 0 && <StepBusiness form={form} set={set} />}
          {step === 1 && <StepLocation form={form} set={set} />}
          {step === 2 && <StepOwner form={form} set={set} />}
          {step === 3 && <StepDocuments form={form} set={set} />}
          {step === 4 && <StepReview form={form} set={set} />}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/40 px-5 py-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSaveDraft} leadingIcon={<Save className="h-3.5 w-3.5" />}>
              Save draft
            </Button>
            {draftLoadedAt && (
              <Button variant="ghost" size="sm" onClick={handleDiscardDraft}>
                Discard
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={back} disabled={step === 0} leadingIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            <Button
              onClick={advance}
              trailingIcon={
                step === STEPS.length - 1 ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )
              }
            >
              {step === STEPS.length - 1 ? `Submit & pay ${formatCurrency(LICENCE_FEE_USD)}` : 'Continue'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Step 1: Business details ───────────────

const CATEGORIES = [
  'General dealer',
  'Supermarket / grocery',
  'Restaurant / takeaway',
  'Hardware',
  'Pharmacy',
  'Services / salon',
  'Workshop / repairs',
  'Other',
];

function StepBusiness({
  form,
  set,
}: {
  form: BusinessLicenceForm;
  set: <K extends keyof BusinessLicenceForm>(k: K, v: BusinessLicenceForm[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="businessName">Business name</Label>
        <Input
          id="businessName"
          value={form.businessName}
          onChange={(e) => set('businessName', e.target.value)}
          placeholder="e.g. Moyo General Dealers"
        />
      </div>
      <div>
        <Label htmlFor="tradingName">Trading-as name (optional)</Label>
        <Input
          id="tradingName"
          value={form.tradingName}
          onChange={(e) => set('tradingName', e.target.value)}
          placeholder="Public-facing name if different"
        />
      </div>
      <div>
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set('category', c)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-small font-medium transition-colors',
                form.category === c
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
        <Label htmlFor="description">What will you sell or do? (optional)</Label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder="Brief description of goods/services."
          className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
        />
      </div>
    </div>
  );
}

// ─── Step 2: Location ──────────────────────

function StepLocation({
  form,
  set,
}: {
  form: BusinessLicenceForm;
  set: <K extends keyof BusinessLicenceForm>(k: K, v: BusinessLicenceForm[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Label>Business location</Label>
        <p className="mb-2 text-micro text-muted">
          Tap the map to place a pin. Pan and zoom to adjust.
        </p>
        <LocationPicker value={form.latlng} onChange={(ll) => set('latlng', ll)} />
        {form.latlng && (
          <p className="mt-2 text-micro text-muted">
            Pinned at{' '}
            <span className="font-mono tabular-nums text-ink">
              {form.latlng[0].toFixed(5)}, {form.latlng[1].toFixed(5)}
            </span>
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="addressLine">Address line</Label>
        <Input
          id="addressLine"
          value={form.addressLine}
          onChange={(e) => set('addressLine', e.target.value)}
          placeholder="Shop 3050, Mupani High Street"
        />
      </div>
    </div>
  );
}

// ─── Step 3: Owner ─────────────────────────

function StepOwner({
  form,
  set,
}: {
  form: BusinessLicenceForm;
  set: <K extends keyof BusinessLicenceForm>(k: K, v: BusinessLicenceForm[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
        We pre-filled from your profile. Update anything that's changed.
      </div>
      <div>
        <Label htmlFor="ownerName">Full name</Label>
        <Input
          id="ownerName"
          value={form.ownerName}
          onChange={(e) => set('ownerName', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="ownerNationalId">National ID number</Label>
        <Input
          id="ownerNationalId"
          value={form.ownerNationalId}
          onChange={(e) => set('ownerNationalId', e.target.value)}
          placeholder="00-123456K00"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ownerPhone">Mobile number</Label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              id="ownerPhone"
              className="pl-9"
              value={form.ownerPhone}
              onChange={(e) => set('ownerPhone', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ownerEmail">Email (optional)</Label>
          <Input
            id="ownerEmail"
            type="email"
            value={form.ownerEmail}
            onChange={(e) => set('ownerEmail', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Documents ──────────────────────

function StepDocuments({
  form,
  set,
}: {
  form: BusinessLicenceForm;
  set: <K extends keyof BusinessLicenceForm>(k: K, v: BusinessLicenceForm[K]) => void;
}) {
  return (
    <DocUploader
      value={form.documents}
      onChange={(docs) => set('documents', docs)}
      expected={[
        { label: 'Copy of national ID or passport', hint: 'Both sides, clear image.' },
        { label: 'Proof of address (any recent utility bill or affidavit)' },
        { label: 'Lease or title for the business premises' },
        { label: 'Tax clearance (if available)', hint: 'Optional but speeds up approval.' },
      ]}
    />
  );
}

// ─── Step 5: Review & pay ────────────────────

function StepReview({
  form,
  set,
}: {
  form: BusinessLicenceForm;
  set: <K extends keyof BusinessLicenceForm>(k: K, v: BusinessLicenceForm[K]) => void;
}) {
  const needsPhone = (['ecocash', 'onemoney', 'innbucks'] as PaymentChannel[]).includes(form.channel);

  return (
    <div className="grid gap-5">
      <div>
        <h3 className="text-h3 text-ink">Review</h3>
        <Card className="mt-3 overflow-hidden">
          <dl className="divide-y divide-line px-5 text-small">
            <DlRow label="Business" value={form.businessName || '—'} />
            <DlRow label="Category" value={form.category} />
            {form.tradingName && <DlRow label="Trading as" value={form.tradingName} />}
            <DlRow
              label="Location"
              value={
                form.latlng
                  ? `${form.addressLine} (${form.latlng[0].toFixed(4)}, ${form.latlng[1].toFixed(4)})`
                  : '—'
              }
            />
            <DlRow label="Owner" value={form.ownerName || '—'} />
            <DlRow label="Owner ID" value={form.ownerNationalId || '—'} />
            <DlRow label="Documents" value={`${form.documents.length} uploaded`} />
          </dl>
        </Card>
      </div>

      <div>
        <h3 className="text-h3 text-ink">Pay fee</h3>
        <p className="mt-1 text-small text-muted">
          Licence fee of <span className="font-semibold tabular-nums text-ink">$25.00</span>. We'll simulate a wallet prompt.
        </p>
        <div className="mt-3">
          <InlineMethodPicker value={form.channel} onChange={(c) => set('channel', c)} />
        </div>
        {needsPhone && (
          <div className="mt-4 max-w-sm">
            <Label htmlFor="walletPhone">Mobile wallet number</Label>
            <Input
              id="walletPhone"
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+263 77 123 4567"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
