'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { cn } from '@/lib/cn';
import { getLenis } from '@/lib/motion/lenis';

export interface IndexItem {
  id: string;
  title: string;
}

const HEADER_OFFSET = 120;

/** Smooth-scroll to a card (Lenis when active), then move focus there for keyboard/SR users. */
function goTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target, { offset: -HEADER_OFFSET, immediate: reduced });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
  target.focus({ preventScroll: true });
}

/**
 * Sticky vertical index of the category's services (desktop). The active item follows the card
 * currently in the reading zone (IntersectionObserver); links are real anchors (#service-…), so it
 * also works without JS.
 */
export function ServiceIndex({ items, label }: { items: IndexItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) =>
          e.isIntersecting ? visible.set(e.target.id, e.boundingClientRect.top) : visible.delete(e.target.id),
        );
        // Topmost card inside the reading zone wins.
        const next = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
        if (next) setActive(next);
        else {
          // Scrolled back above the list → highlight the first service again.
          const first = items[0] && document.getElementById(items[0].id);
          if (first && first.getBoundingClientRect().top > window.innerHeight * 0.45) setActive(items[0].id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label}>
      <ol className="flex flex-col gap-1 border-s border-border">
        {items.map((item, i) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => goTo(e, item.id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  '-ms-px flex items-baseline gap-3 border-s-2 py-2 ps-4 text-sm transition-colors',
                  isActive ? 'border-primary font-bold text-text' : 'border-transparent text-muted hover:text-text',
                )}
              >
                <bdi dir="ltr" className={cn('tabular-nums', isActive ? 'text-link' : 'text-muted/70')}>
                  {String(i + 1).padStart(2, '0')}
                </bdi>
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Mobile: horizontal chip row that jumps to each card. */
export function ServiceChips({ items, label }: { items: IndexItem[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 pb-2 lg:hidden">
      <ol className="flex w-max gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => goTo(e, item.id)}
              className="inline-flex min-h-10 items-center rounded-pill border border-border bg-surface px-4 text-sm whitespace-nowrap transition-colors hover:border-primary"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
