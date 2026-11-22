import type { Transition } from 'motion/react';

/**
 * Motion system: ONE source for durations, easings, springs, stagger and reveal offsets.
 * - Motion components (lazy islands only: menu sheet, showreel dialog) import these values.
 * - CSS motion mirrors them as custom properties in globals.css (`--dur-*`, `--ease-out-expo`,
 *   `--ease-spring`, `--ease-pop`) — section reveals (`components/motion/Reveal` +
 *   `[data-reveal-state]`), hover lifts, button press, navbar, process, stacking cards.
 * Reveals are deliberately NOT Motion components: ~30 of them on the home page would cost the
 * mobile main thread far more than CSS transitions (Lighthouse budget).
 * Reduced motion: Motion islands use <MotionConfig reducedMotion="user">; Reveal skips to the final
 * state; CSS motion is neutralised globally.
 */

/** Seconds. CSS: --dur-fast / --dur-base / --dur-slow. */
export const duration = { fast: 0.2, base: 0.45, slow: 0.8 } as const;

/** Cubic-bezier easings. CSS: --ease-out-expo. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** Springs (Apple-like: no wobble on large moves). CSS approximation: --ease-spring. */
export const spring = {
  soft: { type: 'spring', stiffness: 120, damping: 20, mass: 1 },
  snappy: { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 },
} as const satisfies Record<string, Transition>;

/** Delay between siblings in a staggered group (seconds). CSS reveals: --reveal-index × 80ms. */
export const stagger = { tight: 0.06, base: 0.08 } as const;

/** Reveal offsets (CSS: [data-reveal-state='hidden'] rules). */
export const offset = { rise: 24, scale: 0.96, blur: 8, slide: 32 } as const;

export type RevealVariant = 'fade-up' | 'scale-in' | 'blur-in' | 'slide-start' | 'slide-end';

/** Reveal trigger: once the element's top passes 85% of the viewport (never stuck on very tall blocks). */
export const revealViewport = { rootMargin: '0px 0px -15% 0px', threshold: 0 } as const;
