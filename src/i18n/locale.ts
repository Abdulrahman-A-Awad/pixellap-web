import 'server-only';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/api/types';
import { routing } from './routing';

/**
 * Validates the [locale] param (404 otherwise) and registers it with next-intl so
 * nothing reads request headers — keeps pages statically prerenderable.
 * Call at the top of every layout/page/generateMetadata under [locale].
 */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
