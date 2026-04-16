'use client';

// ─────────────────────────────────────────────
// Profile & settings
//
// Spec §3.1:
//   • Profile management (name, contact, photo)
//   • Sensitive fields require re-verification
//   • Active sessions & logout-all
//   • Granular notification preferences (linked)
// ─────────────────────────────────────────────

import {
  Bell,
  ChevronRight,
  IdCard,
  LogOut,
  Mail,
  MonitorSmartphone,
  Phone,
  ShieldCheck,
  Smartphone,
  Tablet,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { formatRelative } from '@/lib/format';
import { DEMO_USERS } from '@/mocks/fixtures/users';

interface Session {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
  Icon: LucideIcon;
}

const SEEDED_SESSIONS: Session[] = [
  {
    id: 'sess_1',
    device: 'Chrome on Windows 11',
    ip: '41.78.220.12',
    location: 'Masvingo, ZW',
    lastActive: new Date().toISOString(),
    current: true,
    Icon: MonitorSmartphone,
  },
  {
    id: 'sess_2',
    device: 'Safari on iPhone 14',
    ip: '41.78.115.44',
    location: 'Bikita, ZW',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    current: false,
    Icon: Smartphone,
  },
  {
    id: 'sess_3',
    device: 'Chrome on Android tablet',
    ip: '197.221.23.8',
    location: 'Harare, ZW',
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    current: false,
    Icon: Tablet,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { hydrated, userId, fullName, email, role, logout } = useCurrentUser();
  const [sessions, setSessions] = useState<Session[]>(SEEDED_SESSIONS);

  if (!hydrated) return null;
  const me = DEMO_USERS.find((u) => u.id === userId);

  const revoke = (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    toast({ title: 'Session revoked', description: 'The device was signed out.', tone: 'info' });
  };

  const revokeAll = () => {
    setSessions((s) => s.filter((x) => x.current));
    toast({ title: 'All other sessions signed out.', tone: 'info' });
  };

  return (
    <div className="mx-auto max-w-[840px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <h1 className="text-h1 text-ink">Profile & settings</h1>
        <p className="mt-1 text-small text-muted">
          Manage your identity, notification preferences and active sessions.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={50}>
        <Card className="mt-6 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span
                className="grid h-14 w-14 place-items-center rounded-full bg-brand-primary/10 text-h3 font-semibold text-brand-primary"
                aria-hidden
              >
                {(fullName ?? '').split(/\s+/).slice(0, 2).map((n) => n[0]).join('')}
              </span>
              <div>
                <div className="text-h3 text-ink">{fullName}</div>
                <div className="mt-1 text-small text-muted">
                  {role === 'clerk' ? 'Staff' : role === 'both' ? 'Dual-role' : 'Resident'}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast({
                  title: 'Identity re-verification required',
                  description:
                    'Changing your name, ID or date of birth needs a verified document upload. We\'ll send you an OTP.',
                  tone: 'info',
                })
              }
            >
              Edit
            </Button>
          </div>

          <dl className="mt-6 divide-y divide-line">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={email ?? ''} sensitive={false} />
            <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={me?.phone ?? ''} sensitive />
            <Row
              icon={<IdCard className="h-4 w-4" />}
              label="National ID"
              value="00-123456K00"
              sensitive
            />
          </dl>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Fields marked <Badge tone="gold" className="mx-1">sensitive</Badge> require re-verification
              via OTP and a document upload before they can be updated.
            </p>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <Card className="mt-4 p-5 sm:p-6">
          <h2 className="text-h3 text-ink">Preferences</h2>
          <ul className="mt-3 divide-y divide-line">
            <li>
              <Link
                href="/portal/profile/notifications"
                className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-surface/60"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-small font-medium text-ink">Notification preferences</div>
                    <div className="text-micro text-muted">
                      Control in-app, SMS, WhatsApp and email channels per event type.
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            </li>
            <li>
              <Link
                href="/portal/profile/mfa"
                className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-surface/60"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-success/10 text-success" aria-hidden>
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-small font-medium text-ink">
                      Two-factor authentication
                    </div>
                    <div className="text-micro text-muted">
                      Add an authenticator app for stronger sign-in protection.
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            </li>
            <li>
              <div className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="text-small font-medium text-ink">Language</div>
                  <div className="text-micro text-muted">
                    Used across notifications, receipts and in-app text.
                  </div>
                </div>
                <LanguageToggle />
              </div>
            </li>
          </ul>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <Card className="mt-4 p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-h3 text-ink">Active sessions</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={revokeAll}
              disabled={sessions.filter((s) => !s.current).length === 0}
            >
              Sign out all other devices
            </Button>
          </div>
          <p className="text-small text-muted">
            If you don't recognise a session, revoke it and change your password.
          </p>
          <ul className="mt-3 divide-y divide-line">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface text-muted" aria-hidden>
                  <s.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-small font-medium text-ink">{s.device}</span>
                    {s.current && <Badge tone="brand">This device</Badge>}
                  </div>
                  <div className="text-micro text-muted">
                    {s.location} · {s.ip} · last active {formatRelative(s.lastActive)}
                  </div>
                </div>
                {!s.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revoke(s.id)}
                    leadingIcon={<XCircle className="h-3.5 w-3.5" />}
                  >
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <Card className="mt-4 p-5 sm:p-6">
          <h2 className="text-h3 text-ink">Session</h2>
          <p className="mt-1 text-small text-muted">
            This is a demo session — no tokens are stored. Logging out clears local demo state but keeps
            your seeded payment history.
          </p>
          <Button
            variant="destructive"
            className="mt-4"
            leadingIcon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              logout();
              router.push('/');
            }}
          >
            Log out
          </Button>
        </Card>
      </ScrollReveal>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  sensitive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sensitive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-2 text-small text-muted">
        <span className="text-muted" aria-hidden>
          {icon}
        </span>
        {label}
        {sensitive && <Badge tone="gold">sensitive</Badge>}
      </div>
      <div className="text-small font-medium text-ink">{value}</div>
    </div>
  );
}
