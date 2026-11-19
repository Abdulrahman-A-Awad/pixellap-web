import localFont from 'next/font/local';

/**
 * The ONLY place fonts are defined. Brand font RH-Zak covers Arabic + Latin, so one family
 * serves both locales.
 *
 * - `fontSans` (--font-sans): Regular 400 + Bold 700, preloaded. Use `font-normal` / `font-bold`.
 * - `fontThin` (--font-thin): Thin 100, NOT preloaded (separate face so it never competes with
 *   the LCP). Only for large display text — use the `font-display-thin` utility (globals.css).
 *
 * RH-Zak's vertical metrics are unbalanced (ascent 750 / descent 500 for a 700 cap height), which
 * puts Latin text visibly high inside buttons and pills. The overrides re-centre the content area
 * on the x-height/cap-height without changing glyph size (same values on both faces).
 * RH-Zak has no "·" (U+00B7), "…", arrows or tabular figures: avoid "·" in copy and UI code.
 */
export const fontSans = localFont({
  src: [
    { path: '../../public/fonts/RH-Zak-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/RH-Zak-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  // Keep both faces identical (next/font needs literal values here).
  declarations: [
    { prop: 'ascent-override', value: '92%' },
    { prop: 'descent-override', value: '32%' },
    { prop: 'line-gap-override', value: '0%' },
  ],
});

export const fontThin = localFont({
  src: [{ path: '../../public/fonts/RH-Zak-Thin.woff2', weight: '100', style: 'normal' }],
  variable: '--font-thin',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  // Keep both faces identical (next/font needs literal values here).
  declarations: [
    { prop: 'ascent-override', value: '92%' },
    { prop: 'descent-override', value: '32%' },
    { prop: 'line-gap-override', value: '0%' },
  ],
});
