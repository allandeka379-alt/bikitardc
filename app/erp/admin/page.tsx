'use client';

// Admin panel — spec §6.2 screen #18.
// Read-only in the demo. Shows user management as
// a list + role matrix hint for roadmap context.

import { ShieldCheck, UserCog } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DEMO_USERS } from '@/mocks/fixtures/users';

const EXTRA_STAFF = [
  { id: 'u_staff_revenue', email: 'chipo@demo.bikita',   fullName: 'Chipo Ndlovu',   role: 'Revenue Officer',   disabled: false },
  { id: 'u_staff_admin',   email: 'admin@demo.bikita',   fullName: 'Rumbidzai Huni', role: 'Administrator',     disabled: false },
  { id: 'u_staff_works',   email: 'works@demo.bikita',   fullName: 'Garikai Musara', role: 'Works Supervisor',  disabled: false },
  { id: 'u_staff_hr',      email: 'hr@demo.bikita',      fullName: 'Nyasha Zvoma',   role: 'HR Officer',        disabled: true },
];

const USERS = [
  ...DEMO_USERS.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role === 'clerk' ? 'Rates Clerk' : u.role === 'both' ? 'Dual-role (resident + staff)' : 'Resident',
    disabled: false,
  })),
  ...EXTRA_STAFF,
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Admin</h1>
            <p className="mt-1 text-small text-muted">
              User management, role assignment and integration status. Read-only in the demo.
            </p>
          </div>
          <Badge tone="warning">
            <ShieldCheck className="h-3 w-3" />
            Read-only
          </Badge>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-muted" />
            <h2 className="text-h3 text-ink">Users</h2>
          </div>
          <span className="text-small text-muted">{USERS.length} accounts</span>
        </div>
        <table className="w-full text-small">
          <thead>
            <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-primary/10 text-micro font-semibold text-brand-primary" aria-hidden>
                      {u.fullName.split(/\s+/).slice(0, 2).map((n) => n[0]).join('')}
                    </span>
                    <div>
                      <div className="text-small font-medium text-ink">{u.fullName}</div>
                      <div className="text-micro text-muted">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.role.includes('Resident') ? 'brand' : 'gold'}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.disabled ? 'danger' : 'success'} dot>
                    {u.disabled ? 'Disabled' : 'Active'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-h3 text-ink">Integrations</h3>
          <ul className="mt-3 divide-y divide-line">
            {[
              ['EcoCash payment gateway', 'connected', 'success' as const],
              ['OneMoney payment gateway', 'connected', 'success' as const],
              ['Paynow', 'connected', 'success' as const],
              ['ZimSwitch', 'preview',  'warning' as const],
              ['SMS (BulkSMS Zimbabwe)', 'preview', 'warning' as const],
              ['WhatsApp Business', 'not connected', 'danger' as const],
            ].map(([name, status, tone]) => (
              <li key={name as string} className="flex items-center justify-between py-2.5 text-small">
                <span className="text-ink">{name}</span>
                <Badge tone={tone as 'success' | 'warning' | 'danger'} dot>
                  {status as string}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="text-h3 text-ink">Role matrix (preview)</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2 text-left">Capability</th>
                  <th className="py-2 px-2 text-center">Resident</th>
                  <th className="py-2 px-2 text-center">Clerk</th>
                  <th className="py-2 pl-2 text-center">Admin</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['View own rates',       '✓', '✓', '✓'],
                  ['Pay rates',             '✓', '—', '✓'],
                  ['Approve verifications', '—', '✓', '✓'],
                  ['Match payments',        '—', '✓', '✓'],
                  ['Advance applications',  '—', '✓', '✓'],
                  ['Assign requests',       '—', '✓', '✓'],
                  ['Manage users',          '—', '—', '✓'],
                  ['View audit log',        '—', '✓', '✓'],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-2 text-ink">{row[0]}</td>
                    <td className="py-2 px-2 text-center tabular-nums text-muted">{row[1]}</td>
                    <td className="py-2 px-2 text-center tabular-nums text-success">{row[2]}</td>
                    <td className="py-2 pl-2 text-center tabular-nums text-brand-primary">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
