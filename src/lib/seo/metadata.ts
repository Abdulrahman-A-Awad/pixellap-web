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

/** public/og-default.jpg — 1200×630 brand image (cube + tagline), used when nothing else is set. */
const DEFAULT_OG_IMAGE = '/og-default.jpg';

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
  // Page image first, then the site-wide sharing image from settings, then the bundled brand image.
  const ogImage = image || settings.og_image || DEFAULT_OG_IMAGE;

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
      images: [ogImage === DEFAULT_OG_IMAGE ? { url: ogImage, width: 1200, height: 630 } : { url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
    },
  };
}
