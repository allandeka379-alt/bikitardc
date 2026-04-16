'use client';

// Recent activity table/list — appears on the
// citizen dashboard and property detail page.

import { ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/format';
import { CHANNEL_LABEL, type Transaction } from '@/mocks/fixtures/transactions';

export function RecentActivity({
  transactions,
  title = 'Recent activity',
  propertyMap,
}: {
  transactions: Transaction[];
  title?: string;
  /** Optional map of propertyId → address string to decorate each row. */
  propertyMap?: Record<string, string>;
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState title="No activity yet." description="Your payments and receipts will appear here." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 pb-4 pt-5">
        <h3 className="text-h3 text-ink">{title}</h3>
        <Link
          href="/portal/profile"
          className="inline-flex items-center gap-1 rounded-sm text-small font-medium text-brand-primary hover:underline"
        >
          Full history
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {transactions.slice(0, 8).map((tx) => (
          <li key={tx.id}>
            <Link
              href={`/portal/property/${tx.propertyId}`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface/60"
            >
              <StatusGlyph status={tx.status} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-small font-semibold text-ink">
                    {CHANNEL_LABEL[tx.channel]}
                  </span>
                  <Badge tone={tx.status === 'succeeded' ? 'success' : tx.status === 'failed' ? 'danger' : 'warning'}>
                    {tx.status}
                  </Badge>
                </div>
                <div className="mt-0.5 truncate-line text-micro text-muted">
                  {propertyMap?.[tx.propertyId] ?? tx.propertyId} · {tx.reference}
                </div>
              </div>
              <div className="text-right">
                <div className="text-small font-semibold tabular-nums text-ink">
                  {formatCurrency(tx.amount, tx.currency)}
                </div>
                <div className="text-micro text-muted">{formatDate(tx.createdAt)}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StatusGlyph({ status }: { status: Transaction['status'] }) {
  if (status === 'succeeded') {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-md bg-success/10 text-success">
        <CheckCircle2 className="h-4 w-4" />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-md bg-danger/10 text-danger">
        <XCircle className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="grid h-9 w-9 place-items-center rounded-md bg-warning/10 text-warning">
      <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
    </span>
  );
}
