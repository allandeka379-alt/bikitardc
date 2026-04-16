import {
  ArrowRight,
  CalendarDays,
  FileText,
  Landmark,
  Newspaper,
  PieChart,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Card } from '@/components/ui/card';

interface Tile {
  href: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  accent: 'blue' | 'gold' | 'green' | 'red' | 'sky' | 'violet';
}

const ACCENT: Record<Tile['accent'], string> = {
  blue:   'bg-brand-primary/10 text-brand-primary',
  gold:   'bg-brand-accent/15 text-[#8a6e13]',
  green:  'bg-success/10 text-success',
  red:    'bg-danger/10 text-danger',
  sky:    'bg-info/10 text-info',
  violet: 'bg-[#EDE7FE] text-[#6B40CF]',
};

const TILES: Tile[] = [
  {
    href: '/news',
    Icon: Newspaper,
    title: 'News & notices',
    description: 'Official council announcements, service updates and alerts.',
    accent: 'blue',
  },
  {
    href: '/meetings',
    Icon: CalendarDays,
    title: 'Council meetings',
    description: 'Upcoming sittings, agendas and published minutes.',
    accent: 'sky',
  },
  {
    href: '/tenders',
    Icon: FileText,
    title: 'Active tenders',
    description: 'Open procurement opportunities with closing dates and value ranges.',
    accent: 'gold',
  },
  {
    href: '/bylaws',
    Icon: Landmark,
    title: 'By-laws library',
    description: 'Searchable library of the council by-laws that govern the district.',
    accent: 'violet',
  },
  {
    href: '/councillors',
    Icon: Users,
    title: 'Councillors',
    description: 'Your councillors, contacts, surgery hours and portfolios.',
    accent: 'green',
  },
  {
    href: '/budget',
    Icon: PieChart,
    title: 'Budget',
    description: 'Ward-level revenue, spending and performance against targets.',
    accent: 'red',
  },
];

// (Tourism is linked from the footer too, but is
// intentionally left out of the transparency grid
// — it's a civic front-door, not a governance
// artefact.)

export const metadata = {
  title: 'Transparency',
  description: 'Published council information — news, meetings, tenders, by-laws, budget, councillors.',
};

export default function TransparencyHub() {
  return (
    <>
      <PageHero
        eyebrow="Transparency"
        title="Everything the council publishes, in one place."
        description="News, agendas, tenders, by-laws, budget splits and the people who make decisions — open by default."
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-16">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t, i) => (
            <ScrollReveal key={t.href} delay={i * 50}>
              <Link href={t.href}>
                <Card className="group flex h-full flex-col gap-4 p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md">
                  <span
                    className={`inline-grid h-11 w-11 place-items-center rounded-md ${ACCENT[t.accent]}`}
                    aria-hidden
                  >
                    <t.Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-body font-semibold text-ink group-hover:text-brand-primary">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-small text-muted">{t.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-small font-medium text-brand-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
