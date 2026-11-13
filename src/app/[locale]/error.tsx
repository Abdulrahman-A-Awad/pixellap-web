'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';

// Next 16 error boundary contract: { error: unknown, retry }.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useSite();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70dvh] items-center pt-24">
      <div className="container-page flex flex-col items-start gap-6">
        <h1 className="text-heading">{t('misc.error_title')}</h1>
        <p className="max-w-xl text-lg text-muted">{t('misc.error_text')}</p>
        <button type="button" onClick={() => retry()} className={buttonClasses('primary')}>
          <RotateCcw aria-hidden="true" className="size-4" />
          {t('misc.try_again')}
        </button>
      </div>
    </section>
  );
}
