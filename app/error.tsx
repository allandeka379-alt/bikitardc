'use client';

import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.serverError');

  useEffect(() => {
    // In a real deploy this would fire to the observability pipeline.
    console.error('[BikitaRDC] Route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="mx-auto w-full max-w-[1200px] px-5 py-5 sm:px-8">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-5 pb-20 text-center sm:px-8">
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-h1 text-ink">{t('title')}</h1>
        <p className="mt-2 text-body text-muted">{t('subtitle')}</p>
        {error.digest && (
          <p className="mt-3 font-mono text-micro text-muted">ref: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()} leadingIcon={<RotateCw className="h-4 w-4" />}>
            {t('retry')}
          </Button>
          <Button asChild variant="secondary" leadingIcon={<Home className="h-4 w-4" />}>
            <Link href="/">{t('goHome')}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
