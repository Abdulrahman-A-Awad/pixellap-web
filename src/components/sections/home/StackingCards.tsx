'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useIdleAfterLoad } from '@/lib/hooks/useExternal';

/** Same query as the sticky CSS (globals.css `.stack-card`). */
const STACK = '(min-width: 768px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)';

/**
 * Services cards, two modes from one list (globals.css `.stack-*`):
 * - STACK (≥ 768px wide and ≥ 600px tall — every laptop): sticky cards. GSAP ScrollTrigger (loaded
 *   after idle) scrubs, per pair: the previous card scales to 0.94, lifts 12px and its shade fades in
 *   (a soft darkening — transform/opacity only, 60fps); the incoming card's copy fades up as it
 *   arrives. Reduced motion: sticky stack without the scrubbed motion.
 * - CAROUSEL (phones / short screens): horizontal scroll-snap row + dots (active = the card whose
 *   start edge is closest to the row's start). Dots are buttons that scroll to their card.
 */
export function StackingCards({ children, label }: { children: ReactNode; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const idle = useIdleAfterLoad();
  const count = Children.count(children);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!idle || !el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(STACK, () => {
        const cards = [...el.querySelectorAll<HTMLElement>('[data-stack-card]')];
        const stickyTop = (card: HTMLElement) => parseFloat(getComputedStyle(card).top) || 0;
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          const inner = card.querySelector<HTMLElement>('[data-stack-inner]');
          const shade = card.querySelector<HTMLElement>('[data-stack-shade]');
          const copy = card.querySelector<HTMLElement>('[data-stack-copy]');
          if (!inner) return;

          // Incoming: the copy fades up while the card travels the last stretch to its sticky spot.
          if (i > 0 && copy) {
            gsap.fromTo(
              copy,
              { autoAlpha: 0.15, y: 28 },
              {
                autoAlpha: 1,
                y: 0,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: card,
                  start: () => `top ${window.innerHeight * 0.85}px`,
                  end: () => `top ${stickyTop(card) + 40}px`,
                  scrub: 0.4,
                  invalidateOnRefresh: true,
                },
              },
            );
          }

          // Outgoing: from the moment the next card overlaps this (stuck) one until it is stuck itself.
          if (!next) return;
          const trigger = {
            trigger: next,
            start: () => `top ${stickyTop(card) + card.offsetHeight}px`,
            end: () => `top ${stickyTop(next)}px`,
            scrub: 0.4,
            invalidateOnRefresh: true,
          };
          gsap.to(inner, { scale: 0.94, y: -12, ease: 'none', transformOrigin: '50% 0%', scrollTrigger: trigger });
          if (shade) gsap.to(shade, { opacity: 1, ease: 'none', scrollTrigger: { ...trigger } });
        });
      });
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [idle]);

  // Carousel dots: track the snapped card (cheap: rAF-throttled scroll on the row only).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const cards = [...el.querySelectorAll<HTMLElement>('[data-stack-card]')];
      const start = el.getBoundingClientRect();
      const rtl = getComputedStyle(el).direction === 'rtl';
      let best = 0;
      let bestD = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const d = rtl ? Math.abs(start.right - r.right) : Math.abs(r.left - start.left);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (i: number) => {
    const card = root.current?.querySelectorAll<HTMLElement>('[data-stack-card]')[i];
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  return (
    <div>
      <div ref={root} data-stack-list className="stack-list">
        {children}
      </div>
      <div className="stack-dots items-center justify-center gap-1.5" role="group" aria-label={label}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${i + 1} / ${count}`}
            aria-current={i === active ? 'true' : undefined}
            className="inline-flex size-6 items-center justify-center"
          >
            <span
              className={cn(
                'block h-1.5 rounded-pill transition-[width,background-color] duration-300 ease-out-expo',
                i === active ? 'w-5 bg-primary' : 'w-1.5 bg-border',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
