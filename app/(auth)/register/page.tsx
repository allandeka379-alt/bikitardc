'use client';

// ─────────────────────────────────────────────
// Register — 3-step wizard with simulated OTP.
// Spec §7.1 user journey A / §9.2 simulated behaviours:
//   any 6-digit OTP works except "000000".
// ─────────────────────────────────────────────

import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { toast } from '@/components/ui/use-toast';

type Step = 0 | 1 | 2;

interface FormData {
  nationalId: string;
  phone: string;
  fullName: string;
  otp: string;
  password: string;
  confirmPassword: string;
  accepted: boolean;
}

const EMPTY: FormData = {
  nationalId: '',
  phone: '',
  fullName: '',
  otp: '',
  password: '',
  confirmPassword: '',
  accepted: false,
};

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const steps = useMemo(
    () => [
      { id: 'identity', label: t('step1') },
      { id: 'verify',   label: t('step2') },
      { id: 'password', label: t('step3') },
    ],
    [t],
  );

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function handleStepSubmit(e: FormEvent) {
    e.preventDefault();
    if (step === 0) {
      if (!data.nationalId || !data.phone || !data.fullName) {
        toast({ title: 'Please fill all fields.', tone: 'danger' });
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!/^\d{6}$/.test(data.otp)) {
        toast({ title: t('otpError'), tone: 'danger' });
        return;
      }
      if (data.otp === '000000') {
        // Spec §9.2: "any 6-digit code works EXCEPT 000000"
        toast({ title: t('otpError'), tone: 'danger' });
        return;
      }
      setStep(2);
      return;
    }
    // Final step
    if (data.password.length < 8) {
      toast({ title: t('passwordWeak'), tone: 'danger' });
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast({ title: t('passwordMismatch'), tone: 'danger' });
      return;
    }
    if (!data.accepted) {
      toast({ title: 'Please accept the terms to continue.', tone: 'danger' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: t('success'), tone: 'success' });
      router.push('/login');
    }, 500);
  }

  return (
    <div className="mx-auto mt-4 w-full max-w-[600px] lg:mt-10">
      <div className="mb-6">
        <h1 className="text-h1 text-ink">{t('title')}</h1>
        <p className="mt-1 text-small text-muted">{t('subtitle')}</p>
      </div>

      <Card className="p-6 sm:p-8">
        <Stepper steps={steps} current={step} className="mb-8" />

        <form onSubmit={handleStepSubmit} noValidate className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="fullName">{t('fullNameLabel')}</Label>
                <Input
                  id="fullName"
                  autoComplete="name"
                  placeholder={t('fullNamePlaceholder')}
                  value={data.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nationalId">{t('idLabel')}</Label>
                <Input
                  id="nationalId"
                  placeholder={t('idPlaceholder')}
                  value={data.nationalId}
                  onChange={(e) => set('nationalId', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('phoneLabel')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={t('phonePlaceholder')}
                  value={data.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <Label htmlFor="otp">{t('otpLabel')}</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="text-center font-mono text-[22px] tracking-[0.5em] tabular-nums"
                  value={data.otp}
                  onChange={(e) => set('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <p className="mt-1.5 text-micro text-muted">{t('otpHelper')}</p>
              </div>
              <div className="rounded-md border border-dashed border-brand-primary/20 bg-brand-primary/5 p-3 text-micro text-brand-primary">
                {t('otpDemoHint')}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={data.password}
                  onChange={(e) => set('password', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={data.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                />
              </div>
              <label className="mt-2 flex items-start gap-2.5 text-small text-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-line text-brand-primary focus:ring-brand-primary/40"
                  checked={data.accepted}
                  onChange={(e) => set('accepted', e.target.checked)}
                />
                <span>{t('termsLabel')}</span>
              </label>
            </>
          )}

          <div className="mt-4 flex items-center justify-between">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
                leadingIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              size="md"
              loading={submitting}
              trailingIcon={
                step === 2 ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />
              }
            >
              {step === 2 ? t('submit') : 'Continue'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-small text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-primary hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
