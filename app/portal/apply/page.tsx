'use client';

// Service picker — spec §5 / §6.2 screen #7.
// The 8 application types we document, each
// linking to /portal/apply/[slug]. Currently only
// business-licence has a full wizard; others
// redirect to a ComingSoon stub.

import {
  Beer,
  Briefcase,
  ClipboardCheck,
  FileBadge2,
  Flower,
  HardHat,
  Home,
  Store,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Service {
  slug: string;
  title: string;
  description: string;
  feeUsd: number;
  Icon: LucideIcon;
  demoStatus: 'full' | 'visual';
  tint: string;
}

const SERVICES: Service[] = [
  { slug: 'business-licence',  title: 'Business licence',   description: 'Register, renew or transfer a trading licence.',  feeUsd: 25, Icon: Briefcase,      demoStatus: 'full',   tint: 'bg-brand-accent/15 text-[#8a6e13]' },
  { slug: 'building-plan',     title: 'Building plan',       description: 'Submit plans for review by the Urban Planning department.', feeUsd: 60, Icon: HardHat,        demoStatus: 'visual', tint: 'bg-warning/10 text-warning' },
  { slug: 'market-stall',      title: 'Market stall',        description: 'Apply for a market stall or allocation.',          feeUsd: 10, Icon: Store,          demoStatus: 'visual', tint: 'bg-info/10 text-info' },
  { slug: 'residential-stand', title: 'Residential stand',    description: 'Apply for a residential stand within a ward.',    feeUsd: 15, Icon: Home,           demoStatus: 'visual', tint: 'bg-brand-primary/10 text-brand-primary' },
  { slug: 'liquor-licence',    title: 'Liquor licence',      description: 'New, renew or transfer a liquor licence.',         feeUsd: 40, Icon: Beer,           demoStatus: 'visual', tint: 'bg-danger/10 text-danger' },
  { slug: 'hawkers-permit',    title: "Hawkers' permit",     description: 'Trade as a hawker in designated zones.',           feeUsd:  8, Icon: ClipboardCheck, demoStatus: 'visual', tint: 'bg-success/10 text-success' },
  { slug: 'burial-order',      title: 'Burial order',        description: 'Request a burial order — sensitive flow.',         feeUsd: 20, Icon: Flower,         demoStatus: 'visual', tint: 'bg-muted/10 text-muted' },
  { slug: 'rates-clearance',   title: 'Rates clearance',     description: 'Auto-issued if your account is fully settled.',    feeUsd:  0, Icon: FileBadge2,     demoStatus: 'visual', tint: 'bg-success/10 text-success' },
];

export default function ApplyPickerPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Apply for a service</h1>
          <p className="mt-1 text-small text-muted">
            Council services you can apply for online. Fees are collected inline where required.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => (
          <ScrollReveal key={s.slug} delay={i * 50}>
            <Link href={`/portal/apply/${s.slug}`}>
              <Card className="group h-full p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md">
                <div className="flex items-start justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-md ${s.tint}`} aria-hidden>
                    <s.Icon className="h-5 w-5" />
                  </span>
                  {s.demoStatus === 'full' ? (
                    <Badge tone="success">Live demo</Badge>
                  ) : (
                    <Badge tone="warning">Preview</Badge>
                  )}
                </div>
                <h3 className="mt-4 text-body font-semibold text-ink group-hover:text-brand-primary">
                  {s.title}
                </h3>
                <p className="mt-1 text-small text-muted">{s.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-micro">
                  <span className="text-muted">Fee</span>
                  <span className="font-semibold tabular-nums text-ink">
                    {s.feeUsd > 0 ? `$${s.feeUsd.toFixed(2)}` : 'Free'}
                  </span>
                </div>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
