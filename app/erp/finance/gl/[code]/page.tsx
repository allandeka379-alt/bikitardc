// ─────────────────────────────────────────────
// GL account detail — balance header + list of
// every journal line posted to the account.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { findGlAccount, TYPE_LABEL } from '@/mocks/fixtures/gl-accounts';
import {
  GL_ENTRIES,
  SOURCE_LABEL,
  entriesForAccount,
  type GlEntry,
} from '@/mocks/fixtures/gl-entries';
import { cn } from '@/lib/cn';

export default function GlAccountDetailPage() {
  const params = useParams<{ code: string }>();
  const account = findGlAccount(params.code);
  if (!account) return notFound();

  const entries = entriesForAccount(account.code);
  const debits = entries.reduce((s, e) => s + e.lines.filter((l) => l.accountCode === account.code).reduce((ss, l) => ss + l.debitUsd, 0), 0);
  const credits = entries.reduce((s, e) => s + e.lines.filter((l) => l.accountCode === account.code).reduce((ss, l) => ss + l.creditUsd, 0), 0);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/finance/gl"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Chart of accounts
      </Link>

      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-wider text-muted">
              <span className="font-mono">{account.code}</span>
              <Badge tone="neutral">{TYPE_LABEL[account.type]}</Badge>
            </div>
            <h1 className="mt-1 text-h1 text-ink">{account.name}</h1>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-2.5">
            <div className="text-micro text-muted">YTD balance</div>
            <div className="text-h2 font-bold tabular-nums text-ink">
              {formatCurrency(account.ytdBalanceUsd)}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Prior year"  value={formatCurrency(account.priorYearUsd)} />
        <Stat label="Total debits"  value={formatCurrency(debits)}  tone="info" />
        <Stat label="Total credits" value={formatCurrency(credits)} tone="success" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-body font-semibold text-ink">Journal entries</h2>
          <p className="mt-0.5 text-micro text-muted">
            {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} posted to this account.
          </p>
        </div>
        {entries.length === 0 ? (
          <div className="px-5 py-10 text-center text-small text-muted">
            No journal entries posted to this account yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Reference</th>
                  <th className="px-5 py-3 text-left">Source</th>
                  <th className="px-5 py-3 text-left">Memo</th>
                  <th className="px-5 py-3 text-right">Debit</th>
                  <th className="px-5 py-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const line = entry.lines.find((l) => l.accountCode === account.code);
                  if (!line) return null;
                  return (
                    <EntryRow key={entry.id} entry={entry} memo={line.memo} debit={line.debitUsd} credit={line.creditUsd} />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Full journal reference — also list every entry in the fixture for transparency */}
      {entries.length === GL_ENTRIES.length && null}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'info' | 'success' }) {
  const toneClass = tone === 'info' ? 'text-info' : tone === 'success' ? 'text-success' : 'text-ink';
  return (
    <div className="rounded-md border border-line bg-card p-4">
      <div className="text-micro text-muted">{label}</div>
      <div className={cn('mt-1 text-h3 font-bold tabular-nums', toneClass)}>{value}</div>
    </div>
  );
}

function EntryRow({ entry, memo, debit, credit }: { entry: GlEntry; memo: string; debit: number; credit: number }) {
  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-surface/60">
      <td className="px-5 py-3 text-muted">{formatDate(entry.date)}</td>
      <td className="px-5 py-3 font-mono text-micro">{entry.reference}</td>
      <td className="px-5 py-3">
        <Badge tone="neutral">{SOURCE_LABEL[entry.source]}</Badge>
      </td>
      <td className="px-5 py-3 text-ink">{memo}</td>
      <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', debit ? 'text-info' : 'text-muted/30')}>
        {debit ? formatCurrency(debit) : '—'}
      </td>
      <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', credit ? 'text-success' : 'text-muted/30')}>
        {credit ? formatCurrency(credit) : '—'}
      </td>
    </tr>
  );
}
