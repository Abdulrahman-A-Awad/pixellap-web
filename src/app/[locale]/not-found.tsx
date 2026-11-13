'use client';

import { ArrowLeft } from 'lucide-react';
import { PixelField } from '@/components/brand/PixelField';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const { t } = useSite();

  return (
    <section className="relative isolate flex min-h-[80dvh] items-center pt-24">
      <PixelField seed={404} />
      <div className="container-page flex flex-col items-start gap-6">
        <p className="text-sm font-medium text-link">404</p>
        <h1 className="max-w-3xl text-display">{t('misc.not_found_title')}</h1>
        <p className="max-w-xl text-lg text-muted">{t('misc.not_found_text')}</p>
        <Link href="/" className={buttonClasses('primary')}>
          <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          {t('actions.back_home')}
        </Link>
      </div>
    </section>
  );
}
