// ─────────────────────────────────────────────
// Chart of Accounts — tree of IPSAS-aligned GL
// accounts grouped by type (assets / liabilities /
// net assets / revenue / expense). Clicking any
// leaf account opens its GL detail.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format';
import {
  GL_ACCOUNTS,
  TYPE_LABEL,
  accountsOfType,
  childrenOf,
  type GlAccount,
  type GlAccountType,
} from '@/mocks/fixtures/gl-accounts';
import { cn } from '@/lib/cn';

const TYPE_ORDER: GlAccountType[] = ['asset', 'liability', 'net-assets', 'revenue', 'expense'];

const TYPE_TONE: Record<GlAccountType, 'brand' | 'warning' | 'gold' | 'success' | 'danger'> = {
  asset:        'brand',
  liability:    'warning',
  'net-assets': 'gold',
  revenue:      'success',
  expense:      'danger',
};

export default function ChartOfAccountsPage() {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!ql) return GL_ACCOUNTS;
    return GL_ACCOUNTS.filter(
      (a) => a.code.includes(ql) || a.name.toLowerCase().includes(ql),
    );
  }, [ql]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/finance"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Finance
      </Link>
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Chart of accounts</h1>
          <p className="mt-1 text-small text-muted">
            {GL_ACCOUNTS.length} accounts — IPSAS structure. Click any account to see the journal entries that posted to it.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="relative border-b border-line px-5 py-3">
          <Search className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by account code or name…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {ql ? (
          /* Flat search results */
          <ul className="divide-y divide-line">
            {filtered.length === 0 && (
              <li className="px-5 py-8 text-center text-small text-muted">No matches.</li>
            )}
            {filtered.map((a) => (
              <li key={a.code}>
                <AccountRow account={a} />
              </li>
            ))}
          </ul>
        ) : (
          /* Grouped tree */
          <div className="flex flex-col divide-y divide-line">
            {TYPE_ORDER.map((type) => (
              <TypeGroup key={type} type={type} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function TypeGroup({ type }: { type: GlAccountType }) {
  const roots = accountsOfType(type);
  const rootsTotal = roots.reduce((s, a) => s + a.ytdBalanceUsd, 0);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 bg-surface/60 px-5 py-2.5">
        <div className="flex items-center gap-2">
          <Badge tone={TYPE_TONE[type]}>{TYPE_LABEL[type]}</Badge>
          <span className="text-small text-muted">
            {roots.length} top-level · {GL_ACCOUNTS.filter((a) => a.type === type).length} total
          </span>
        </div>
        <div className="text-small font-semibold tabular-nums text-ink">
          {formatCurrency(rootsTotal)}
        </div>
      </div>
      <ul className="divide-y divide-line">
        {roots.map((root) => (
          <li key={root.code}>
            <AccountRow account={root} depth={0} />
            {childrenOf(root.code).map((child) => (
              <AccountRow key={child.code} account={child} depth={1} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccountRow({ account, depth = 0 }: { account: GlAccount; depth?: number }) {
  const change = account.priorYearUsd > 0
    ? (account.ytdBalanceUsd - account.priorYearUsd) / account.priorYearUsd
    : 0;
  return (
    <Link
      href={`/erp/finance/gl/${account.code}`}
      className={cn(
        'flex items-center justify-between gap-3 px-5 py-2.5 text-small transition-colors hover:bg-surface/60',
        depth === 0 && !account.parentCode ? 'font-semibold text-ink' : 'text-ink',
      )}
      style={{ paddingLeft: `${20 + depth * 16}px` }}
    >
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="font-mono text-micro tabular-nums text-muted">{account.code}</span>
        <span className="truncate-line">{account.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={cn(
            'hidden text-micro tabular-nums sm:inline',
            change > 0.01 ? 'text-success' : change < -0.01 ? 'text-danger' : 'text-muted',
          )}
        >
          {change >= 0 ? '▲' : '▼'} {Math.abs(change * 100).toFixed(1)}%
        </span>
        <span className="tabular-nums">{formatCurrency(account.ytdBalanceUsd)}</span>
      </div>
    </Link>
  );
}
