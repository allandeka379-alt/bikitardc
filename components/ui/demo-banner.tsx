// Site-wide demo banner — spec §10.2 mandate.
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DemoBanner() {
  const t = useTranslations('common');
  return (
    <div
      role="status"
      className="relative isolate z-[45] w-full bg-brand-accent/12 text-[#7a5f10]"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-4 py-1.5 text-micro font-medium">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
        <span>{t('demoBanner')}</span>
      </div>
    </div>
  );
}
