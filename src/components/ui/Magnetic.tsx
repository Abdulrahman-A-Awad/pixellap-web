'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Pull strength (share of the pointer offset) and the cap, in px. */
const STRENGTH = 0.22;
const MAX = 7;

/**
 * Subtle magnetic hover for primary CTAs: the wrapper drifts towards the pointer (max 7px) and
 * springs back on leave (`.magnetic`, globals.css). Desktop pointers only (hover + fine pointer),
 * never with reduced motion. Writes the CSS `translate` of its OWN element (independent of the
 * button's press `scale`), no React state per move.
 */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!ok.matches) return;
    let frame = 0;
    let next = '';
    const flush = () => {
      frame = 0;
      el.style.translate = next;
    };
    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));
      const x = clamp((event.clientX - (r.left + r.width / 2)) * STRENGTH);
      const y = clamp((event.clientY - (r.top + r.height / 2)) * STRENGTH);
      next = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      el.dataset.pull = '';
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      delete el.dataset.pull;
      el.style.translate = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={ref} className={cn('magnetic inline-flex', className)}>
      {children}
    </span>
  );
}
