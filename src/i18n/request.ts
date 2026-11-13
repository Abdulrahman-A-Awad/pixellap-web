import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * next-intl is used for routing only: no message files.
 * All copy comes from the API (`ui_strings` via GET /site) — see src/lib/site.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return { locale, messages: {} };
});
