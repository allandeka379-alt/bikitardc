import { CalendarClock, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import {
  COUNCILLORS,
  ROLE_LABEL,
  executiveCouncillors,
  wardCouncillors,
  type Councillor,
} from '@/mocks/fixtures/councillors';

export const metadata = {
  title: 'Councillors',
  description: 'Your Bikita RDC councillors, committees and ward surgery hours.',
};

export default function CouncillorsPage() {
  const executive = executiveCouncillors();
  const wards = wardCouncillors();

  return (
    <>
      <PageHero
        eyebrow="Councillors"
        title="Your elected representatives."
        description="Contact your ward councillor, find the council executive, and see surgery hours for the whole district."
        badge={
          <div className="hidden rounded-md border border-line bg-card px-4 py-2.5 sm:block">
            <div className="text-micro text-muted">Total</div>
            <div className="text-h3 font-bold tabular-nums text-ink">{COUNCILLORS.length}</div>
          </div>
        }
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        <div className="mb-10">
          <h2 className="mb-1 text-h3 text-ink">Council executive</h2>
          <p className="mb-4 text-small text-muted">Chair, Vice-chair, CEO and Deputy CEO.</p>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {executive.map((c, i) => (
              <li key={c.id}>
                <ScrollReveal delay={i * 50}>
                  <CouncillorCard councillor={c} executive />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-1 text-h3 text-ink">Ward councillors</h2>
          <p className="mb-4 text-small text-muted">One councillor per ward, elected at every local government cycle.</p>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {wards.map((c, i) => (
              <li key={c.id}>
                <ScrollReveal delay={i * 40}>
                  <CouncillorCard councillor={c} />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function CouncillorCard({ councillor: c, executive }: { councillor: Councillor; executive?: boolean }) {
  const initials = c.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-4 border-b border-line px-5 pb-4 pt-5">
        <span className="relative inline-block h-14 w-14 overflow-hidden rounded-full bg-brand-primary/10">
          {c.photoUrl ? (
            <Image src={c.photoUrl} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-small font-semibold text-brand-primary">
              {initials}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate-line text-body font-semibold text-ink">{c.title}</div>
          <div className="truncate-line text-micro text-muted">{ROLE_LABEL[c.role]}</div>
          {c.wardName && (
            <Badge tone="brand" className="mt-1">
              {c.wardName} Ward
            </Badge>
          )}
          {executive && c.committee && (
            <Badge tone="neutral" className="mt-1">
              {c.committee}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 py-4 text-small">
        <p className="line-clamp-3 text-ink">{c.bio}</p>
        <ul className="mt-2 space-y-1 text-micro">
          <li className="inline-flex items-center gap-2 text-muted">
            <Phone className="h-3 w-3" />
            <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="text-ink hover:text-brand-primary">
              {c.phone}
            </a>
          </li>
          <li className="inline-flex items-center gap-2 text-muted">
            <Mail className="h-3 w-3" />
            <a href={`mailto:${c.email}`} className="text-ink hover:text-brand-primary">
              {c.email}
            </a>
          </li>
          {c.surgeryDay && (
            <li className="inline-flex items-start gap-2 text-muted">
              <CalendarClock className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="text-ink">{c.surgeryDay}</span>
            </li>
          )}
        </ul>
        {c.tenureStart && (
          <div className="mt-auto border-t border-line pt-3 text-micro text-muted">
            Serving since {formatDate(c.tenureStart, 'en', { month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
      {c.wardId && (
        <div className="border-t border-line bg-surface/40 px-5 py-2.5 text-right">
          <Link href={`/wards/${c.wardId}`} className="text-micro font-medium text-brand-primary hover:underline">
            View ward →
          </Link>
        </div>
      )}
    </Card>
  );
}
