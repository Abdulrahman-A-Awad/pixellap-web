'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useIdleAfterLoad } from '@/lib/hooks/useExternal';

/**
 * Scrolls the carousel ROW (never the page — scrollIntoView would also scroll vertically when a card
 * is taller than the window) so the card's start edge sits on the snap line. scrollLeft and client
 * rects share one physical axis in LTR and RTL.
 */
function scrollRowTo(row: HTMLElement, card: HTMLElement | undefined) {
  if (!card) return;
  const box = row.getBoundingClientRect();
  const r = card.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(row).scrollPaddingInlineStart) || 0;
  const rtl = getComputedStyle(row).direction === 'rtl';
  const delta = rtl ? r.right - (box.right - pad) : r.left - (box.left + pad);
  row.scrollTo({ left: row.scrollLeft + delta, behavior: 'smooth' });
}

/** Same query as the sticky CSS (globals.css `.stack-card`). */
const STACK = '(min-width: 768px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)';

/**
 * Services cards, two modes from one list (globals.css `.stack-*`):
 * - STACK (≥ 768px wide and ≥ 560px tall — every laptop, incl. 1366×768 with browser bars): sticky cards. GSAP ScrollTrigger (loaded
 *   after idle) scrubs, per pair: the previous card scales to 0.94, lifts 12px and its shade fades in
 *   (a soft darkening — transform/opacity only, 60fps); the incoming card's copy fades up as it
 *   arrives. Reduced motion: sticky stack without the scrubbed motion.
 * - CAROUSEL (phones / very short screens): horizontal scroll-snap row + dots (active = the card
 *   whose start edge is closest to the row's start). Dots scroll to their card; with a mouse also
 *   previous/next arrows, drag-to-scroll (settles on a card) and ←/→ keys — never dots only.
 */
export function StackingCards({
  children,
  label,
  labels,
}: {
  children: ReactNode;
  label: string;
  /** Carousel arrow buttons. */
  labels: { previous: string; next: string };
}) {
  const root = useRef<HTMLDivElement>(null);
  const idle = useIdleAfterLoad();
  const count = Children.count(children);
  const [active, setActive] = useState(0);
  // Read by the drag handler (a listener set up once).
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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

  // Carousel: track the snapped card (cheap: rAF-throttled scroll on the row only).
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
      // At the very end of the row the last card can't reach the start edge: it is the active one.
      const max = el.scrollWidth - el.clientWidth;
      if (max > 0 && Math.abs(el.scrollLeft) >= max - 2) best = cards.length - 1;
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

  // Mouse drag (carousel mode only): grab the row and throw it; it settles on the nearest card in
  // the drag direction (snap is suspended while dragging, then the card is scrolled to). Touch and
  // trackpads keep their native scrolling; a click without movement still follows the card link.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let drag: { x: number; left: number; moved: boolean; id: number } | null = null;
    let suppressClick = false;
    const isCarousel = () => getComputedStyle(el).overflowX === 'auto';
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !isCarousel()) return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false, id: e.pointerId };
      el.removeAttribute('data-dragging');
      suppressClick = false;
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        el.setPointerCapture(drag.id);
        el.setAttribute('data-dragging', '');
      }
      el.scrollLeft = drag.left - dx;
    };
    const up = (e: PointerEvent) => {
      if (!drag) return;
      const { moved, x } = drag;
      drag = null;
      if (!moved) return;
      // The click that ends a drag must not open the card under the cursor.
      suppressClick = true;
      const rtl = getComputedStyle(el).direction === 'rtl';
      const forward = rtl ? e.clientX > x : e.clientX < x; // dragged towards the next card
      // The card nearest the snap line (activeRef follows the row while dragging): if the drag carried
      // it past that line, continue one card in the drag direction; otherwise settle back on it.
      const cards = el.querySelectorAll<HTMLElement>('[data-stack-card]');
      const current = activeRef.current;
      const box = el.getBoundingClientRect();
      const r = cards[current]?.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(el).scrollPaddingInlineStart) || 0;
      // > 0: the card has moved past the snap line in the forward direction.
      const past = r ? (rtl ? r.right - (box.right - pad) : box.left + pad - r.left) : 0;
      let target = current;
      if (forward && past > 2) target = current + 1;
      if (!forward && past < -2) target = current - 1;
      scrollRowTo(el, cards[Math.max(0, Math.min(count - 1, target))]);
      // Snap stays off ([data-dragging]) until that scroll has settled: re-enabling mandatory snap
      // mid-flight would snap straight back to the card the drag started from.
      const settle = () => {
        window.clearTimeout(fallback);
        el.removeEventListener('scrollend', settle);
        if (!drag) el.removeAttribute('data-dragging');
      };
      const fallback = window.setTimeout(settle, 900);
      el.addEventListener('scrollend', settle);
    };
    const click = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    // No native image/link ghost drag in the carousel (it would steal the pointer).
    const noGhost = (e: DragEvent) => {
      if (isCarousel()) e.preventDefault();
    };
    el.addEventListener('dragstart', noGhost);
    return () => {
      el.removeEventListener('dragstart', noGhost);
      el.removeEventListener('click', click, true);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [count]);

  const goTo = (i: number) => {
    const row = root.current;
    if (row) scrollRowTo(row, row.querySelectorAll<HTMLElement>('[data-stack-card]')[i]);
  };

  const arrow = 'stack-arrow btn-press size-11 items-center justify-center rounded-pill';

  return (
    <div>
      <div
        ref={root}
        data-stack-list
        className="stack-list"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={(e) => {
          // Arrow keys move one card (visual direction, so RTL ← goes forward).
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          if (getComputedStyle(e.currentTarget).overflowX !== 'auto') return;
          const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
          const forward = (e.key === 'ArrowRight') !== rtl;
          e.preventDefault();
          goTo(Math.max(0, Math.min(count - 1, active + (forward ? 1 : -1))));
        }}
      >
        {children}
      </div>
      <div className="stack-dots items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label={labels.previous}
          className={arrow}
        >
          <ChevronLeft aria-hidden="true" className="size-5 rtl:-scale-x-100" />
        </button>
        <div className="flex items-center gap-1.5" role="group" aria-label={label}>
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
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === count - 1}
          aria-label={labels.next}
          className={arrow}
        >
          <ChevronRight aria-hidden="true" className="size-5 rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}
