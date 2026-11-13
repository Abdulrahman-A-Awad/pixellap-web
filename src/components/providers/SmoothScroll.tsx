'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect } from 'react';
import { setLenis } from '@/lib/motion/lenis';
import { usePrefersReducedMotion } from '@/lib/motion/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling driven by GSAP's ticker (one shared RAF loop) and kept in sync
 * with ScrollTrigger. Disabled entirely for prefers-reduced-motion (native scrolling).
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
