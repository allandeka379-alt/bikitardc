// ─────────────────────────────────────────────
// New billing run wizard
//
// 3-step flow:
//   1. Choose source + period
//   2. Preview projected totals (delta vs prior)
//   3. Confirm — creates a draft run
//
// The demo does not mutate the fixture; the final
// step routes back to the billing list with a
// toast.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/format';
import { BILLING_RUNS } from '@/mocks/fixtures/billing-runs';
import { REVENUE_SOURCES, type RevenueSourceId } from '@/mocks/fixtures/revenue-sources';
import { cn } from '@/lib/cn';

type Step = 1 | 2 | 3;

const MONTH_OPTIONS = ['2026-05', '2026-06', '2026-07'];
const QUARTER_OPTIONS = ['2026-Q2', '2026-Q3'];

export default function NewBillingRunPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [source, setSource] = useState<RevenueSourceId>('property-rates');
  const [period, setPeriod] = useState<string>('2026-05');

  // Find the previous run of the same source for the diff preview
  const previous = useMemo(() => {
    return [...BILLING_RUNS]
      .filter((r) => r.source === source)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  }, [source]);

  const billableRun = REVENUE_SOURCES.find((s) => s.id === source)!;

  // Projected totals: nudge the prior run by +2% for rates, +1% for the rest.
  const projected = useMemo(() => {
    if (!previous) {
      return { accountCount: 0, totalUsd: 0 };
    }
    const bump = source === 'property-rates' ? 1.02 : 1.01;
    return {
      accountCount: Math.round(previous.accountCount * 1.003),
      totalUsd: Math.round(previous.totalUsd * bump),
    };
  }, [previous, source]);

  const handleCreate = () => {
    toast({
      title: 'Billing run queued',
      description: `${billableRun.label} · ${period} — draft created. Review before approval.`,
      tone: 'success',
    });
    router.push('/erp/billing');
  };

  const periodOptions = billableRun.id === 'development-levy' || billableRun.id === 'campfire'
    ? QUARTER_OPTIONS
    : MONTH_OPTIONS;

  return (
    <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/billing"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Billing runs
      </Link>

      <div className="mb-6">
        <h1 className="text-h1 text-ink">New billing run</h1>
        <p className="mt-1 text-small text-muted">
          Generate a draft statement cycle for any billable revenue source. Drafts stay in your queue until approval.
        </p>
      </div>

      <ol className="mb-6 flex items-center gap-3">
        <StepDot n={1} active={step === 1} done={step > 1} label="Source" />
        <div className="h-px flex-1 bg-line" />
        <StepDot n={2} active={step === 2} done={step > 2} label="Preview" />
        <div className="h-px flex-1 bg-line" />
        <StepDot n={3} active={step === 3} done={false}    label="Confirm" />
      </ol>

      <Card className="p-5 sm:p-6">
        {step === 1 && (
          <div>
            <h2 className="text-h3 text-ink">Choose source &amp; period</h2>
            <p className="mt-1 text-small text-muted">
              Only sources marked &ldquo;billing run&rdquo; can be bulk-generated from here.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-small font-semibold text-ink">Revenue source</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {REVENUE_SOURCES.filter((s) => s.isBillingRun).map((s) => {
                  const selected = s.id === source;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSource(s.id)}
                      className={cn(
                        'rounded-md border p-3 text-left transition-all',
                        selected ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand' : 'border-line hover:border-brand-primary/25',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-small font-semibold text-ink">{s.label}</span>
                        <span className="font-mono text-micro text-muted">{s.shortCode}</span>
                      </div>
                      <p className="mt-1 text-micro text-muted">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-small font-semibold text-ink">Period</label>
              <div className="flex flex-wrap gap-2">
                {periodOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-small font-medium transition-colors',
                      period === p ? 'border-brand-primary bg-brand-primary text-white' : 'border-line bg-card text-ink hover:border-brand-primary/25',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                Preview
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-h3 text-ink">Preview projected totals</h2>
            <p className="mt-1 text-small text-muted">
              Figures are estimated from the prior period. Final amounts are computed when the run is posted.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat label="Accounts to bill" value={projected.accountCount.toLocaleString()} />
              <Stat label="Projected total"  value={formatCurrency(projected.totalUsd)} emphasis />
              {previous && (
                <Stat
                  label="Δ vs prior run"
                  value={`${((projected.totalUsd / previous.totalUsd - 1) * 100).toFixed(1)}%`}
                  tone={projected.totalUsd >= previous.totalUsd ? 'success' : 'warning'}
                />
              )}
            </div>

            <div className="mt-5 rounded-md border border-brand-primary/15 bg-brand-primary/5 p-4 text-small text-brand-primary">
              <div className="font-semibold">What happens after approval</div>
              <ul className="mt-2 list-inside list-disc space-y-0.5">
                <li>Individual invoices are created against each account.</li>
                <li>Matching GL journal posts to the revenue account.</li>
                <li>SMS / WhatsApp / email notifications are queued.</li>
                <li>Arrears start accruing after the stated due date.</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-h3 text-ink">Confirm &amp; create draft</h2>
            <p className="mt-1 text-small text-muted">
              The draft will enter the billing queue. A supervisor must approve before it can post to the ledger.
            </p>

            <div className="mt-5 divide-y divide-line rounded-md border border-line bg-surface/30">
              <Row label="Source">
                <div className="flex items-center gap-2 text-ink">
                  <Badge tone="brand">{billableRun.shortCode}</Badge>
                  <span className="font-semibold">{billableRun.label}</span>
                </div>
              </Row>
              <Row label="Period"><span className="font-semibold text-ink">{period}</span></Row>
              <Row label="Projected total"><span className="font-semibold tabular-nums text-ink">{formatCurrency(projected.totalUsd)}</span></Row>
              <Row label="Estimated accounts"><span className="font-semibold tabular-nums text-ink">{projected.accountCount.toLocaleString()}</span></Row>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleCreate} leadingIcon={<Play className="h-4 w-4" />}>
                Create draft run
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function StepDot({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <li className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-micro font-bold',
          done ? 'bg-success text-white' : active ? 'bg-brand-primary text-white' : 'bg-line text-muted',
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      <span className={cn('text-small', active || done ? 'font-semibold text-ink' : 'text-muted')}>{label}</span>
    </li>
  );
}

function Stat({ label, value, emphasis, tone }: { label: string; value: string; emphasis?: boolean; tone?: 'success' | 'warning' }) {
  return (
    <div className={cn('rounded-md border bg-card p-4', emphasis ? 'border-brand-primary shadow-ring-brand' : 'border-line')}>
      <div className="text-micro text-muted">{label}</div>
      <div className={cn(
        'mt-1 text-h3 font-bold tabular-nums',
        emphasis ? 'text-brand-primary' :
        tone === 'success' ? 'text-success' :
        tone === 'warning' ? 'text-warning' : 'text-ink',
      )}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-small">
      <span className="text-muted">{label}</span>
      {children}
    </div>
  );
}
