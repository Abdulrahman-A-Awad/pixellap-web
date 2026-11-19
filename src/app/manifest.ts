import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getSite } from '@/lib/api/endpoints';

/** Web app manifest (/manifest.webmanifest). Name and description come from the CMS settings. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { data: site } = await getSite(routing.defaultLocale);
  const { settings } = site;

  return {
    name: settings.site_name,
    short_name: settings.site_name,
    description: settings.seo_default_description,
    start_url: `/${routing.defaultLocale}`,
    display: 'standalone',
    // Dark is the default theme (matches --bg / the royal brand colour).
    background_color: '#06030F',
    theme_color: '#06030F',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
