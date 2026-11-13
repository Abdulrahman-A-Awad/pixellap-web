import type Lenis from 'lenis';

/** The page's Lenis instance (null when reduced motion is on or before mount). */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Lock/unlock page scrolling (menus, dialogs) — works with or without Lenis. */
export function lockScroll(locked: boolean): void {
  if (locked) instance?.stop();
  else instance?.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
