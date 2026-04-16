import { notFound } from 'next/navigation';
import { PageHero } from '@/components/public/page-hero';
import { Card } from '@/components/ui/card';

const PAGES: Record<string, { title: string; body: string }> = {
  privacy: {
    title: 'Privacy policy',
    body: 'This demo does not process real personal data. No sensitive information is stored, shared or sold. A production deployment would publish the full Zimbabwe Data Protection Act compliance statement here.',
  },
  terms: {
    title: 'Terms of use',
    body: 'This is a demonstration of the Bikita Rural District Council digital services platform. All data shown is fabricated for illustration; no binding obligations arise from any interaction within this demo.',
  },
  accessibility: {
    title: 'Accessibility statement',
    body: 'We target WCAG 2.1 AA across the platform. The demo has been built with keyboard navigation, visible focus indicators, semantic markup, colour contrast ≥ 4.5:1 and reduced-motion support. Reach us if you encounter a barrier.',
  },
  'data-protection': {
    title: 'Zimbabwe Data Protection Act',
    body: 'Residents have rights over their personal data. In production, you can submit access, correction or deletion requests from this page; the council responds within 30 days.',
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return notFound();
  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} />
      <section className="mx-auto max-w-[860px] px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-14">
        <Card className="p-6 sm:p-8">
          <p className="text-body leading-7 text-ink">{page.body}</p>
          <p className="mt-4 text-micro text-muted">
            DEMO document — not a live legal instrument.
          </p>
        </Card>
      </section>
    </>
  );
}
