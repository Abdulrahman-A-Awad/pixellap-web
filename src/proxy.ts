import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next 16: `proxy.ts` replaces `middleware.ts`. Adds the locale prefix and redirects `/`.
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
