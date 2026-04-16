'use client';

// ─────────────────────────────────────────────
// Documents vault — spec §3.1.
// Aggregates receipts (transactions), certificates
// (issued + fee-paid applications) and a seeded
// approved building plan. Filterable by type,
// searchable by reference or title.
// ─────────────────────────────────────────────

import {
  FileBadge2,
  FileText,
  FolderLock,
  HardHat,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CertificateDownloadButton } from '@/components/receipt/certificate-download-button';
import { DownloadReceiptButton } from '@/components/receipt/download-button';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useApplicationsForOwner } from '@/lib/stores/application';
import { useTransactionsForOwner } from '@/lib/stores/demo';
import { formatCurrency, formatDate } from '@/lib/format';
import { PROPERTIES, type Property } from '@/mocks/fixtures/properties';
import { cn } from '@/lib/cn';

type DocKind = 'receipt' | 'certificate' | 'plan';

interface VaultItem {
  id: string;
  kind: DocKind;
  title: string;
  subtitle: string;
  at: string;
  reference: string;
  action: React.ReactNode;
  meta?: string;
}

const KIND_TONE: Record<
  DocKind,
  { bg: string; text: string; label: string; Icon: typeof FileText }
> = {
  receipt:     { bg: 'bg-brand-primary/10', text: 'text-brand-primary', label: 'Receipt',     Icon: FileText },
  certificate: { bg: 'bg-brand-accent/15',  text: 'text-[#8a6e13]',     label: 'Certificate', Icon: FileBadge2 },
  plan:        { bg: 'bg-warning/10',       text: 'text-warning',       label: 'Plan',        Icon: HardHat },
};

export default function DocumentsVaultPage() {
  const { hydrated, userId, fullName } = useCurrentUser();
  const transactions = useTransactionsForOwner(userId);
  const applications = useApplicationsForOwner(userId);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<DocKind | 'all'>('all');

  const propMap: Record<string, Property> = useMemo(
    () => Object.fromEntries(PROPERTIES.map((p) => [p.id, p])),
    [],
  );

  const items = useMemo<VaultItem[]>(() => {
    if (!hydrated || !userId) return [];
    const out: VaultItem[] = [];

    for (const tx of transactions) {
      if (tx.status !== 'succeeded') continue;
      const prop = propMap[tx.propertyId];
      out.push({
        id: `receipt_${tx.id}`,
        kind: 'receipt',
        title: `${prop?.stand ?? 'Property'} — rates payment`,
        subtitle: prop?.address ?? tx.propertyId,
        at: tx.createdAt,
        reference: tx.reference,
        meta: formatCurrency(tx.amount, tx.currency),
        action: prop ? (
          <DownloadReceiptButton transaction={tx} property={prop} ownerName={fullName ?? 'Resident'} />
        ) : null,
      });
    }

    for (const app of applications) {
      if ((app.stage === 'issued' || app.stage === 'approved') && app.feePaid) {
        out.push({
          id: `cert_${app.id}`,
          kind: 'certificate',
          title: app.title,
          subtitle: app.reference,
          at: app.submittedAt,
          reference: app.reference,
          meta: `Fee ${formatCurrency(app.feeUsd)}`,
          action: <CertificateDownloadButton application={app} issuedTo={fullName ?? 'Resident'} />,
        });
      }
    }

    // Seeded building plan — spec §3.1 "Demo — Visual". Only for Tendai so
    // the demo has something to show beyond payment receipts.
    if (userId === 'u_tendai') {
      out.push({
        id: 'plan_seeded',
        kind: 'plan',
        title: 'Stand 2210 — warehouse extension plan',
        subtitle: 'Approved February 2026',
        at: '2026-02-12T09:00:00Z',
        reference: 'BP-2026-0095',
        meta: 'Approved',
        action: (
          <Button variant="secondary" size="md" disabled title="Placeholder — real file in production">
            Preview plan
          </Button>
        ),
      });
    }

    return out.sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [hydrated, userId, transactions, applications, propMap, fullName]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (kindFilter !== 'all' && it.kind !== kindFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (![it.title, it.subtitle, it.reference].some((f) => f.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }, [items, kindFilter, query]);

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Documents</h1>
            <p className="mt-1 text-small text-muted">
              Receipts, certificates and approved plans linked to your account. Every document carries a QR
              code so third parties can verify authenticity.
            </p>
          </div>
          <Badge tone="brand" dot>
            <ShieldCheck className="h-3 w-3" />
            {items.length} documents
          </Badge>
        </div>
      </ScrollReveal>

      {items.length === 0 ? (
        <EmptyState
          icon={<FolderLock className="h-8 w-8" />}
          title="Your vault is empty."
          description="Pay your rates or apply for a licence — receipts and certificates will appear here automatically."
        />
      ) : (
        <>
          <ScrollReveal>
            <Card className="mb-4 overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    placeholder="Search by title or reference…"
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'receipt', 'certificate', 'plan'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKindFilter(k)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                        kindFilter === k
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-line bg-card text-ink hover:border-brand-primary/30',
                      )}
                    >
                      {k === 'all' ? 'All' : KIND_TONE[k].label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {filtered.length === 0 ? (
            <EmptyState title="No documents match your filter." />
          ) : (
            <ul className="grid gap-2">
              {filtered.map((it, i) => {
                const tone = KIND_TONE[it.kind];
                return (
                  <li key={it.id}>
                    <ScrollReveal delay={i * 40}>
                      <Card className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
                        <span
                          className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-md', tone.bg, tone.text)}
                          aria-hidden
                        >
                          <tone.Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <Badge
                              tone={
                                it.kind === 'receipt'
                                  ? 'brand'
                                  : it.kind === 'certificate'
                                    ? 'gold'
                                    : 'warning'
                              }
                            >
                              {tone.label}
                            </Badge>
                            <span className="font-mono text-[10px] text-muted">{it.reference}</span>
                            {it.meta && (
                              <span className="text-micro tabular-nums text-muted">· {it.meta}</span>
                            )}
                          </div>
                          <div className="text-small font-semibold text-ink">{it.title}</div>
                          <div className="truncate-line text-micro text-muted">
                            {it.subtitle} · {formatDate(it.at)}
                          </div>
                        </div>
                        <div className="w-full shrink-0 sm:w-auto">
                          {it.action ?? (
                            <Button variant="secondary" size="md" disabled>
                              Unavailable
                            </Button>
                          )}
                        </div>
                      </Card>
                    </ScrollReveal>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
