'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { observe } from '@/lib/hooks/useInView';

/** Max travel in px (each way). The layer is 2 × RANGE taller than its frame (`.parallax-layer`). */
const RANGE = 24;

/**
 * Gentle scroll parallax for an image inside a rounded frame (the frame clips; this is the moving
 * layer, absolutely positioned 24px past the frame top and bottom). The layer moves −24 → +24px as
 * the frame crosses the viewport. Only while visible (IntersectionObserver), one rAF per scroll
 * frame, transform only; nothing under reduced motion. Server HTML = centred layer.
 */
export function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const frame = layer?.parentElement;
    if (!layer || !frame || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const r = frame.getBoundingClientRect();
      const vh = window.innerHeight;
      // −1 when the frame's centre is at the bottom edge, +1 at the top edge.
      const t = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
      layer.style.transform = `translate3d(0, ${(t * RANGE).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const stop = observe(frame, (entry) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      stop();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={cn('parallax-layer', className)}>
      {children}
    </div>
  );
}
