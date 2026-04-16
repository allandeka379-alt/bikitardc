'use client';

// Rate card & fee schedule management (spec §3.2).
// Shows the seeded rate card and fees, lets admin
// adjust amounts; changes take effect everywhere
// that consumes the helper hooks.

import { RotateCcw, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useFeeSchedule, useRateCard, useRateCardStore } from '@/lib/stores/rate-cards';
import { FEE_CATEGORY_LABEL, type PropertyClass } from '@/mocks/fixtures/rate-cards';
import { formatCurrency } from '@/lib/format';

const CLASSES: { id: PropertyClass; label: string; tint: string }[] = [
  { id: 'residential',   label: 'Residential',  tint: 'text-brand-primary' },
  { id: 'commercial',    label: 'Commercial',   tint: 'text-[#8a6e13]' },
  { id: 'agricultural',  label: 'Agricultural', tint: 'text-success' },
];

export default function RateCardsAdminPage() {
  const lines = useRateCard();
  const fees = useFeeSchedule();
  const setRate = useRateCardStore((s) => s.setRate);
  const setFee = useRateCardStore((s) => s.setFee);
  const reset = useRateCardStore((s) => s.reset);

  const feesByCategory = fees.reduce<Record<string, typeof fees>>((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Rate cards & fees</h1>
            <p className="mt-1 text-small text-muted">
              Amounts billed per property class and charged at application time. Changes take effect on
              the next billing cycle; existing statements are unaffected.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              reset();
              toast({ title: 'Reset to seed values', tone: 'info' });
            }}
            leadingIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset to seed
          </Button>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-small font-semibold uppercase tracking-wide text-muted">
              Monthly rates by class
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Line item</th>
                  {CLASSES.map((c) => (
                    <th key={c.id} className={`px-5 py-3 text-right ${c.tint}`}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.kind} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3">
                      <div className="text-small font-medium text-ink">{line.label}</div>
                      {line.note && <div className="text-micro text-muted">{line.note}</div>}
                    </td>
                    {CLASSES.map((c) => (
                      <td key={c.id} className="px-5 py-3 text-right">
                        <Input
                          type="number"
                          step="0.5"
                          min={0}
                          value={line[c.id]}
                          onChange={(e) => setRate(line.kind, c.id, Number(e.target.value))}
                          className="ml-auto w-24 text-right tabular-nums"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="mt-4 overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-small font-semibold uppercase tracking-wide text-muted">
              Fees schedule
            </h2>
          </div>
          <div>
            {Object.keys(feesByCategory).map((cat) => (
              <div key={cat}>
                <div className="flex items-center justify-between border-b border-line bg-surface/40 px-5 py-2">
                  <span className="text-micro font-semibold uppercase tracking-wide text-muted">
                    {FEE_CATEGORY_LABEL[cat as keyof typeof FEE_CATEGORY_LABEL]}
                  </span>
                  <span className="text-micro text-muted">{feesByCategory[cat]!.length} items</span>
                </div>
                <ul className="divide-y divide-line">
                  {feesByCategory[cat]!.map((f) => (
                    <li key={f.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-small font-medium text-ink">{f.label}</div>
                        <div className="text-micro text-muted">
                          {f.renewalMonths ? `Renews every ${f.renewalMonths}m` : 'One-off'}
                          {f.note && ` · ${f.note}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-micro text-muted">USD</span>
                        <Input
                          type="number"
                          step="0.5"
                          min={0}
                          value={f.amountUsd}
                          onChange={(e) => setFee(f.id, Number(e.target.value))}
                          className="w-24 text-right tabular-nums"
                        />
                      </div>
                      <span className="ml-2 w-20 shrink-0 text-right text-small font-semibold tabular-nums text-ink">
                        {formatCurrency(f.amountUsd)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <div className="mt-4 flex items-start gap-2 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-4 text-small text-brand-primary">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Edits are saved to the runtime overrides store and audit-logged. A production build would
            require council approval and an effective-date gazette notice before application.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
