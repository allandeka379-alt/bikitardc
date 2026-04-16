'use client';

// ─────────────────────────────────────────────
// Citizen dashboard — the landing for residents
// (spec §5, §6.2 screen #4, §7.1 Journey A start).
//
// Shows:
//   • Welcome + summary row
//   • Alerts strip (bill-ready, emergency, etc.)
//   • Property cards (2 for Tendai)
//   • Quick actions
//   • Recent activity
// ─────────────────────────────────────────────

import { Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { AlertStrip } from '@/components/portal/alert-strip';
import { PropertyCard } from '@/components/portal/property-card';
import { QuickActions } from '@/components/portal/quick-actions';
import { RecentActivity } from '@/components/portal/recent-activity';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  usePropertiesForOwner,
  useTransactionsForOwner,
} from '@/lib/stores/demo';
import { formatCurrency } from '@/lib/format';

export default function DashboardPage() {
  const { hydrated, userId, fullName } = useCurrentUser();
  const properties = usePropertiesForOwner(userId);
  const transactions = useTransactionsForOwner(userId);

  if (!hydrated) return null;

  const totalOutstanding = properties.reduce((s, p) => s + p.balanceUsd, 0);
  const overdue = properties.filter((p) => p.balanceUsd > 0);
  const firstName = (fullName ?? '').split(' ')[0] ?? '';

  const propertyMap: Record<string, string> = Object.fromEntries(
    properties.map((p) => [p.id, p.address]),
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* Header */}
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-small text-muted">Good to see you{firstName ? `, ${firstName}` : ''}.</p>
            <h1 className="mt-1 text-h1 text-ink sm:text-[2rem] sm:leading-[2.5rem]">
              Your council at a glance.
            </h1>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-2.5">
            <div className="text-micro text-muted">Total outstanding</div>
            <div className="text-h3 font-bold tabular-nums text-ink">
              {formatCurrency(totalOutstanding)}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Alerts */}
      <ScrollReveal delay={50}>
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          {overdue.length > 0 ? (
            <AlertStrip
              tone="warning"
              title={`${overdue.length === 1 ? 'A bill is' : 'Bills are'} ready for payment`}
              body={`${formatCurrency(totalOutstanding)} across ${overdue.length} ${overdue.length === 1 ? 'property' : 'properties'}.`}
              href={`/portal/pay/${overdue[0]!.id}`}
              cta="Pay now"
            />
          ) : (
            <AlertStrip
              tone="success"
              title="You're all paid up — thank you."
              body="Your next bill will drop at the start of the month."
            />
          )}
          <AlertStrip
            tone="info"
            icon={<Sparkles className="h-4 w-4" />}
            title="Rates clearance now 3 working days"
            body="Fully-settled accounts are now eligible for fast-track clearance."
            href="#"
            cta="Learn more"
          />
        </div>
      </ScrollReveal>

      {/* Properties */}
      <section className="mb-8">
        <ScrollReveal>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-h3 text-ink">My properties</h2>
            <span className="text-small text-muted">
              {properties.length} linked
            </span>
          </div>
        </ScrollReveal>
        <div className="grid gap-3 md:grid-cols-2">
          {properties.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 70}>
              <PropertyCard property={p} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-8">
        <ScrollReveal>
          <h2 className="mb-4 text-h3 text-ink">Quick actions</h2>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <QuickActions />
        </ScrollReveal>
      </section>

      {/* Recent activity */}
      <section>
        <ScrollReveal>
          <RecentActivity transactions={transactions} propertyMap={propertyMap} />
        </ScrollReveal>
      </section>
    </div>
  );
}
