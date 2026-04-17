// Retention policy schedule — statutory reference card.

'use client';

import { ArrowLeft, Archive, Flame, Landmark } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DOCUMENTS, RETENTION_POLICIES } from '@/mocks/fixtures/documents';

export default function RetentionPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/documents" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Document repository
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Retention policies</h1>
          <p className="mt-1 text-small text-muted">
            Statutory retention periods for every record category. The repository will flag documents for disposal once they exceed their retention.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">Retain (years)</th>
                <th className="px-5 py-3 text-left">Disposal action</th>
                <th className="px-5 py-3 text-left">Legal authority</th>
                <th className="px-5 py-3 text-right">Records on file</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION_POLICIES.map((p) => {
                const onFile = DOCUMENTS.filter((d) => d.category === p.category).length;
                return (
                  <tr key={p.category} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3 font-semibold text-ink">{p.label}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{p.retentionYears === 99 ? '∞' : p.retentionYears}</td>
                    <td className="px-5 py-3">
                      {p.disposalAction === 'destroy' && <Badge tone="danger">  <Flame className="h-3 w-3" /> Destroy</Badge>}
                      {p.disposalAction === 'archive' && <Badge tone="info">    <Archive className="h-3 w-3" /> Archive</Badge>}
                      {p.disposalAction === 'transfer-national-archives' && <Badge tone="gold"><Landmark className="h-3 w-3" /> Transfer to archives</Badge>}
                    </td>
                    <td className="px-5 py-3 font-mono text-micro text-muted">{p.authority}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{onFile}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 rounded-md border border-brand-primary/15 bg-brand-primary/5 p-4 text-small text-brand-primary">
        <div className="font-semibold">Disposal workflow</div>
        <p className="mt-1">
          Records exceeding their retention are moved to a disposal queue reviewed quarterly by the CFO and HR head. Once approved, the physical + digital copies are either destroyed or transferred under a signed disposal certificate.
        </p>
      </div>
    </div>
  );
}
