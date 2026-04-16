'use client';

// ─────────────────────────────────────────────
// Password reset via OTP (spec §3.1 — screens
// implemented, OTP simulated).
//
// Two-step cosmetic flow:
//   1. Email/phone → triggers OTP
//   2. OTP + new password → success + link to /login
// Spec §9.2: any 6-digit OTP works except 000000.
// ─────────────────────────────────────────────

import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { toast } from '@/components/ui/use-toast';

type Step = 0 | 1 | 2;

const STEPS = [
  { id: 'identity', label: 'Identify' },
  { id: 'otp',       label: 'Verify OTP' },
  { id: 'done',      label: 'Done' },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStep = (e: FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      if (!/^\S+@\S+|\+?\d{7,}/.test(identifier.trim())) {
        return toast({ title: 'Enter a valid email or phone number.', tone: 'danger' });
      }
      toast({
        title: 'OTP sent',
        description: 'Demo: any 6-digit code works (except 000000).',
        tone: 'info',
      });
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!/^\d{6}$/.test(otp)) return toast({ title: 'Enter the 6-digit code.', tone: 'danger' });
      if (otp === '000000') return toast({ title: 'That code doesn\'t match.', tone: 'danger' });
      if (password.length < 8) return toast({ title: 'Password must be at least 8 characters.', tone: 'danger' });
      if (password !== confirm) return toast({ title: 'Passwords don\'t match.', tone: 'danger' });
      setSubmitting(true);
      setTimeout(() => {
        setStep(2);
        setSubmitting(false);
      }, 400);
      return;
    }
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-[560px] lg:mt-10">
      <div className="mb-6">
        <h1 className="text-h1 text-ink">Reset your password</h1>
        <p className="mt-1 text-small text-muted">
          We'll send you a one-time code to confirm it's you.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <Stepper steps={STEPS} current={step} className="mb-8" />

        {step === 2 ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-success text-white shadow-card-md">
              <CheckCircle2 className="h-7 w-7" strokeWidth={2.2} />
            </span>
            <h2 className="text-h2 text-ink">Password updated</h2>
            <p className="max-w-prose text-small text-muted">
              You can now log in with your new password. All other sessions have been signed out for
              safety.
            </p>
            <Button asChild size="lg" className="mt-3" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href="/login">Back to log in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleStep} noValidate className="flex flex-col gap-4">
            {step === 0 && (
              <>
                <div>
                  <Label htmlFor="identifier">Email or phone</Label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                      aria-hidden
                    />
                    <Input
                      id="identifier"
                      className="pl-9"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="tendai@demo.bikita or +263 77 …"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
                  We'll send you a 6-digit code by SMS and WhatsApp. Codes expire after 5 minutes.
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="otp">One-time code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center font-mono text-[22px] tracking-[0.5em] tabular-nums"
                    autoFocus
                  />
                  <p className="mt-1.5 text-micro text-muted">
                    Demo: any 6-digit code works except <code className="font-mono">000000</code>.
                  </p>
                </div>
                <div>
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                      aria-hidden
                    />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
                  <ShieldCheck className="mr-1.5 inline h-4 w-4" />
                  For your safety, all other sessions will be signed out when you finish.
                </div>
              </>
            )}

            <div className="mt-2 flex items-center justify-between">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((s) => (s === 2 ? 2 : (s === 1 ? 0 : 0)))}
                  leadingIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
              ) : (
                <Button asChild variant="ghost" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
                  <Link href="/login">Back to log in</Link>
                </Button>
              )}
              <Button type="submit" loading={submitting} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                {step === 0 ? 'Send OTP' : 'Update password'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
