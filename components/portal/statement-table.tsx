'use client';

// Itemised statement grouped by period.
// Spec §3.1: rates / unit-tax / development-levy /
// refuse / interest / adjustment with an explainer
// on every line.

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExplainPopover } from '@/components/ui/explain-popover';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { StatementLine } from '@/mocks/fixtures/statements';
import { linesForProperty } from '@/mocks/fixtures/statements';

export function StatementTable({ propertyId }: { propertyId: string }) {
  const lines = linesForProperty(propertyId);
  const grouped = groupByPeriod(lines);
  const periods = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="space-y-4">
      {periods.map((key) => {
        const group = grouped[key]!;
        const subtotal = group.lines.reduce((s, l) => s + l.amount, 0);
        const isCurrent = key === periods[0];

        return (
          <Card key={key} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-3">
                <h3 className="text-body font-semibold text-ink">{group.label}</h3>
                {isCurrent && (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-micro font-medium text-warning">
                    Current
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
                PDF
              </Button>
            </div>

            <ul className="divide-y divide-line">
              {group.lines.map((line) => {
                const credit = line.amount < 0;
                return (
                  <li
                    key={line.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 text-small text-ink">{line.description}</span>
                      <ExplainPopover text={line.explainer} />
                    </div>
                    <span
                      className={cn(
                        'shrink-0 text-small font-semibold tabular-nums',
                        credit ? 'text-success' : 'text-ink',
                      )}
                    >
                      {credit ? '−' : ''}
                      {formatCurrency(Math.abs(line.amount))}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-line bg-surface/50 px-5 py-3">
              <span className="text-small font-medium text-muted">Period subtotal</span>
              <span className="text-small font-bold tabular-nums text-ink">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function groupByPeriod(lines: StatementLine[]) {
  const out: Record<string, { label: string; lines: StatementLine[] }> = {};
  for (const line of lines) {
    const key = line.periodStart.slice(0, 7); // YYYY-MM
    if (!out[key]) out[key] = { label: line.period, lines: [] };
    out[key]!.lines.push(line);
  }
  return out;
}
