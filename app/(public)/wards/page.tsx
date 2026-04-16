import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { COUNCILLORS } from '@/mocks/fixtures/councillors';
import { WARDS } from '@/mocks/fixtures/wards';

export const metadata = {
  title: 'Wards',
  description: 'Every ward in Bikita, with its councillor, projects and contacts.',
};

export default function WardsListPage() {
  return (
    <>
      <PageHero
        eyebrow="Wards"
        title="Bikita by ward."
        description="One page per ward — councillor, projects, and how to reach the office."
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {WARDS.map((w, i) => {
            const councillor = COUNCILLORS.find((c) => c.wardId === w.id);
            return (
              <li key={w.id}>
                <ScrollReveal delay={i * 50}>
                  <Link href={`/wards/${w.id}`}>
                    <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
                        {w.featuredProject?.imageUrl && (
                          <Image
                            src={w.featuredProject.imageUrl}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-micro font-semibold text-brand-primary shadow-card-sm">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {w.name} ward
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div>
                          <div className="text-micro text-muted">Councillor</div>
                          <div className="text-body font-semibold text-ink">
                            {councillor?.title ?? w.councillor}
                          </div>
                        </div>
                        {w.featuredProject && (
                          <div>
                            <Badge tone="brand">Featured project</Badge>
                            <p className="mt-1 line-clamp-2 text-small text-muted">
                              {w.featuredProject.title}
                            </p>
                          </div>
                        )}
                        <div className="mt-auto inline-flex items-center gap-1 text-small font-medium text-brand-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Open ward
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
