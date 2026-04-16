import {
  Briefcase,
  CalendarDays,
  Hammer,
  HeartHandshake,
  Landmark,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/page-hero';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'About the council',
  description: 'About the Bikita Rural District Council — mandate, departments and how to reach us.',
};

const DEPARTMENTS = [
  { Icon: Hammer,         name: 'Works & Infrastructure',      desc: 'Roads, bridges, water points, electrification.' },
  { Icon: Briefcase,      name: 'Licensing',                    desc: 'Business licences, liquor licences, hawkers.' },
  { Icon: HeartHandshake, name: 'Social Services',              desc: 'Community welfare, clinics, schools liaison.' },
  { Icon: Landmark,       name: 'Finance',                      desc: 'Rates, budget, procurement, reconciliation.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the council"
        title="Bikita Rural District Council."
        description="One of the 60 rural district councils of Zimbabwe. We serve 6 wards across 2 500 km² of Masvingo Province."
      />

      <section className="mx-auto max-w-[1100px] px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-14">
        <Card className="p-6 sm:p-8">
          <h2 className="text-h3 text-ink">Mandate</h2>
          <p className="mt-2 text-body leading-7 text-ink">
            The Bikita Rural District Council operates under the Rural District Councils Act [Chapter
            29:13]. Our mandate is to provide services to residents, collect revenue fairly, regulate
            land-use, and support the economic and social development of the district.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {DEPARTMENTS.map((d) => (
              <div key={d.name} className="flex items-start gap-3 rounded-md border border-line bg-surface/40 p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <d.Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-small font-semibold text-ink">{d.name}</div>
                  <div className="text-micro text-muted">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <h3 className="text-h3 text-ink">Contact us</h3>
            <dl className="mt-3 space-y-2.5 text-small">
              <dt className="sr-only">Address</dt>
              <dd className="flex items-start gap-2 text-ink">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                Bikita Civic Centre · PO Box 1 · Bikita · Masvingo Province
              </dd>
              <dt className="sr-only">Phone</dt>
              <dd className="flex items-center gap-2 text-ink">
                <Phone className="h-4 w-4 text-muted" />
                <a href="tel:+263392000000" className="hover:text-brand-primary">
                  +263 39 2 000 000
                </a>
              </dd>
              <dt className="sr-only">Email</dt>
              <dd className="flex items-center gap-2 text-ink">
                <Mail className="h-4 w-4 text-muted" />
                <a href="mailto:info@bikita.gov.zw" className="hover:text-brand-primary">
                  info@bikita.gov.zw
                </a>
              </dd>
              <dt className="sr-only">Hours</dt>
              <dd className="flex items-center gap-2 text-ink">
                <CalendarDays className="h-4 w-4 text-muted" />
                Monday – Friday, 08:00 – 16:30
              </dd>
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="text-h3 text-ink">Quick links</h3>
            <ul className="mt-3 space-y-2 text-small">
              <li>
                <Link href="/councillors" className="text-brand-primary hover:underline">
                  Your councillors & ward contacts
                </Link>
              </li>
              <li>
                <Link href="/meetings" className="text-brand-primary hover:underline">
                  Council meeting calendar
                </Link>
              </li>
              <li>
                <Link href="/budget" className="text-brand-primary hover:underline">
                  Current-year budget & revenue
                </Link>
              </li>
              <li>
                <Link href="/tenders" className="text-brand-primary hover:underline">
                  Open procurement tenders
                </Link>
              </li>
              <li>
                <Link href="/bylaws" className="text-brand-primary hover:underline">
                  The by-laws that govern the district
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      </section>
    </>
  );
}
