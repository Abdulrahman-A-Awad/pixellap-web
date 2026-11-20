import 'server-only';

/**
 * Pre-launch mode (env PRELAUNCH=true, server-only, read at build time): the site stays out of
 * search engines — robots.txt disallows everything and every page gets
 * <meta name="robots" content="noindex, nofollow">. PRELAUNCH=false (or unset) = normal SEO.
 * Changing it needs a rebuild (deploy-web.sh). Nginx adds basic auth + X-Robots-Tag separately.
 */
export const PRELAUNCH = process.env.PRELAUNCH === 'true';
