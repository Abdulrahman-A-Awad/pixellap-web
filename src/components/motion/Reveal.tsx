'use client';

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { observe } from '@/lib/hooks/useInView';
import { revealViewport, type RevealVariant } from '@/lib/motion';

type Phase = 'hidden' | 'shown';

/**
 * Section reveal, SSR-safe and once-only, with ZERO animation-library cost (it runs on ~30 elements
 * of the home page, so it must stay tiny: Lighthouse mobile budget):
 * - the server HTML is the FINAL state (readable without JS, no opacity-0 flash, LCP-safe);
 * - after hydration, an element below 85% of the viewport gets `data-reveal-state="hidden"`
 *   (applied without transition — it is off screen) and `"shown"` when its top passes the 85% line
 *   (one shared IntersectionObserver), which runs a CSS transition with the motion tokens
 *   (lib/motion.ts ↔ globals.css `[data-reveal-state]`: slow 0.8s, ease-out, 24px / 0.96 / blur);
 * - anything already on screen / above, and reduced motion, stays in the final state.
 * `index` staggers siblings (`--reveal-index` × 80ms).
 */
export function Reveal({
  children,
  variant = 'fade-up',
  index = 0,
  as: Tag = 'div',
  className,
  style,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  index?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setPhase('hidden');
    const stop = observe(
      el,
      (entry) => {
        if (!entry.isIntersecting) return;
        setPhase('shown');
        stop();
      },
      revealViewport.threshold,
      revealViewport.rootMargin,
    );
    return stop;
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal-variant={variant}
      data-reveal-state={phase}
      style={index ? ({ ...style, '--reveal-index': index } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
}
