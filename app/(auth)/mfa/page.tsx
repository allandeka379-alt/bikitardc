'use client';

// ─────────────────────────────────────────────
// MFA challenge screen (spec §3.1 Phase 2).
//
// Shown after login when the user has an MFA
// enrolment. Any 6-digit code is accepted except
// `000000` per spec §9.2 simulated-behaviours.
// ─────────────────────────────────────────────

import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useMfaStore } from '@/lib/stores/mfa';

export default function MfaChallengePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { userId } = useCurrentUser();
  const markVerified = useMfaStore((s) => s.markVerified);

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const next = sp.get('next') ?? '/portal/dashboard';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return toast({ title: 'Enter the 6-digit code.', tone: 'danger' });
    if (code === '000000') return toast({ title: "That code doesn't match.", tone: 'danger' });
    if (!userId) return toast({ title: 'Not signed in.', tone: 'danger' });

    setSubmitting(true);
    setTimeout(() => {
      markVerified(userId);
      toast({ title: 'Verified', tone: 'success' });
      router.replace(next);
    }, 300);
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-[520px] lg:mt-10">
      <div className="mb-6">
        <h1 className="text-h1 text-ink">Two-factor authentication</h1>
        <p className="mt-1 text-small text-muted">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={submit} noValidate className="grid gap-5">
          <div className="flex items-start gap-3 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Codes refresh every 30 seconds. <strong>Demo:</strong> any 6-digit code works except{' '}
              <code className="font-mono">000000</code>.
            </p>
          </div>

          <div>
            <Label htmlFor="mfa-code">Authenticator code</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center font-mono text-[26px] tracking-[0.5em] tabular-nums"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
              <Link href="/login">Back to log in</Link>
            </Button>
            <Button type="submit" loading={submitting}>
              Verify
            </Button>
          </div>
        </form>
      </Card>

      <p className="mt-4 text-center text-micro text-muted">
        Lost your device?{' '}
        <Link href="/reset-password" className="font-medium text-brand-primary hover:underline">
          Reset via OTP
        </Link>
        .
      </p>
    </div>
  );
}
