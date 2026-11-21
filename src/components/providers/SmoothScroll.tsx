'use client';

import { useEffect } from 'react';
import { useIdleAfterLoad } from '@/lib/hooks/useExternal';
import { setLenis } from '@/lib/motion/lenis';
import { usePrefersReducedMotion } from '@/lib/motion/useReducedMotion';

/**
 * Lenis smooth scrolling driven by GSAP's ticker (one shared RAF loop) and kept in sync
 * with ScrollTrigger. Disabled entirely for prefers-reduced-motion (native scrolling).
 * Lenis + GSAP are imported after load + idle so they never weigh on the first paint.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const idle = useIdleAfterLoad();

  useEffect(() => {
    if (reduced || !idle) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        // lerp 0.13: responsive wheel smoothing (0.1 felt laggy). Touch stays native (syncTouch off):
        // phones scroll with their own momentum, never through Lenis.
        const lenis = new Lenis({ autoRaf: false, lerp: 0.13, smoothWheel: true, syncTouch: false });
        setLenis(lenis);
        lenis.on('scroll', ScrollTrigger.update);

        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        cleanup = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          setLenis(null);
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced, idle]);

  return null;
}
