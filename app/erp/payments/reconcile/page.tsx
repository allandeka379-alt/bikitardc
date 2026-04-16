'use client';

// ─────────────────────────────────────────────
// Payment reconciliation — Journey C step 6.
//
// Split view:
//   • Left column  — our transactions (unmatched)
//   • Right column — EcoCash statement rows (unmatched)
//   • Top strip    — KPI counts and the auto-matched bucket
// Click one row on each side → "Match" button lights
// up → confirming saves the pair to the ERP store
// and appends to the audit log.
// ─────────────────────────────────────────────

import { ArrowLeftRight, Check, CheckCircle2, Download, Link2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useErpStore } from '@/lib/stores/erp';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import {
  ECOCASH_ROWS,
  UNMATCHED_OUR_TX_IDS,
  type EcoCashRow,
} from '@/mocks/fixtures/ecocash-statement';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { TRANSACTIONS, type Transaction } from '@/mocks/fixtures/transactions';

export default function ReconcilePage() {
  const matchedPairs = useErpStore((s) => s.matchedPairs);
  const matchPayment = useErpStore((s) => s.matchPayment);
  const { fullName } = useCurrentUser();

  const [selectedOur, setSelectedOur] = useState<string | null>(null);
  const [selectedTheirs, setSelectedTheirs] = useState<string | null>(null);

  const propMap = useMemo(
    () => Object.fromEntries(PROPERTIES.map((p) => [p.id, p])),
    [],
  );

  // Only consider EcoCash successful transactions on our side.
  const ourEcoCash = useMemo(
    () => TRANSACTIONS.filter((t) => t.channel === 'ecocash' && t.status === 'succeeded'),
    [],
  );

  // Auto-match: rows where the EcoCash row references our transaction id.
  const autoMatched = useMemo(() => {
    return ECOCASH_ROWS.map((ec) => {
      const our = ourEcoCash.find((t) => t.reference === ec.ourReference);
      return our ? { ec, our } : null;
    }).filter(Boolean) as { ec: EcoCashRow; our: Transaction }[];
  }, [ourEcoCash]);

  const manualMatched = useMemo(() => {
    return matchedPairs
      .map((p) => {
        const our = ourEcoCash.find((t) => t.id === p.ourTxId);
        const ec = ECOCASH_ROWS.find((e) => e.id === p.ecocashRowId);
        return our && ec ? { our, ec, pair: p } : null;
      })
      .filter(Boolean) as { our: Transaction; ec: EcoCashRow; pair: (typeof matchedPairs)[number] }[];
  }, [matchedPairs, ourEcoCash]);

  const matchedOurIds = new Set([
    ...autoMatched.map((m) => m.our.id),
    ...manualMatched.map((m) => m.our.id),
  ]);
  const matchedEcIds = new Set([
    ...autoMatched.map((m) => m.ec.id),
    ...manualMatched.map((m) => m.ec.id),
  ]);

  const ourException = ourEcoCash.filter(
    (t) => !matchedOurIds.has(t.id) && UNMATCHED_OUR_TX_IDS.includes(t.id),
  );
  const theirException = ECOCASH_ROWS.filter(
    (e) => !matchedEcIds.has(e.id) && !e.ourReference,
  );

  const canMatch = selectedOur && selectedTheirs;
  const selectedOurTx = selectedOur ? ourException.find((t) => t.id === selectedOur) : undefined;
  const selectedEc = selectedTheirs ? theirException.find((e) => e.id === selectedTheirs) : undefined;
  const amountMatches = selectedOurTx && selectedEc ? Math.abs(selectedOurTx.amount - selectedEc.amountUsd) < 0.01 : false;

  const handleMatch = () => {
    if (!selectedOur || !selectedTheirs) return;
    matchPayment(selectedOur, selectedTheirs, fullName ?? 'Rates Clerk');
    toast({
      title: 'Matched',
      description: `${selectedOur} ↔ ${selectedTheirs}`,
      tone: 'success',
    });
    setSelectedOur(null);
    setSelectedTheirs(null);
  };

  const totalMatched = autoMatched.length + manualMatched.length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* Header */}
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Payment reconciliation</h1>
            <p className="mt-1 text-small text-muted">
              Match internal transactions against the EcoCash merchant statement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm" leadingIcon={<Upload className="h-3.5 w-3.5" />}>
              <Link href="/erp/payments/bank-import">Import bank statement</Link>
            </Button>
            <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
              Export exceptions
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile tone="success" label="Auto-matched" value={`${autoMatched.length}`} sub="by reference" />
        <StatTile tone="brand" label="Manually matched" value={`${manualMatched.length}`} sub="this session" />
        <StatTile tone="warning" label="Ours — unmatched" value={`${ourException.length}`} sub="need review" />
        <StatTile tone="danger" label="Theirs — unmatched" value={`${theirException.length}`} sub="no reference" />
      </div>

      {/* Auto-matched collapsible summary */}
      <ScrollReveal>
        <Card className="mb-6 overflow-hidden">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-line px-5 py-3 text-small font-semibold text-ink hover:bg-surface/60 group-open:border-b-0">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Auto-matched ({totalMatched})
              </span>
              <span className="text-micro text-muted group-open:hidden">Show</span>
              <span className="hidden text-micro text-muted group-open:inline">Hide</span>
            </summary>
            <ul className="divide-y divide-line border-t border-line">
              {[...autoMatched, ...manualMatched].map((m, i) => (
                <li key={`${m.our.id}_${i}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-3">
                  <span className="truncate-line text-small">
                    <span className="text-muted">Ours</span>{' '}
                    <span className="font-mono text-ink">{m.our.reference}</span>{' '}
                    <span className="text-muted">· {formatCurrency(m.our.amount)}</span>
                  </span>
                  <Link2 className="h-3.5 w-3.5 text-success" />
                  <span className="truncate-line text-right text-small">
                    <span className="text-muted">EcoCash</span>{' '}
                    <span className="font-mono text-ink">{m.ec.merchantRef}</span>{' '}
                    <span className="text-muted">· {formatCurrency(m.ec.amountUsd)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </Card>
      </ScrollReveal>

      {/* Exception split view */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* Ours */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div>
              <h3 className="text-small font-semibold text-ink">Ours — unmatched</h3>
              <p className="text-micro text-muted">Transactions not seen on the EcoCash statement.</p>
            </div>
            <Badge tone="warning">{ourException.length}</Badge>
          </div>
          {ourException.length === 0 ? (
            <div className="px-5 py-10 text-center text-small text-muted">All clear on our side.</div>
          ) : (
            <ul className="divide-y divide-line">
              {ourException.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedOur(selectedOur === t.id ? null : t.id)}
                    className={cn(
                      'flex w-full items-start justify-between gap-3 px-5 py-3 text-left transition-colors',
                      selectedOur === t.id ? 'bg-brand-primary/8 ring-1 ring-brand-primary/20' : 'hover:bg-surface/60',
                    )}
                  >
                    <div>
                      <div className="font-mono text-micro text-ink">{t.reference}</div>
                      <div className="mt-1 text-small text-ink">{propMap[t.propertyId]?.stand ?? t.propertyId}</div>
                      <div className="text-micro text-muted">{formatDate(t.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-small font-semibold tabular-nums text-ink">
                        {formatCurrency(t.amount, t.currency)}
                      </div>
                      {t.note && <div className="mt-1 max-w-[220px] text-micro text-muted">{t.note}</div>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Match bridge */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <Button
            disabled={!canMatch}
            onClick={handleMatch}
            leadingIcon={<Check className="h-4 w-4" />}
            className={cn(
              canMatch && amountMatches ? '' : '',
              canMatch && !amountMatches ? 'bg-warning hover:bg-warning/90' : '',
            )}
            size="md"
          >
            Match selected
          </Button>
          {canMatch && (
            <p className="max-w-[180px] text-center text-micro text-muted">
              {amountMatches ? 'Amounts match exactly.' : 'Amounts differ — match anyway?'}
            </p>
          )}
          {!canMatch && (
            <p className="max-w-[180px] text-center text-micro text-muted">
              Select one row from each side.
            </p>
          )}
        </div>

        {/* Theirs */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div>
              <h3 className="text-small font-semibold text-ink">EcoCash — unmatched</h3>
              <p className="text-micro text-muted">Rows without our payment reference.</p>
            </div>
            <Badge tone="danger">{theirException.length}</Badge>
          </div>
          {theirException.length === 0 ? (
            <div className="px-5 py-10 text-center text-small text-muted">All clear on the EcoCash side.</div>
          ) : (
            <ul className="divide-y divide-line">
              {theirException.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedTheirs(selectedTheirs === e.id ? null : e.id)}
                    className={cn(
                      'flex w-full items-start justify-between gap-3 px-5 py-3 text-left transition-colors',
                      selectedTheirs === e.id ? 'bg-brand-primary/8 ring-1 ring-brand-primary/20' : 'hover:bg-surface/60',
                    )}
                  >
                    <div>
                      <div className="font-mono text-micro text-ink">{e.merchantRef}</div>
                      <div className="mt-1 text-small text-ink">{e.mobile}</div>
                      <div className="text-micro text-muted">{formatDate(e.postedAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-small font-semibold tabular-nums text-ink">
                        {formatCurrency(e.amountUsd)}
                      </div>
                      <div className="mt-1 text-micro text-muted">No reference</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatTile({
  tone,
  label,
  value,
  sub,
}: {
  tone: 'success' | 'brand' | 'warning' | 'danger';
  label: string;
  value: string;
  sub: string;
}) {
  const bg =
    tone === 'success' ? 'bg-success/10 text-success'
      : tone === 'warning' ? 'bg-warning/10 text-warning'
        : tone === 'danger' ? 'bg-danger/10 text-danger'
          : 'bg-brand-primary/10 text-brand-primary';
  return (
    <Card className="p-4">
      <div className={cn('inline-block rounded-full px-2 py-0.5 text-micro font-semibold', bg)}>
        {label}
      </div>
      <div className="mt-2 text-[24px] font-bold tabular-nums text-ink">{value}</div>
      <div className="text-micro text-muted">{sub}</div>
    </Card>
  );
}
