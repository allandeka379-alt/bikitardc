import { ArrowRight, MapPin, Phone, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ATTRACTIONS,
  ATTRACTION_LABEL,
  CULTURE,
  GUESTHOUSES,
  TIER_LABEL,
} from '@/mocks/fixtures/tourism';
import { cn } from '@/lib/cn';

const TIER_STYLE: Record<keyof typeof TIER_LABEL, string> = {
  budget:   'bg-success/10 text-success',
  standard: 'bg-brand-primary/10 text-brand-primary',
  premium:  'bg-brand-accent/15 text-[#8a6e13]',
};

export const metadata = {
  title: 'Tourism',
  description: 'Places to visit, where to stay, and local culture in Bikita district.',
};

export default function TourismPage() {
  return (
    <>
      <PageHero
        eyebrow="Visit Bikita"
        title="Places, stays and culture."
        description="Ancient stone kraals, seasonal waterfalls, a baobab grove and a thriving craft market — a small district with a lot to see."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/about">How to reach us</Link>
          </Button>
        }
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-20 pt-12 sm:px-8 sm:pt-14">
        <h2 className="text-h3 text-ink">Places to visit</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ATTRACTIONS.map((a, i) => (
            <li key={a.id}>
              <ScrollReveal delay={i * 50}>
                <Card className="group h-full overflow-hidden transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
                  <div className="relative aspect-[16/10] w-full bg-surface">
                    <Image
                      src={a.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-micro font-semibold text-brand-primary shadow-card-sm">
                      <MapPin className="h-3 w-3" />
                      {a.ward} ward
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge tone="brand">{ATTRACTION_LABEL[a.kind]}</Badge>
                    <h3 className="mt-3 text-body font-semibold text-ink">{a.name}</h3>
                    <p className="mt-1 text-small text-muted">{a.blurb}</p>
                  </div>
                </Card>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
        <h2 className="text-h3 text-ink">Where to stay</h2>
        <p className="mt-1 text-small text-muted">
          Four registered guesthouses across the district. All are licensed with the council.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {GUESTHOUSES.map((g, i) => (
            <li key={g.id}>
              <ScrollReveal delay={i * 40}>
                <Card className="h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-body font-semibold text-ink">{g.name}</h3>
                      <p className="mt-0.5 text-micro text-muted">{g.ward} ward</p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-micro font-semibold capitalize',
                        TIER_STYLE[g.tier],
                      )}
                    >
                      {TIER_LABEL[g.tier]}
                    </span>
                  </div>
                  <p className="mt-3 text-small text-muted">{g.blurb}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-micro">
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <Users className="h-3.5 w-3.5" />
                      {g.rooms} rooms
                    </span>
                    <span className="tabular-nums text-ink">
                      From <span className="font-semibold">${g.nightlyUsdFrom}</span>/night
                    </span>
                    <a
                      href={`tel:${g.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 text-brand-primary hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {g.phone}
                    </a>
                  </div>
                </Card>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8 sm:pb-32">
        <h2 className="text-h3 text-ink">Local culture</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {CULTURE.map((c, i) => (
            <li key={c.id}>
              <ScrollReveal delay={i * 40}>
                <Card className="h-full p-5">
                  <h3 className="text-body font-semibold text-ink">{c.title}</h3>
                  <p className="mt-2 text-small text-muted">{c.body}</p>
                </Card>
              </ScrollReveal>
            </li>
          ))}
        </ul>

        <Card className="mt-8 border-brand-primary/20 bg-brand-primary/5 p-5 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-h3 text-ink">Plan a visit with the council</h3>
              <p className="mt-1 text-small text-muted">
                We can arrange guided tours, cultural evenings or a conference room. Reach out any time.
              </p>
            </div>
            <Button asChild trailingIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href="/about">Contact the council</Link>
            </Button>
          </div>
        </Card>
      </section>
    </>
  );
}
