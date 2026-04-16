'use client';

// ─────────────────────────────────────────────
// Role chooser — only reached by dual-role users.
// Spec §1.2, §2 (dual-role stretch goal).
// ─────────────────────────────────────────────

import { ArrowRight, Briefcase, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth';

export default function ChooseRolePage() {
  const t = useTranslations('auth.chooseRole');
  const router = useRouter();
  const setActiveRole = useAuthStore((s) => s.setActiveRole);

  const pick = (role: 'resident' | 'clerk', href: string) => {
    setActiveRole(role);
    router.push(href);
  };

  const options = [
    {
      id: 'resident' as const,
      title: t('resident'),
      desc: t('residentDesc'),
      icon: <UserRound className="h-6 w-6" />,
      accent: 'bg-brand-primary/10 text-brand-primary',
      role: 'resident' as const,
      href: '/portal/dashboard',
    },
    {
      id: 'staff' as const,
      title: t('staff'),
      desc: t('staffDesc'),
      icon: <Briefcase className="h-6 w-6" />,
      accent: 'bg-brand-accent/15 text-[#8a6e13]',
      role: 'clerk' as const,
      href: '/erp/dashboard',
    },
  ];

  return (
    <div className="mx-auto mt-4 w-full max-w-[720px] lg:mt-10">
      <div className="mb-8 text-center">
        <h1 className="text-h1 text-ink">{t('title')}</h1>
        <p className="mt-1 text-small text-muted">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((opt) => (
          <Card
            key={opt.id}
            role="button"
            tabIndex={0}
            onClick={() => pick(opt.role, opt.href)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pick(opt.role, opt.href);
              }
            }}
            className="group cursor-pointer p-6 transition-[transform,border-color,box-shadow] duration-base ease-out-expo hover:-translate-y-1 hover:border-brand-primary/25 hover:shadow-card-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            <div className={`mb-4 grid h-12 w-12 place-items-center rounded-md ${opt.accent}`} aria-hidden>
              {opt.icon}
            </div>
            <h2 className="text-h3 text-ink">{opt.title}</h2>
            <p className="mt-1 text-small text-muted">{opt.desc}</p>
            <div className="mt-5 inline-flex items-center gap-1 text-small font-medium text-brand-primary">
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5" />
            </div>
          </Card>
        ))}
      </div>

      <label className="mt-8 flex items-center justify-center gap-2 text-small text-muted">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-line text-brand-primary focus:ring-brand-primary/40"
        />
        {t('rememberChoice')}
      </label>
    </div>
  );
}
