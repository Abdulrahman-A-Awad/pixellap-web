'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * Draws the process line as the section scrolls through the viewport (scrubbed, no GSAP):
 * writes `--line` (0→1) on the container and marks `[data-step]` items `data-active` as the line
 * reaches them. One passive scroll listener, rAF-throttled, only while the section is near view.
 * Reduced motion: line fully drawn, all steps active.
 */
export function ProcessLine({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const steps = [...el.querySelectorAll<HTMLElement>('[data-step]')];

    const apply = (p: number) => {
      el.style.setProperty('--line', p.toFixed(4));
      steps.forEach((step, i) => {
        const at = steps.length === 1 ? 0 : i / (steps.length - 1);
        step.toggleAttribute('data-active', p >= at * 0.98);
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply(1);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the container's top reaches 85% of the viewport, 1 when its bottom reaches 55%.
      const start = vh * 0.85;
      const end = vh * 0.55;
      const p = (start - rect.top) / (start - end + rect.height);
      apply(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ '--line': 0 } as CSSProperties}>
      {children}
    </div>
  );
}
