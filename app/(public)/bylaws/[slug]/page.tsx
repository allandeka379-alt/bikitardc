import { ArrowLeft, BookOpen, Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { BYLAWS, BYLAW_CATEGORY_LABEL, findBylaw } from '@/mocks/fixtures/bylaws';

export function generateStaticParams() {
  return BYLAWS.map((b) => ({ slug: b.slug }));
}

export default async function BylawDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = findBylaw(slug);
  if (!b) return notFound();

  return (
    <>
      <PageHero
        eyebrow={b.chapter}
        title={b.title}
        description={b.summary}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{BYLAW_CATEGORY_LABEL[b.category]}</Badge>
            {b.scope === 'ward' && <Badge tone="gold">Ward-specific</Badge>}
          </div>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
              Download PDF
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/bylaws">All by-laws</Link>
            </Button>
          </>
        }
      />

      <section className="mx-auto max-w-[900px] px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-14">
        <Link
          href="/bylaws"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to library
        </Link>

        <div className="mb-4 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-4 text-small text-brand-primary">
          <div className="mb-1 inline-flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-4 w-4" /> In force from {formatDate(b.effectiveFrom)}
          </div>
          {b.amendedAt && (
            <p>Last amended {formatDate(b.amendedAt)}. Amendments are published in the public record.</p>
          )}
        </div>

        <Card className="p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted" />
            <h2 className="text-h3 text-ink">Sections</h2>
          </div>
          <div className="space-y-6">
            {b.sections.map((s, i) => (
              <section key={i}>
                <h3 className="text-body font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-body leading-7 text-ink">{s.body}</p>
              </section>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
