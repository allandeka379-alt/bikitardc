'use client';

import { RotateCw, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function OfflinePage() {
  const t = useTranslations('errors.offline');

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="mx-auto w-full max-w-[1200px] px-5 py-5 sm:px-8">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-5 pb-20 text-center sm:px-8">
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-warning/10 text-warning">
          <WifiOff className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-h1 text-ink">{t('title')}</h1>
        <p className="mt-2 max-w-prose text-body text-muted">{t('subtitle')}</p>
        <Button
          className="mt-8"
          onClick={() => location.reload()}
          leadingIcon={<RotateCw className="h-4 w-4" />}
        >
          {t('retry')}
        </Button>
      </main>
    </div>
  );
}
