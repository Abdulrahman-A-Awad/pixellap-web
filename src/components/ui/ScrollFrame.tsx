'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { observe } from '@/lib/hooks/useInView';

/**
 * Apple-style hero media frame: as the page scrolls away from the top, the frame eases from scale 1
 * down to `.scroll-frame` min scale and its image layer (`.scroll-frame-layer`, 48px taller than the
 * frame) drifts down for depth. One progress value `--sp` (0 at the top of the page → 1 once the
 * frame has mostly scrolled past) written on the frame, only while it is visible, one rAF per scroll
 * frame; CSS does the rest (transform-only). Server HTML / reduced motion = `--sp` unset = scale 1,
 * centred layer, so there is no shift on hydration.
 */
export function ScrollFrame({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const r = frame.getBoundingClientRect();
      // Document top of the frame (stable while scrolling): progress ends when 60% of it has passed the top.
      const top = r.top + window.scrollY;
      const p = Math.max(0, Math.min(1, window.scrollY / (top + r.height * 0.6)));
      frame.style.setProperty('--sp', p.toFixed(4));
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const stop = observe(frame, (entry) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      stop();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={cn('scroll-frame', className)}>
      {children}
    </div>
  );
}
