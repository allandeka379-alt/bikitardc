'use client';

// ─────────────────────────────────────────────
// Login page — role-aware client-side redirect.
// Credentials are matched against DEMO_USERS only.
// Spec §2 (demo users) and §10.2 (cosmetic login).
// ─────────────────────────────────────────────

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, KeyRound, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/stores/auth';
import { useMfaStore } from '@/lib/stores/mfa';
import { DEMO_USERS, findDemoUser } from '@/mocks/fixtures/users';

const schema = z.object({
  identifier: z.string().min(3, 'Required'),
  password: z.string().min(1, 'Required'),
});

type Schema = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tc = useTranslations('common');
  const router = useRouter();
  const sp = useSearchParams();
  const doLogin = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  });

  async function onSubmit({ identifier, password }: Schema) {
    setSubmitting(true);
    // Simulate a tiny delay so the spinner is perceivable.
    await new Promise((r) => setTimeout(r, 350));

    const user = findDemoUser(identifier, password);
    if (!user) {
      setSubmitting(false);
      toast({ title: t('invalid'), tone: 'danger' });
      return;
    }

    doLogin(user);
    const override = sp.get('redirect');
    const destination = override ?? user.redirect;

    // If MFA is enrolled for this user, challenge before letting them in.
    const enrolled = useMfaStore.getState().items[user.id];
    if (enrolled) {
      router.push(`/mfa?next=${encodeURIComponent(destination)}`);
      return;
    }
    router.push(destination);
  }

  const fillDemo = (idx: number) => {
    const u = DEMO_USERS[idx];
    if (!u) return;
    setValue('identifier', u.email, { shouldValidate: true });
    setValue('password', u.password, { shouldValidate: true });
  };

  return (
    <div className="mx-auto grid max-w-[960px] items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="mt-4 lg:mt-10">
        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-h1 text-ink">{t('title')}</h1>
            <p className="mt-1 text-small text-muted">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div>
              <Label htmlFor="identifier">{t('emailLabel')}</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder={t('emailPlaceholder')}
                  className="pl-9"
                  invalid={!!errors.identifier}
                  {...register('identifier')}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password" className="mb-0">{t('passwordLabel')}</Label>
                <Link
                  href="/reset-password"
                  className="text-micro font-medium text-brand-primary hover:underline"
                >
                  {t('forgot')}
                </Link>
              </div>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('passwordPlaceholder')}
                  className="pl-9"
                  invalid={!!errors.password}
                  {...register('password')}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={submitting}
              trailingIcon={<ArrowRight className="h-4 w-4" />}
              className="mt-2"
            >
              {t('submit')}
            </Button>

            <p className="text-center text-small text-muted">
              {t('noAccount')}{' '}
              <Link href="/register" className="font-medium text-brand-primary hover:underline">
                {t('register')}
              </Link>
            </p>
          </form>
        </Card>
      </div>

      {/* Demo credential hint */}
      <div className="lg:mt-10">
        <Card className="bg-brand-primary/4 p-5 sm:p-6 border-dashed border-brand-primary/20">
          <div className="mb-4 text-small font-semibold text-brand-primary">
            {t('demoHint')}
          </div>
          <ul className="flex flex-col gap-2.5">
            {DEMO_USERS.map((u, i) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => fillDemo(i)}
                  className="group flex w-full items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2.5 text-left transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-sm"
                >
                  <div className="min-w-0">
                    <div className="text-small font-semibold text-ink">
                      {u.role === 'resident' ? t('demoResident') : u.role === 'clerk' ? t('demoClerk') : t('demoBoth')}
                    </div>
                    <div className="truncate-line text-micro text-muted">
                      {u.email} · {u.password}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted transition-all duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:text-brand-primary" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-micro text-muted">
            Click a card to auto-fill the form. {tc('demoBanner')}
          </p>
        </Card>
      </div>
    </div>
  );
}
