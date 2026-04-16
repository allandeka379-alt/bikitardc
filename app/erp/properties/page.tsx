'use client';

import { Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import { PROPERTIES, tierOf } from '@/mocks/fixtures/properties';
import { cn } from '@/lib/cn';

export default function ErpPropertiesPage() {
  const [q, setQ] = useState('');

  const rows = PROPERTIES.filter(
    (p) =>
      p.stand.toLowerCase().includes(q.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(q.toLowerCase()) ||
      p.ward.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Properties</h1>
            <p className="mt-1 text-small text-muted">
              Cadastral register — {PROPERTIES.length} stands on record.
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/erp/properties/heatmap">Revenue heat map</Link>
          </Button>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="relative border-b border-line px-5 py-3">
          <Filter className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by stand, owner or ward…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Stand</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">Ward</th>
                <th className="px-5 py-3 text-left">Class</th>
                <th className="px-5 py-3 text-right">Balance</th>
                <th className="px-5 py-3 text-left">Next due</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const tier = tierOf(p);
                return (
                  <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <Link href={`/portal/property/${p.id}`} className="text-small font-semibold text-ink hover:text-brand-primary">
                        {p.stand}
                      </Link>
                      <div className="text-micro text-muted">{p.areaSqm.toLocaleString()} m²</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{p.ownerName}</td>
                    <td className="px-5 py-3 text-muted">{p.ward}</td>
                    <td className="px-5 py-3">
                      <Badge tone="neutral">{p.classKind}</Badge>
                    </td>
                    <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', tier === 'clear' ? 'text-success' : tier === 'overdue' ? 'text-danger' : 'text-warning')}>
                      {formatCurrency(p.balanceUsd)}
                    </td>
                    <td className="px-5 py-3 text-muted">{formatDate(p.nextDueAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
