'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Horizontal scroll-snap rail with prev/next buttons. Works in both directions: in RTL the
 * rail starts at the right, "next" scrolls left and the chevrons mirror. Cards are links, so
 * Tab moves through them (the browser scrolls each into view).
 */
export function CategoryRail({
  children,
  label,
  prevLabel,
  nextLabel,
}: {
  children: ReactNode;
  label: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      const pos = Math.abs(el.scrollLeft); // RTL scrollLeft is negative
      setEdges({ start: pos <= 2, end: pos >= max - 2 });
    };
    const resize = new ResizeObserver(measure); // also fires once on observe
    resize.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      resize.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, []);

  const scroll = (step: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: step * (rtl ? -1 : 1) * el.clientWidth * 0.85, behavior: reduced ? 'auto' : 'smooth' });
  };

  const button =
    'inline-flex size-11 items-center justify-center rounded-pill border border-border bg-surface transition-colors hover:border-primary disabled:opacity-40 disabled:hover:border-border';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-2">
        <button type="button" className={button} onClick={() => scroll(-1)} disabled={edges.start}>
          <ChevronLeft aria-hidden="true" className="size-5 rtl:-scale-x-100" />
          <span className="sr-only">{prevLabel}</span>
        </button>
        <button type="button" className={button} onClick={() => scroll(1)} disabled={edges.end}>
          <ChevronRight aria-hidden="true" className="size-5 rtl:-scale-x-100" />
          <span className="sr-only">{nextLabel}</span>
        </button>
      </div>
      <ul
        ref={rail}
        aria-label={label}
        className={cn(
          // scroll-px matches px: the first card already sits at its snap point, so the browser never
          // auto-scrolls on load (that scroll would end LCP observation before the first paint).
          '-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:thin] gap-4 overflow-x-auto scroll-smooth px-4 pb-4',
          'motion-reduce:scroll-auto md:mx-0 md:scroll-px-0 md:px-0',
        )}
      >
        {children}
      </ul>
    </div>
  );
}
