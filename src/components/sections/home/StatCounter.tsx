'use client';

import { useEffect, useRef } from 'react';
import { observe } from '@/lib/hooks/useInView';

const DURATION = 1400;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const format = (n: number) => Math.round(n).toLocaleString('en-US');

/**
 * Counts up from 0 when 40% visible (requestAnimationFrame, ease-out, 1.4s).
 * The server HTML already holds the final value (no-JS / crawlers); reduced motion keeps it.
 * Writes textContent directly — no React state per frame.
 */
export function StatCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!alreadyVisible) el.textContent = '0';

    const stop = observe(
      el,
      (entry) => {
        if (!entry.isIntersecting) return;
        stop();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          el.textContent = format(value * easeOutCubic(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      0.4,
    );

    return () => {
      stop();
      cancelAnimationFrame(frame);
      el.textContent = format(value);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  );
}
