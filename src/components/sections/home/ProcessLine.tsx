'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Process connector, measured from the markers themselves (`[data-marker]` inside each `[data-step]`):
 * the track + line run exactly from the first marker's centre to the last one's — horizontal when the
 * markers share a row (desktop), vertical when they stack (phones). Works in RTL (the line grows from
 * the first step's side) and for any card heights.
 *
 * Progress (desktop, one row) is scrubbed over a SHORT range of the enclosing <section>: 0 when its top
 * reaches 75% of the viewport, 1 when its centre reaches 50% — the last step lights up while the
 * section is still in view. Vertical timeline (phones): the line tip follows 60% of the viewport. A step gets `data-active` as the line reaches its marker. One passive scroll listener,
 * rAF-throttled; geometry re-measured on resize (ResizeObserver). Reduced motion: drawn, all active.
 */
export function ProcessLine({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const track = el.querySelector<HTMLElement>('[data-track]');
    const line = el.querySelector<HTMLElement>('[data-line]');
    const steps = [...el.querySelectorAll<HTMLElement>('[data-step]')];
    const markers = steps.map((step) => step.querySelector<HTMLElement>('[data-marker]'));
    const section = el.closest('section') ?? el;
    if (!track || !line || markers.some((m) => !m)) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /** Fraction of the line at which each marker sits (0 = first, 1 = last). */
    let stops: number[] = steps.map((_, i) => (steps.length === 1 ? 0 : i / (steps.length - 1)));
    let progress = -1;
    let vertical = false;
    /** First / last marker centre relative to the container (block axis), for the vertical mode. */
    let span = { from: 0, to: 1 };

    const layout = () => {
      const box = el.getBoundingClientRect();
      const centres = markers.map((m) => {
        const r = m!.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      const first = centres[0];
      const last = centres[centres.length - 1];
      const horizontal = Math.abs(last.x - first.x) > Math.abs(last.y - first.y);
      const geometry = horizontal
        ? {
            left: `${Math.min(first.x, last.x)}px`,
            top: `${first.y - 1}px`,
            width: `${Math.abs(last.x - first.x)}px`,
            height: '2px',
          }
        : { left: `${first.x - 1}px`, top: `${first.y}px`, width: '2px', height: `${Math.abs(last.y - first.y)}px` };
      for (const node of [track, line]) Object.assign(node.style, geometry);

      vertical = !horizontal;
      span = { from: first.y, to: last.y };
      const axis = horizontal ? 'x' : 'y';
      const length = Math.abs(last[axis] - first[axis]) || 1;
      stops = centres.map((c) => Math.abs(c[axis] - first[axis]) / length);
      line.style.transformOrigin = horizontal ? (last.x >= first.x ? 'left center' : 'right center') : 'center top';
      line.dataset.axis = horizontal ? 'x' : 'y';
      el.dataset.measured = '';
      progress = -1; // re-apply with the new stops
      update();
    };

    const apply = (p: number) => {
      if (p === progress) return;
      progress = p;
      line.style.transform = line.dataset.axis === 'x' ? `scaleX(${p})` : `scaleY(${p})`;
      steps.forEach((step, i) => step.toggleAttribute('data-active', p >= stops[i] - 0.005));
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      if (reduced) return apply(1);
      const vh = window.innerHeight;
      if (vertical) {
        // Phones (tall timeline): the line tip follows 60% of the viewport, so each step lights
        // up as it scrolls in — the section centre would be reached long before step 4 is visible.
        const top = el.getBoundingClientRect().top;
        const p = (vh * 0.6 - (top + span.from)) / (span.to - span.from || 1);
        return apply(Math.round(Math.min(1, Math.max(0, p)) * 1000) / 1000);
      }
      const rect = section.getBoundingClientRect();
      // top at 75% of the viewport → 0; centre at 50% → 1.
      const range = vh * 0.25 + rect.height / 2;
      const p = (vh * 0.75 - rect.top) / range;
      apply(Math.round(Math.min(1, Math.max(0, p)) * 1000) / 1000);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    layout();
    const observer = new ResizeObserver(() => layout());
    observer.observe(el);
    // Content above can change height after the last scroll event (hero pin set up after idle, images):
    // the section moves without a scroll, so re-check whenever the page size changes too.
    observer.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      <div aria-hidden="true" data-track className="process-track" />
      <div aria-hidden="true" data-line className="process-line" />
      {children}
    </div>
  );
}
