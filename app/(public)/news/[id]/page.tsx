'use client';

import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/format';
import { useAllNews } from '@/lib/hooks/use-public-content';
import type { NewsCategory } from '@/mocks/fixtures/news';

const CATEGORY_TONE: Record<NewsCategory, 'brand' | 'info' | 'warning' | 'gold' | 'success'> = {
  notice: 'brand',
  event: 'info',
  alert: 'warning',
  tender: 'gold',
  update: 'success',
};

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const all = useAllNews();
  const item = all.find((n) => n.id === id);

  if (!item) return notFound();
  const related = all.filter((n) => n.id !== item.id && n.category === item.category).slice(0, 3);

  const share = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${item.title} — ${item.summary}`;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      (navigator as Navigator).share({ title: item.title, text, url: shareUrl }).catch(() => undefined);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
    }
  };

  return (
    <>
      <PageHero
        eyebrow="News & public notices"
        title={item.title}
        description={item.summary}
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={CATEGORY_TONE[item.category]}>{item.category.toUpperCase()}</Badge>
            {item.ward && <Badge tone="neutral">Ward {item.ward}</Badge>}
          </div>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={share}
              leadingIcon={<Share2 className="h-3.5 w-3.5" />}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href);
                toast({ title: 'Link copied', tone: 'success' });
              }}
            >
              Copy link
            </Button>
          </>
        }
      />

      <section className="mx-auto max-w-[860px] px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-14">
        <Link
          href="/news"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All notices
        </Link>

        <Card className="p-6 sm:p-8">
          <div className="mb-4 text-micro text-muted">
            Published <time dateTime={item.date}>{formatDate(item.date)}</time>
          </div>
          <p className="text-body leading-7 text-ink">{item.summary}</p>
          <div className="mt-6 space-y-4 text-body leading-7 text-ink">
            <p>
              This notice is published under the council's commitment to open governance. For questions,
              contact the Council Secretariat on <a href="tel:+263392000000" className="font-medium text-brand-primary hover:underline">+263 39 2 000 000</a> or the relevant ward councillor.
            </p>
            <p>
              Updates to this notice — when they happen — are published here and pushed via SMS, WhatsApp
              and the Bikita RDC app to residents who have opted in.
            </p>
          </div>
        </Card>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-h3 text-ink">More in {item.category}</h2>
            <ul className="grid gap-3 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/news/${r.id}`}>
                    <Card className="group h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-sm">
                      <Badge tone={CATEGORY_TONE[r.category]}>{r.category}</Badge>
                      <h3 className="mt-2 text-small font-semibold text-ink group-hover:text-brand-primary">
                        {r.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-micro text-muted">{r.summary}</p>
                      <div className="mt-3 inline-flex items-center gap-1 text-micro font-medium text-brand-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Read <ArrowRight className="h-3 w-3" />
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
