'use client';

import { useState } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/** Language names are proper nouns in their own script (not translated copy). */
const LANGUAGES = [
  { locale: 'en', short: 'EN', name: 'English' },
  { locale: 'ar', short: 'ع', name: 'العربية' },
] as const;

/**
 * Segmented pill "EN | ع" with a thumb under the active language. The active segment is plain text
 * (aria-current); the other one links to the same page in that language. The thumb slides over
 * at once on click, before the new locale renders. Always LTR so EN stays first in both locales.
 */
export function LanguageSwitch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { locale, t } = useSite();
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(null);
  const shown = pending ?? locale;

  return (
    <div
      role="group"
      aria-label={t('misc.language')}
      dir="ltr"
      className={cn(
        'relative inline-grid h-10 grid-cols-2 items-center rounded-pill border border-border bg-surface/70 p-1 text-sm font-bold',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1 start-1 w-[calc(50%-0.25rem)] rounded-pill bg-primary shadow-[0_4px_14px_-6px_var(--accent-glow)] transition-transform duration-[240ms] ease-out-expo',
          shown === 'ar' && 'translate-x-full',
        )}
      />
      {LANGUAGES.map((lang) => {
        const current = lang.locale === locale;
        const label = (
          <span lang={lang.locale} className={lang.locale === 'ar' ? 'text-base leading-none' : undefined}>
            {lang.short}
          </span>
        );
        const segment = cn(
          'relative z-1 inline-flex h-8 min-w-11 items-center justify-center rounded-pill px-3 transition-colors duration-200',
          shown === lang.locale ? 'text-on-primary' : 'text-muted hover:text-text',
        );
        return current ? (
          <span key={lang.locale} aria-current="true" title={lang.name} className={segment}>
            <span className="sr-only">{lang.name}</span>
            <span aria-hidden="true">{label}</span>
          </span>
        ) : (
          <Link
            key={lang.locale}
            href={pathname}
            locale={lang.locale}
            hrefLang={lang.locale}
            lang={lang.locale}
            aria-label={lang.name}
            title={lang.name}
            onClick={() => {
              setPending(lang.locale);
              onNavigate?.();
            }}
            className={segment}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
