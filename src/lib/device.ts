/**
 * Hero rendering tier, decided on the client once per page load.
 *
 *  static → prefers-reduced-motion OR no WebGL2 → poster / brand mark, no motion
 *  video  → (mobile AND (deviceMemory ≤ 4 OR hardwareConcurrency ≤ 4)) OR Save-Data
 *           → the CMS loop video (falls back to 'low' when there is none)
 *  low    → 32 cubes, no postprocessing, dpr ≤ 1.25
 *  high   → everything
 *
 * In development, `?tier=high|low|video|static` forces a tier.
 */
export type Tier = 'high' | 'low' | 'video' | 'static';

export const TIERS: readonly Tier[] = ['high', 'low', 'video', 'static'];

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
  userAgentData?: { mobile?: boolean };
}

export function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    const ok = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Any signal counts (UA client hints, UA string, or a coarse pointer on a small screen):
 * hints alone are unreliable — emulators and some browsers report the host as desktop.
 */
export function isMobileDevice(): boolean {
  const nav = navigator as NavigatorHints;
  return (
    nav.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent) ||
    window.matchMedia('(pointer: coarse) and (max-width: 1024px)').matches
  );
}

/** Dev-only override from the URL (?tier=…). */
function forcedTier(): Tier | null {
  if (process.env.NODE_ENV !== 'development') return null;
  const value = new URLSearchParams(window.location.search).get('tier');
  return TIERS.includes(value as Tier) ? (value as Tier) : null;
}

export function detectTier({ hasVideo }: { hasVideo: boolean }): Tier {
  const forced = forcedTier();
  if (forced) return forced === 'video' && !hasVideo ? 'low' : forced;

  if (prefersReducedMotion() || !hasWebGL2()) return 'static';

  const nav = navigator as NavigatorHints;
  const saveData = nav.connection?.saveData === true;
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  const fewCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;

  if (saveData || (isMobileDevice() && (lowMemory || fewCores))) {
    return hasVideo ? 'video' : 'low';
  }

  // Capable devices; PerformanceMonitor drops to 'low' at runtime if they struggle.
  return 'high';
}
