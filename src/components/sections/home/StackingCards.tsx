'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useIdleAfterLoad } from '@/lib/hooks/useExternal';

/**
 * Desktop stacking effect: as the next card arrives, the previous one scales to ~0.94 and dims.
 * GSAP ScrollTrigger (scrub) is loaded after idle; mobile / reduced motion get a plain list.
 */
export function StackingCards({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const idle = useIdleAfterLoad();

  useEffect(() => {
    const el = root.current;
    if (!idle || !el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = [...el.querySelectorAll<HTMLElement>('[data-stack-card]')];
        cards.slice(0, -1).forEach((card, i) => {
          const next = cards[i + 1];
          const inner = card.querySelector<HTMLElement>('[data-stack-inner]');
          if (!inner) return;
          const stickyTop = (el: HTMLElement) => parseFloat(getComputedStyle(el).top) || 0;
          // From the moment the next card starts to overlap this (stuck) card until it is stuck itself.
          gsap.to(inner, {
            scale: 0.94,
            filter: 'brightness(0.62)',
            ease: 'none',
            transformOrigin: '50% 0%',
            scrollTrigger: {
              trigger: next,
              start: () => `top ${stickyTop(card) + card.offsetHeight}px`,
              end: () => `top ${stickyTop(next)}px`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
      });
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [idle]);

  return (
    <div ref={root} className="flex flex-col gap-6 lg:gap-10">
      {children}
    </div>
  );
}
