import { ArrowLeft, Hammer, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { COUNCILLORS } from '@/mocks/fixtures/councillors';
import { SERVICE_REQUESTS } from '@/mocks/fixtures/service-requests';
import { WARDS } from '@/mocks/fixtures/wards';

export default async function WardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ward = WARDS.find((w) => w.id === id);
  if (!ward) return notFound();

  const councillor = COUNCILLORS.find((c) => c.wardId === ward.id);
  const wardRequests = SERVICE_REQUESTS.filter((r) => r.ward === ward.name);
  const resolvedCount = wardRequests.filter((r) => r.status === 'resolved').length;
  const openCount = wardRequests.filter((r) => r.status !== 'resolved').length;

  return (
    <>
      <PageHero
        eyebrow="Ward"
        title={`${ward.name} Ward`}
        description={
          councillor
            ? `Represented by ${councillor.title}, serving since ${new Date(councillor.tenureStart).getFullYear()}.`
            : `Represented by ${ward.councillor}.`
        }
        badge={
          <Badge tone="brand" dot>
            <MapPin className="h-3 w-3" />
            {ward.centroid.lat.toFixed(2)}, {ward.centroid.lng.toFixed(2)}
          </Badge>
        }
        actions={
          <>
            <Link
              href="/wards"
              className="inline-flex items-center gap-1.5 rounded-sm text-small font-medium text-muted hover:text-brand-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All wards
            </Link>
          </>
        }
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Featured project */}
          {ward.featuredProject && (
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
                <Image
                  src={ward.featuredProject.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-6">
                <Badge tone="brand">
                  <Hammer className="h-3 w-3" />
                  Featured project
                </Badge>
                <h2 className="mt-3 text-h3 text-ink">{ward.featuredProject.title}</h2>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-small">
                    <span className="text-muted">Progress</span>
                    <span className="font-semibold tabular-nums text-ink">
                      {ward.featuredProject.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-[width] duration-slow ease-out-expo"
                      style={{ width: `${ward.featuredProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-4">
            {/* Councillor */}
            <Card className="p-5 sm:p-6">
              <h3 className="text-h3 text-ink">Ward councillor</h3>
              {councillor ? (
                <>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="relative inline-block h-12 w-12 overflow-hidden rounded-full bg-brand-primary/10">
                      {councillor.photoUrl ? (
                        <Image src={councillor.photoUrl} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-small font-semibold text-brand-primary">
                          {councillor.fullName
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((n) => n[0]?.toUpperCase())
                            .join('')}
                        </span>
                      )}
                    </span>
                    <div>
                      <div className="text-body font-semibold text-ink">{councillor.title}</div>
                      <p className="mt-1 text-small text-muted">{councillor.bio}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-small">
                    <li className="inline-flex items-center gap-2 text-muted">
                      <Phone className="h-3.5 w-3.5" />
                      <a href={`tel:${councillor.phone.replace(/\s+/g, '')}`} className="text-ink hover:text-brand-primary">
                        {councillor.phone}
                      </a>
                    </li>
                    <li className="inline-flex items-center gap-2 text-muted">
                      <Mail className="h-3.5 w-3.5" />
                      <a href={`mailto:${councillor.email}`} className="text-ink hover:text-brand-primary">
                        {councillor.email}
                      </a>
                    </li>
                  </ul>
                  {councillor.surgeryDay && (
                    <div className="mt-4 rounded-md border border-line bg-surface/50 p-3 text-small text-ink">
                      <div className="mb-0.5 text-micro font-semibold uppercase tracking-wide text-muted">
                        Surgery
                      </div>
                      {councillor.surgeryDay}
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 text-small text-muted">Councillor information not yet on file.</p>
              )}
            </Card>

            {/* Service requests summary */}
            <Card className="p-5 sm:p-6">
              <h3 className="text-h3 text-ink">Service requests</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-small">
                <Metric label="Open" value={String(openCount)} tone="warning" />
                <Metric label="Resolved" value={String(resolvedCount)} tone="success" />
              </div>
              <Link
                href={`/erp/requests?ward=${ward.name}`}
                className="mt-4 inline-flex items-center gap-1 text-small font-medium text-brand-primary hover:underline"
              >
                See all in this ward →
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'warning' | 'success' }) {
  return (
    <div className="rounded-md border border-line bg-surface/50 p-3 text-center">
      <div
        className={
          tone === 'success'
            ? 'text-[22px] font-bold tabular-nums text-success'
            : 'text-[22px] font-bold tabular-nums text-warning'
        }
      >
        {value}
      </div>
      <div className="text-micro text-muted">{label}</div>
    </div>
  );
}
