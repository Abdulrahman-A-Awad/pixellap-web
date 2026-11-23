'use client';

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { observe } from '@/lib/hooks/useInView';

/** Viewport line (share of its height) that the progress follows. */
const LINE = 0.85;

/** Number of steps the line has reached. Infinity = server HTML / no JS / reduced motion → all active. */
const Reached = createContext(Number.POSITIVE_INFINITY);

/**
 * Scroll-linked process timeline (geometry in CSS: globals.css `.process-*`).
 * - Row (markers share a line): progress 0 when the cards row's top reaches 85% of the viewport,
 *   1 when its bottom does — so the last step always completes while the row is visible.
 * - Vertical timeline: the line tip follows the 85% line exactly, segment by segment, from the
 *   marker positions (cards of any height).
 * Per frame (only while visible, rAF-throttled) it writes `--f0…--fN` (segment fills, 0..1) on its
 * own element; the number of reached steps is React state (changes only when a step is reached), read
 * by ProcessStep through context. Reduced motion: everything drawn and active.
 *
 * `trigger="enter"` (contact "What happens next"): not scroll-linked — when 30% of the steps are
 * visible, the line draws through every marker in 1.2s and the steps light up in sequence, once.
 * Already on screen at load → final state.
 */
export function ProcessProgress({
  children,
  className,
  trigger = 'scroll',
}: {
  children: ReactNode;
  className?: string;
  trigger?: 'scroll' | 'enter';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(Number.POSITIVE_INFINITY);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const row = el.querySelector<HTMLElement>('ol');
    const markers = [...el.querySelectorAll<HTMLElement>('.process-dot')];
    if (!row || markers.length === 0) return;

    if (trigger === 'enter') {
      const n = markers.length;
      const write = (pos: number) => {
        for (let i = 0; i < n - 1; i++) el.style.setProperty(`--f${i}`, Math.max(0, Math.min(1, pos - i)).toFixed(3));
        setReached(pos < 0 ? 0 : Math.min(n, Math.floor(pos + 1e-3) + 1));
      };
      let frame = 0;
      let first = true;
      const stop = observe(
        el,
        (entry) => {
          if (first) {
            first = false;
            // Already (mostly) visible or scrolled past: keep the final state.
            if (entry.intersectionRatio >= 0.3 || entry.boundingClientRect.top < 0) return stop();
            write(-1); // empty until it scrolls in
            return;
          }
          if (entry.intersectionRatio < 0.3) return;
          stop();
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / 1200);
            write(p * (n - 1));
            if (p < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        },
        0.3,
      );
      return () => {
        stop();
        cancelAnimationFrame(frame);
      };
    }

    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const line = window.innerHeight * LINE;
      const centres = markers.map((m) => {
        const r = m.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      const n = centres.length;
      const horizontal = n > 1 && Math.abs(centres[1].y - centres[0].y) < 2;
      const fills: number[] = [];
      let count = 0;
      if (horizontal) {
        const box = row.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (line - box.top) / (box.height || 1)));
        const pos = p * (n - 1);
        for (let i = 0; i < n - 1; i++) fills.push(Math.max(0, Math.min(1, pos - i)));
        count = Math.floor(pos + 1e-3) + 1;
        if (p === 0) count = 0;
      } else {
        for (let i = 0; i < n - 1; i++) {
          const span = centres[i + 1].y - centres[i].y || 1;
          fills.push(Math.max(0, Math.min(1, (line - centres[i].y) / span)));
        }
        count = centres.filter((c) => c.y <= line).length;
      }
      fills.forEach((f, i) => el.style.setProperty(`--f${i}`, f.toFixed(3)));
      setReached(count);
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };

    update();
    const stop = observe(el, (entry) => {
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
  }, [trigger]);

  return (
    <Reached.Provider value={reached}>
      <div ref={ref} data-process className={cn(className)}>
        {children}
      </div>
    </Reached.Provider>
  );
}

/** One step (<li>): marker + connector segment (its fill reads the wrapper's --f{index}) + the card. */
export function ProcessStep({ index, children }: { index: number; children: ReactNode }) {
  const reached = useContext(Reached);
  return (
    <li
      className="process-step"
      data-active={index < reached ? '' : undefined}
      style={{ '--i': index, '--seg-fill': `var(--f${index}, 1)` } as CSSProperties}
    >
      <span aria-hidden="true" className="process-dot" />
      <span aria-hidden="true" className="process-seg" />
      {children}
    </li>
  );
}
