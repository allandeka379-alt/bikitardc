'use client';

import { ArrowLeft, CalendarClock, Download, FileText, Gavel, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import { useAllTenders } from '@/lib/hooks/use-public-content';

export default function TenderDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const all = useAllTenders();
  const t = all.find((x) => x.reference === decodeURIComponent(reference ?? ''));
  if (!t) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Tender notice"
        title={t.title}
        description={`Reference ${t.reference}. Eligible suppliers may submit sealed bids before the stated closing date.`}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge tone={t.status === 'open' ? 'success' : 'neutral'} dot>
              {t.status}
            </Badge>
            <Badge tone="gold">PRAZ-compliant</Badge>
          </div>
        }
        actions={
          <>
            <Button size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
              Download tender document
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tenders">All tenders</Link>
            </Button>
          </>
        }
      />

      <section className="mx-auto max-w-[1100px] px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-14">
        <Link
          href="/tenders"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All tenders
        </Link>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted" />
              <h2 className="text-h3 text-ink">Scope of work</h2>
            </div>
            <p className="text-body leading-7 text-ink">
              The Bikita Rural District Council invites sealed bids from eligible, reputable and experienced
              firms for <span className="font-semibold">{t.title.toLowerCase()}</span>. This procurement is
              carried out under the Public Procurement and Disposal of Public Assets Act and the PRAZ
              guidelines.
            </p>

            <h3 className="mt-6 text-body font-semibold text-ink">Key dates</h3>
            <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-surface/50">
              <DateRow
                label="Bids close"
                value={formatDate(t.closingDate, 'en', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                sub={formatRelative(t.closingDate)}
                Icon={CalendarClock}
              />
              <DateRow
                label="Bid opening (public)"
                value={formatDate(t.closingDate, 'en', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                sub="Same day, 14:00 at council chambers"
                Icon={Gavel}
              />
            </dl>

            <h3 className="mt-6 text-body font-semibold text-ink">Eligibility</h3>
            <ul className="mt-2 space-y-1.5 text-small text-ink">
              <li>• Valid company registration with Zimbabwe Revenue Authority</li>
              <li>• Current tax clearance certificate</li>
              <li>• Proven track record on at least one comparable project in the past 5 years</li>
              <li>• Bid bond or equivalent guarantee of 2% of the bid value</li>
            </ul>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-5 sm:p-6">
              <h3 className="text-h3 text-ink">At a glance</h3>
              <dl className="mt-3 space-y-2.5 text-small">
                <Row label="Reference" value={t.reference} mono />
                <Row label="Estimated value" value={formatCurrency(t.estimatedValueUsd)} />
                <Row label="Closing date" value={formatDate(t.closingDate)} />
                <Row label="Status" value={t.status} />
              </dl>
            </Card>

            <Card className="border-brand-primary/20 bg-brand-primary/5 p-5 sm:p-6">
              <div className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-primary">
                <ShieldCheck className="h-4 w-4" />
                Anti-corruption
              </div>
              <p className="mt-2 text-small text-ink">
                Any attempted bribery or collusion will result in disqualification and referral to ZACC. Bids
                should be lodged only through official council channels.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right font-medium text-ink ${mono ? 'font-mono text-micro' : ''}`}>{value}</dd>
    </div>
  );
}

function DateRow({
  label,
  value,
  sub,
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-micro text-muted">{label}</div>
        <div className="text-small font-semibold text-ink">{value}</div>
        <div className="text-micro text-muted">{sub}</div>
      </div>
    </div>
  );
}
