import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // `/` → /en or /ar from Accept-Language (then the NEXT_LOCALE cookie).
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];

export const isRtl = (locale: string): boolean => locale === 'ar';
