'use client';

import { useSite } from '@/components/providers/SiteProvider';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/** "EN / ع" — links to the same page in the other language. */
export function LanguageSwitch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { locale, t } = useSite();
  const pathname = usePathname();
  const other = locale === 'en' ? 'ar' : 'en';

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      onClick={onNavigate}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-bold transition-colors hover:bg-surface-2',
        className,
      )}
    >
      {/* Accessible name keeps the visible text ("Change language: EN / ع"). */}
      <span className="sr-only">{t('misc.language')}: </span>
      <span lang="en" className={locale === 'en' ? 'text-link' : 'text-muted'}>
        EN
      </span>
      <span className="text-muted">/</span>
      <span lang="ar" className={locale === 'ar' ? 'text-link' : 'text-muted'}>
        ع
      </span>
    </Link>
  );
}
