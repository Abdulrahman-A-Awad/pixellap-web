import type { MetadataRoute } from 'next';
import { PRELAUNCH } from '@/lib/prelaunch';
import { SITE_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: nothing may be crawled, and no sitemap is advertised.
  if (PRELAUNCH) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
