'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { observe } from '@/lib/hooks/useInView';

/** Share of the steps that must be visible to start the reveal. */
const THRESHOLD = 0.3;

/**
 * One-shot sequential reveal for the process timeline (all geometry and timing in CSS:
 * globals.css `.process-*`). `data-process` lives in React state, so server and client markup match:
 * - undefined (server HTML, no JS, reduced motion, or already visible at first observation) = final state;
 * - "idle" = below the fold, waiting (line empty, steps dimmed);
 * - "play" once 30% is visible: the line draws through every marker in 1.2s and the steps light up
 *   one after another, then everything stays in the same final state. Never reverses.
 */
export function ProcessReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'play' | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let first = true;
    const stop = observe(
      el,
      (entry) => {
        if (first) {
          first = false;
          // Already (mostly) on screen or scrolled past: never dim what the visitor is looking at.
          if (entry.intersectionRatio >= THRESHOLD || entry.boundingClientRect.top < 0) {
            stop();
            return;
          }
          setState('idle');
          return;
        }
        if (entry.intersectionRatio >= THRESHOLD) {
          setState('play');
          stop();
        }
      },
      THRESHOLD,
    );
    return stop;
  }, []);

  return (
    <div ref={ref} data-process={state} className={className}>
      {children}
    </div>
  );
}
