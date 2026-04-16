// ─────────────────────────────────────────────
// Bank reconciliation — every council bank account
// on the left, the unreconciled statement lines for
// the selected account on the right. Each line can
// be matched against a GL journal.
//
// "Matching" in the demo is a local toggle that
// moves lines into the reconciled pile; a real
// implementation would write the mapping back to
// the GL module.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, CheckCircle2, Link2, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  BANK_ACCOUNTS,
  KIND_LABEL,
  STATEMENT_LINES,
  linesForAccount,
  type BankAccount,
} from '@/mocks/fixtures/bank-accounts';
import { cn } from '@/lib/cn';

export default function BankReconciliationPage() {
  const [activeId, setActiveId] = useState<string>(BANK_ACCOUNTS[0]!.id);
  const [matched, setMatched] = useState<Record<string, boolean>>({});

  const account = BANK_ACCOUNTS.find((a) => a.id === activeId)!;
  const lines = useMemo(() => linesForAccount(account.id), [account.id]);
  const totalUnmatched = STATEMENT_LINES.filter((l) => !matched[l.id]).length;

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
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h1 text-ink">Bank reconciliation</h1>
            <p className="mt-1 text-small text-muted">
              {BANK_ACCOUNTS.length} council bank accounts · {totalUnmatched} lines awaiting match.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Account list */}
        <Card className="h-fit overflow-hidden">
          <div className="border-b border-line bg-surface/60 px-4 py-2.5">
            <div className="text-micro font-bold uppercase tracking-wider text-muted">Accounts</div>
          </div>
          <ul>
            {BANK_ACCOUNTS.map((a) => {
              const outstanding = linesForAccount(a.id).filter((l) => !matched[l.id]).length;
              const selected = a.id === activeId;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(a.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0',
                      selected ? 'bg-brand-primary/5' : 'hover:bg-surface/60',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-small font-semibold', selected ? 'text-brand-primary' : 'text-ink')}>
                          {a.bank}
                        </span>
                        <Badge tone="neutral">{KIND_LABEL[a.kind]}</Badge>
                      </div>
                      <div className="mt-0.5 text-micro text-muted">{a.branch} · {a.accountNumber}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-small font-semibold tabular-nums text-ink">{formatCurrency(a.currentBalanceUsd)}</span>
                        {outstanding > 0 && (
                          <Badge tone="warning">{outstanding} to match</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Selected account detail */}
        <div>
          <AccountHeader account={account} />
          <Card className="mt-4 overflow-hidden">
            <div className="border-b border-line px-5 py-3">
              <h2 className="text-body font-semibold text-ink">Unreconciled lines</h2>
              <p className="mt-0.5 text-micro text-muted">
                Tick each line once you have confirmed it matches a GL journal. This demo only updates local state.
              </p>
            </div>
            {lines.length === 0 ? (
              <div className="px-5 py-10 text-center text-small text-muted">
                This account has no unreconciled statement lines.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Description / Reference</th>
                      <th className="px-5 py-3 text-right">Debit</th>
                      <th className="px-5 py-3 text-right">Credit</th>
                      <th className="px-5 py-3 text-left">Suggested match</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => {
                      const isMatched = !!matched[l.id];
                      return (
                        <tr key={l.id} className={cn('border-b border-line last:border-b-0', isMatched ? 'bg-success/5' : 'hover:bg-surface/60')}>
                          <td className="px-5 py-3 text-muted">{formatDate(l.postedAt)}</td>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-ink">{l.description}</div>
                            <div className="font-mono text-micro text-muted">{l.reference}</div>
                          </td>
                          <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', l.debitUsd ? 'text-danger' : 'text-muted/30')}>
                            {l.debitUsd ? formatCurrency(l.debitUsd) : '—'}
                          </td>
                          <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', l.creditUsd ? 'text-success' : 'text-muted/30')}>
                            {l.creditUsd ? formatCurrency(l.creditUsd) : '—'}
                          </td>
                          <td className="px-5 py-3">
                            {l.suggestedMatch ? (
                              <span className="inline-flex items-center gap-1 font-mono text-micro text-info">
                                <Link2 className="h-3 w-3" />
                                {l.suggestedMatch}
                              </span>
                            ) : (
                              <span className="text-micro text-muted">No match found</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {isMatched ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                leadingIcon={<Undo2 className="h-3 w-3" />}
                                onClick={() => setMatched((m) => { const n = { ...m }; delete n[l.id]; return n; })}
                              >
                                Undo
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                leadingIcon={<CheckCircle2 className="h-3 w-3" />}
                                onClick={() => setMatched((m) => ({ ...m, [l.id]: true }))}
                              >
                                Match
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AccountHeader({ account }: { account: BankAccount }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-h2 text-ink">{account.bank}</h2>
            <Badge tone="neutral">{KIND_LABEL[account.kind]}</Badge>
          </div>
          <div className="mt-1 text-small text-muted">
            {account.branch} · {account.accountNumber} · last statement {formatDate(account.lastStatementAt)}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="rounded-md border border-line bg-card px-4 py-2.5">
            <div className="text-micro text-muted">Bank balance</div>
            <div className="text-h3 font-bold tabular-nums text-ink">{formatCurrency(account.currentBalanceUsd)}</div>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-2.5">
            <div className="text-micro text-muted">Reconciled</div>
            <div className="text-h3 font-bold tabular-nums text-success">{formatCurrency(account.reconciledBalanceUsd)}</div>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-2.5">
            <div className="text-micro text-muted">Difference</div>
            <div className={cn('text-h3 font-bold tabular-nums', account.currentBalanceUsd - account.reconciledBalanceUsd > 0 ? 'text-warning' : 'text-muted')}>
              {formatCurrency(account.currentBalanceUsd - account.reconciledBalanceUsd)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
