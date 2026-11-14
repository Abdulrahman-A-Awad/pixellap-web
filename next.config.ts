import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// next-intl is used for routing only (copy comes from the API's ui_strings).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
    dangerouslyAllowLocalIP: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(process.env.API_URL ?? ''),
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'pixellap.com', pathname: '/storage/**' },
      { protocol: 'https', hostname: '*.pixellap.com', pathname: '/storage/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
