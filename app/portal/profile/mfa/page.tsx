'use client';

// ─────────────────────────────────────────────
// MFA setup / enrolment (spec §3.1 Phase 2).
// Demo-only: we fabricate a secret, render a fake
// QR with the otpauth URI, and accept any 6-digit
// code except `000000`.
// ─────────────────────────────────────────────

import { ArrowLeft, Check, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { newDemoSecret, useMfaStore } from '@/lib/stores/mfa';
import { formatRelative } from '@/lib/format';

export default function MfaSetupPage() {
  const { hydrated, userId, email } = useCurrentUser();
  const items = useMfaStore((s) => s.items);
  const enroll = useMfaStore((s) => s.enroll);
  const disable = useMfaStore((s) => s.disable);
  const existing = userId ? items[userId] : undefined;

  const [secret, setSecret] = useState<string>('');
  const [qr, setQr] = useState<string>('');
  const [code, setCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Generate a fresh secret when there is no enrolment
  useEffect(() => {
    if (existing || !userId) return;
    const s = newDemoSecret();
    setSecret(s);
    const uri = `otpauth://totp/Bikita%20RDC:${encodeURIComponent(email ?? 'user')}?secret=${s}&issuer=Bikita+RDC`;
    QRCode.toDataURL(uri, {
      margin: 1,
      width: 360,
      color: { dark: '#1F3A68', light: '#FFFFFF' },
    })
      .then(setQr)
      .catch(() => setQr(''));
  }, [existing, userId, email]);

  const chunkedSecret = useMemo(
    () => secret.replace(/(.{4})/g, '$1 ').trim(),
    [secret],
  );

  if (!hydrated) return null;

  const confirm = () => {
    if (!userId) return;
    if (!/^\d{6}$/.test(code)) return toast({ title: 'Enter the 6-digit code.', tone: 'danger' });
    if (code === '000000') return toast({ title: "That code doesn't match.", tone: 'danger' });
    setEnrolling(true);
    setTimeout(() => {
      enroll(userId, secret);
      toast({ title: 'MFA enabled', description: 'Future sign-ins will ask for a code.', tone: 'success' });
      setEnrolling(false);
    }, 300);
  };

  const turnOff = () => {
    if (!userId) return;
    disable(userId);
    toast({ title: 'MFA disabled', tone: 'info' });
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/portal/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
      </Link>

      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Two-factor authentication</h1>
            <p className="mt-1 text-small text-muted">
              Add an authenticator app to sign-in. Strongly recommended for residents and mandatory for
              staff.
            </p>
          </div>
          {existing && (
            <Badge tone="success" dot>
              Enabled
            </Badge>
          )}
        </div>
      </ScrollReveal>

      {existing ? (
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <h2 className="text-h3 text-ink">Two-factor is on</h2>
          </div>
          <dl className="space-y-2 text-small">
            <Row label="Enrolled" value={formatRelative(existing.enrolledAt)} />
            <Row
              label="Last used"
              value={existing.lastVerifiedAt ? formatRelative(existing.lastVerifiedAt) : 'Never'}
            />
            <Row label="Secret" value={existing.secret.replace(/(.{4})/g, '$1 ').trim()} mono />
          </dl>
          <div className="mt-6">
            <Button variant="destructive" onClick={turnOff} leadingIcon={<Trash2 className="h-4 w-4" />}>
              Disable 2FA
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted" />
              <h2 className="text-h3 text-ink">1. Scan the QR</h2>
            </div>
            <p className="text-small text-muted">
              In Google Authenticator, Authy or 1Password, tap Add → Scan QR code.
            </p>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="MFA enrolment QR"
                className="mx-auto mt-4 h-56 w-56 rounded-md border border-line bg-white p-2"
              />
            ) : (
              <div className="mx-auto mt-4 h-56 w-56 animate-pulse rounded-md bg-surface" />
            )}
            <div className="mt-4">
              <Label>Can't scan? Type this into your app:</Label>
              <div className="select-all rounded-md border border-line bg-surface/60 px-3 py-2 font-mono text-small tracking-wider text-ink">
                {chunkedSecret}
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-muted" />
              <h2 className="text-h3 text-ink">2. Confirm the code</h2>
            </div>
            <p className="text-small text-muted">
              Enter the 6-digit code from your authenticator app. It refreshes every 30 seconds.
            </p>
            <Label htmlFor="mfa-setup-code" className="mt-4 inline-block">
              Authenticator code
            </Label>
            <Input
              id="mfa-setup-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center font-mono text-[22px] tracking-[0.5em] tabular-nums"
            />
            <p className="mt-1 text-micro text-muted">
              Demo: any 6-digit code works except <code>000000</code>.
            </p>
            <Button className="mt-4 w-full" onClick={confirm} loading={enrolling} leadingIcon={<ShieldCheck className="h-4 w-4" />}>
              Enable 2FA
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right font-medium text-ink ${mono ? 'font-mono text-micro tracking-wider' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
