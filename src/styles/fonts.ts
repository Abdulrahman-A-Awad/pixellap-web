import { IBM_Plex_Sans_Arabic } from 'next/font/google';

/**
 * The ONLY place fonts are defined. Exposes the CSS variable --font-sans.
 *
 * Brand font RH-Zak is not delivered yet. When it arrives, replace this file with:
 *
 *   import localFont from 'next/font/local';
 *   export const fontSans = localFont({
 *     src: [
 *       { path: '../../public/fonts/RH-Zak-Thin.woff2', weight: '100', style: 'normal' },
 *       { path: '../../public/fonts/RH-Zak-Regular.woff2', weight: '400', style: 'normal' },
 *       { path: '../../public/fonts/RH-Zak-Bold.woff2', weight: '700', style: 'normal' },
 *     ],
 *     variable: '--font-sans',
 *     display: 'swap',
 *   });
 */
export const fontSans = IBM_Plex_Sans_Arabic({
  weight: ['300', '400', '500', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
});
