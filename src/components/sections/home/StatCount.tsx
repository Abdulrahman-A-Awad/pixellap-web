'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { observe } from '@/lib/hooks/useInView';

/**
 * A stat number with a pure-CSS count-up (globals.css `.stat-count`). The final value is always in
 * the DOM. `data-count` lives in React state and only changes after hydration (inside observer
 * callbacks), so the server and client markup always match:
 * - first observation: already on screen (or above it) → stays as is, the final value;
 * - below the fold → "pending" (counter at 0) → "run" when it scrolls in.
 */
export function StatCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<'pending' | 'run' | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let first = true;
    const stop = observe(
      el,
      (entry) => {
        if (first) {
          first = false;
          // Any part already visible (or scrolled past): never reset a number the visitor can see.
          if (entry.boundingClientRect.top < window.innerHeight) {
            stop();
            return;
          }
          setState('pending');
          return;
        }
        if (entry.isIntersecting) {
          setState('run');
          stop();
        }
      },
      0.5,
    );
    return stop;
  }, []);

  return (
    <span
      ref={ref}
      data-count={state}
      // Thin brand face for the big figure; fixed width so the count-up does not jitter.
      className="stat-count digits-fixed font-display-thin"
      style={{ '--to': value, '--len': String(value).length } as CSSProperties}
    >
      <span className="stat-final">{value.toLocaleString('en-US')}</span>
    </span>
  );
}
