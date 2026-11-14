import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getSitemap } from '@/lib/api/endpoints';
import { SITE_URL } from '@/lib/site-url';

/**
 * sitemap.xml from GET /sitemap. One entry per URL (both locales), each listing its
 * en/ar alternates (+ x-default) so search engines pair the translations.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await getSitemap();

  // "/en/services/x" → "/services/x" (shared path), to group translations.
  const strip = (path: string) => path.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';
  const url = (locale: string, path: string) => `${SITE_URL}/${locale}${path === '/' ? '' : path}`;

  return data.map((entry) => {
    const path = strip(entry.path);
    return {
      url: `${SITE_URL}${entry.path}`,
      ...(entry.updated_at ? { lastModified: entry.updated_at } : {}),
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : path.split('/').length > 2 ? 0.7 : 0.8,
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
          'x-default': url(routing.defaultLocale, path),
        },
      },
    };
  });
}
