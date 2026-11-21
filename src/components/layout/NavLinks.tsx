'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { NAV_ITEMS, isActive } from './nav';

interface Indicator {
  x: number;
  width: number;
  /** First placement after mount: no slide from 0. */
  instant: boolean;
}

/**
 * Desktop navigation: a soft pill slides to the active item (and follows the route as it changes);
 * hover draws an underline that grows from the reading-start side (`.nav-link`, globals.css).
 * The pill is measured from the links' boxes, so it works for any label length and in RTL.
 */
export function NavLinks() {
  const { t } = useSite();
  const pathname = usePathname();
  const list = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  const activeIndex = NAV_ITEMS.findIndex((item) => isActive(pathname, item.href));

  const measure = useCallback(
    (instant: boolean) => {
      const ul = list.current;
      const link = activeIndex >= 0 ? ul?.querySelectorAll<HTMLElement>('[data-nav-link]')[activeIndex] : null;
      if (!ul || !link) {
        setIndicator(null);
        return;
      }
      const box = ul.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      setIndicator({ x: rect.left - box.left, width: rect.width, instant });
    },
    [activeIndex],
  );

  // Measure before paint; slide (not jump) when the active item changes after the first placement.
  const placed = useRef(false);
  useLayoutEffect(() => {
    measure(!placed.current);
    placed.current = true;
  }, [measure]);

  // Fonts / resize change the label widths: re-measure without animating.
  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const observer = new ResizeObserver(() => measure(true));
    observer.observe(ul);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <ul ref={list} className="relative flex items-center gap-1">
      {indicator && (
        <span
          aria-hidden="true"
          className={cn(
            'nav-indicator absolute top-1/2 h-10 rounded-pill',
            !indicator.instant && 'transition-[translate,width] duration-[240ms] ease-out-expo',
          )}
          // x is measured from physical boxes (getBoundingClientRect), so the anchor is the physical
          // left edge on purpose — this is what keeps it correct in RTL too.
          style={{ left: 0, translate: `${indicator.x}px -50%`, width: indicator.width }}
        />
      )}
      {NAV_ITEMS.map((item, i) => {
        const active = i === activeIndex;
        return (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              data-nav-link
              aria-current={active ? 'page' : undefined}
              className={cn(
                'nav-link relative inline-flex min-h-11 items-center rounded-pill px-4 text-[0.95rem] transition-colors duration-200',
                active ? 'text-text' : 'text-muted hover:text-text',
              )}
            >
              {t(item.label)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
