'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { SectionLink } from './SectionLink';

/**
 * Sticky glass pill bar (just under the floating navbar) with the discipline names. Scroll-spy: the
 * section crossing the reading line (40% from the top) is active; a pill indicator slides to it
 * (transform + width, spring). On narrow screens the bar scrolls horizontally and keeps the active
 * item in view (its own scroller only — the page never jumps). In flow (`position: sticky`), so it
 * causes no layout shift; `[data-discipline-nav]` lets section links include its height in the offset.
 */
export function DisciplineNav({ items, label }: { items: { slug: string; title: string }[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  // Scroll-spy over the sections.
  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.slug)).filter((el): el is HTMLElement => !!el);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        // Document order: the first section on the reading line wins.
        const next = items.find((i) => visible.has(i.slug))?.slug;
        if (next) setActive(next);
        else if (sections[0] && sections[0].getBoundingClientRect().top > window.innerHeight * 0.4) setActive(null);
      },
      { rootMargin: '-40% 0px -59% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // Edge fades where the bar hides items (physical sides; RTL scrollLeft runs 0 → negative).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const rtl = getComputedStyle(scroller).direction === 'rtl';
      const x = rtl ? max + scroller.scrollLeft : scroller.scrollLeft; // 0 = leftmost
      scroller.toggleAttribute('data-fade-left', max > 1 && x > 1);
      scroller.toggleAttribute('data-fade-right', max > 1 && x < max - 1);
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Indicator + keep the active item visible inside the horizontal scroller.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const pill = pillRef.current;
    if (!scroller || !pill) return;
    const link = active ? scroller.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`) : null;
    if (!link) {
      pill.style.opacity = '0';
      return;
    }
    pill.style.opacity = '1';
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    // Centre the active item in the bar. offsetLeft and scrollLeft share one physical axis in both
    // directions (RTL scrollLeft runs from 0 to negative and RTL items overflow to negative offsets),
    // and the browser clamps out-of-range values.
    if (scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollTo({ left: link.offsetLeft - (scroller.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <nav aria-label={label} data-discipline-nav className="discipline-nav sticky z-30 py-2">
      <div className="container-page">
        <div className="discipline-bar glass-card mx-auto w-fit max-w-full">
          <div ref={scrollerRef} className="discipline-scroller relative flex items-center gap-0.5 overflow-x-auto p-1">
            <span ref={pillRef} aria-hidden="true" className="discipline-pill" />
            {items.map((item) => (
              <SectionLink
                key={item.slug}
                id={item.slug}
                current={active === item.slug}
                className={cn(
                  'relative z-10 inline-flex h-10 shrink-0 items-center rounded-pill px-3 text-[0.8125rem] font-bold whitespace-nowrap transition-colors',
                  active === item.slug ? 'text-on-primary' : 'text-muted hover:text-text',
                )}
              >
                {/* Long (Arabic) names are capped on phones so the active one always fits the bar. */}
                <span className="max-w-[min(17rem,62vw)] truncate" title={item.title}>
                  {item.title}
                </span>
              </SectionLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
