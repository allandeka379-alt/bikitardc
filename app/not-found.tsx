import { Compass, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  const t = useTranslations('errors.notFound');

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="mx-auto w-full max-w-[1200px] px-5 py-5 sm:px-8">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-5 pb-20 text-center sm:px-8">
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
          <Compass className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-h1 text-ink sm:text-[2.25rem] sm:leading-[2.75rem]">
          {t('title')}
        </h1>
        <p className="mt-2 text-body text-muted">{t('subtitle')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild leadingIcon={<Home className="h-4 w-4" />}>
            <Link href="/">{t('goHome')}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/#services">{t('services')}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
