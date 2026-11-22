import 'server-only';
import type { Metadata } from 'next';
import { getSite } from '@/lib/api/endpoints';
import type { Locale } from '@/lib/api/types';
import { routing } from '@/i18n/routing';
import { PRELAUNCH } from '@/lib/prelaunch';
import { SITE_URL } from '@/lib/site-url';

interface PageSeo {
  locale: Locale;
  /** Path without locale, starting with "/" ("/" for home). */
  path: string;
  title?: string | null;
  description?: string | null;
}

/** public/og-default.jpg — 1200×630 brand image (cube + tagline, JPG ~55 KB), used when nothing else is set. */
const DEFAULT_OG_IMAGE = '/og-default.jpg';

/** Open Graph locales (WhatsApp / Facebook read these). */
const OG_LOCALE: Record<Locale, string> = { en: 'en_US', ar: 'ar_AE' };

/** "Page | Site name" in the current language, unless the title already names the site. */
export function withSiteSuffix(title: string, siteName: string): string {
  if (!siteName || title.includes(siteName)) return title;
  return `${title} | ${siteName}`;
}

function localizedUrl(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path === '/' ? '' : path}`;
}

/**
 * Title/description from the page's SEO fields, falling back to the site defaults; the title gets the
 * localized site name as suffix (`settings.site_name`: "Pixellap" / "بكسل لاب").
 * Adds canonical, hreflang alternates (en, ar, x-default), Open Graph and the Twitter card.
 *
 * Share image: always the site sharing image (Settings → SEO, else public/og-default.jpg) — a
 * 1200×630 JPG that WhatsApp / Facebook / LinkedIn all accept (page photos are large WebP/AVIF of
 * any ratio, which link previews crop badly or ignore).
 */
export async function buildMetadata({ locale, path, title, description }: PageSeo): Promise<Metadata> {
  const { data: site } = await getSite(locale);
  const { settings } = site;
  const resolvedTitle = withSiteSuffix(title || settings.seo_default_title, settings.site_name);
  const resolvedDescription = description || settings.seo_default_description;
  const url = localizedUrl(locale, path);
  const ogImage = {
    url: settings.og_image || DEFAULT_OG_IMAGE,
    width: 1200,
    height: 630,
    alt: `${settings.site_name} — ${settings.tagline}`,
    type: 'image/jpeg',
  };
  const otherLocales = routing.locales.filter((l) => l !== locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    // Pre-launch: every page (the [locale] layout uses this too) is noindex, nofollow.
    ...(PRELAUNCH && { robots: { index: false, follow: false } }),
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
      locale: OG_LOCALE[locale],
      alternateLocale: otherLocales.map((l) => OG_LOCALE[l]),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [{ url: ogImage.url, alt: ogImage.alt }],
    },
  };
}
