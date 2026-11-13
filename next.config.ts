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
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'pixellap.com', pathname: '/storage/**' },
      { protocol: 'https', hostname: '*.pixellap.com', pathname: '/storage/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
