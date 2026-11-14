import 'server-only';
import type { Metadata } from 'next';
import { getSite } from '@/lib/api/endpoints';
import type { Locale } from '@/lib/api/types';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site-url';

interface PageSeo {
  locale: Locale;
  /** Path without locale, starting with "/" ("/" for home). */
  path: string;
  title?: string | null;
  description?: string | null;
  /** Absolute image URL for Open Graph (e.g. a page hero or category cover). */
  image?: string | null;
}

function localizedUrl(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path === '/' ? '' : path}`;
}

/**
 * Title/description from the page's SEO fields, falling back to the site defaults.
 * Adds canonical, hreflang alternates (en, ar, x-default) and Open Graph.
 */
export async function buildMetadata({ locale, path, title, description, image }: PageSeo): Promise<Metadata> {
  const { data: site } = await getSite(locale);
  const { settings } = site;
  const resolvedTitle = title || settings.seo_default_title;
  const resolvedDescription = description || settings.seo_default_description;
  const url = localizedUrl(locale, path);
  // Page image first, then the site-wide sharing image from settings.
  image = image || settings.og_image;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
        'x-default': localizedUrl(routing.defaultLocale, path),
      },
    },
    openGraph: {
      type: 'website',
      url,
      siteName: settings.site_name,
      title: resolvedTitle,
      description: resolvedDescription,
      locale: locale === 'ar' ? 'ar_AE' : 'en_AE',
      alternateLocale: locale === 'ar' ? ['en_AE'] : ['ar_AE'],
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: resolvedDescription,
    },
    icons: { icon: '/brand/pixellap-mark.svg' },
  };
}
