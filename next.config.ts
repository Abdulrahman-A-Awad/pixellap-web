import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// next-intl is used for routing only (copy comes from the API's ui_strings).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

// The API origin serves media (images, posters, videos) that the browser loads directly.
// Production: API_URL=https://api.ppixelmedia.com/api/v1 → only api.ppixelmedia.com is allowed.
const api = new URL(process.env.API_URL ?? 'http://localhost:8000/api/v1');
const isLocalApi = /^(localhost|127\.0\.0\.1)$/.test(api.hostname);
const siteIsHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://');

/**
 * Content-Security-Policy without nonces: the pages are prerendered / partially prerendered,
 * so Next's inline bootstrap scripts (and next-themes' no-flash script) need 'unsafe-inline'.
 * Nonces would force every page to render per request.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? ` 'unsafe-eval'` : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${api.origin}`,
  `media-src 'self' blob: ${api.origin}`,
  `font-src 'self' data:`,
  `connect-src 'self' ${api.origin}${isDev ? ' ws: wss:' : ''}`,
  // Showreel (privacy-enhanced YouTube / Vimeo) and the Google Maps embed on /contact.
  `frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(siteIsHttps ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Nginx compresses (gzip/brotli) in production.
  compress: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Local development only: the API runs on localhost, which the optimizer blocks by default
    // (SSRF protection). Stays false whenever API_URL points at a public host.
    dangerouslyAllowLocalIP: isLocalApi,
    // Only the API's /storage (production: https://api.ppixelmedia.com/storage/**).
    remotePatterns: [
      {
        protocol: api.protocol === 'https:' ? 'https' : 'http',
        hostname: api.hostname,
        ...(api.port ? { port: api.port } : {}),
        pathname: '/storage/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
