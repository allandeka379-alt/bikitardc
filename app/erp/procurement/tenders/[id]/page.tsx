// Tender detail with bid evaluation.

'use client';

import { ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  METHOD_LABEL,
  STAGE_LABEL,
  STAGE_TONE,
  bidsForTender,
  findTender,
} from '@/mocks/fixtures/procurement-tenders';
import { cn } from '@/lib/cn';

export default function TenderDetailPage() {
  const params = useParams<{ id: string }>();
  const tender = findTender(params.id);
  if (!tender) return notFound();

  const bids = bidsForTender(tender.id);
  const winner = bids.find((b) => !b.disqualified);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/procurement/tenders" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Tenders
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-small text-muted">{tender.reference}</span>
                <Badge tone={STAGE_TONE[tender.stage]} dot>{STAGE_LABEL[tender.stage]}</Badge>
                <Badge tone="neutral">{METHOD_LABEL[tender.method]}</Badge>
              </div>
              <h1 className="mt-1 text-h1 text-ink">{tender.title}</h1>
              <p className="mt-2 max-w-2xl text-small text-muted">{tender.scope}</p>
              <div className="mt-2 text-micro text-muted">
                Department <span className="font-semibold text-ink">{tender.department}</span> · owner {tender.owner}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Tile label="Envelope" value={formatCurrency(tender.budgetEnvelopeUsd)} />
              <Tile label="Advertised" value={formatDate(tender.advertisedAt)} />
              <Tile label="Closes" value={formatDate(tender.closesAt)} />
              <Tile label="Committee" value={tender.committeeApproved ? 'Approved' : 'Pending'} tone={tender.committeeApproved ? 'success' : 'warning'} />
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {tender.awardedTo && (
        <Card className="mt-6 border-success/30 bg-success/5 p-4 text-small text-success">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="font-semibold">Awarded:</span> {tender.awardedTo} — {formatCurrency(tender.awardUsd ?? 0)}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Bid evaluation</h2>
            <p className="mt-0.5 text-micro text-muted">
              {bids.length} bidders · scored on technical (40) + financial (60) weights.
            </p>
          </div>
          {bids.length === 0 ? (
            <div className="px-5 py-10 text-center text-small text-muted">No bids submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-small">
                <thead>
                  <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-5 py-3 text-left">Bidder</th>
                    <th className="px-5 py-3 text-left">PRAZ</th>
                    <th className="px-5 py-3 text-right">Quote</th>
                    <th className="px-5 py-3 text-right">Technical</th>
                    <th className="px-5 py-3 text-right">Financial</th>
                    <th className="px-5 py-3 text-right">Combined</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((b, i) => {
                    const isWinner = winner && b.id === winner.id;
                    return (
                      <tr key={b.id} className={cn('border-b border-line last:border-b-0', isWinner ? 'bg-success/5' : 'hover:bg-surface/60', b.disqualified && 'opacity-60')}>
                        <td className="px-5 py-3">
                          {isWinner ? <Trophy className="h-4 w-4 text-success" /> : <span className="text-muted">{i + 1}</span>}
                        </td>
                        <td className="px-5 py-3 font-semibold text-ink">{b.bidderName}</td>
                        <td className="px-5 py-3 font-mono text-micro text-muted">{b.bidderPraz}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-ink">{formatCurrency(b.quotedUsd)}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted">{b.technicalScore}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted">{b.financialScore}</td>
                        <td className={cn('px-5 py-3 text-right font-bold tabular-nums', isWinner ? 'text-success' : 'text-ink')}>{b.combinedScore}</td>
                        <td className="px-5 py-3">
                          {b.disqualified ? <Badge tone="danger">Disqualified</Badge> : isWinner ? <Badge tone="success">Recommended</Badge> : <Badge tone="neutral">Evaluated</Badge>}
                          {b.notes && <div className="mt-1 text-micro text-muted">{b.notes}</div>}
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
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  return (
    <div className="rounded-md border border-line bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('text-small font-bold tabular-nums', tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-ink')}>
        {value}
      </div>
    </div>
  );
}
