'use client';

import type { MouseEvent, ReactNode } from 'react';
import { getLenis } from '@/lib/motion/lenis';

/**
 * Space taken by the sticky bars above a section: the floating navbar (--header-h) + the discipline
 * nav (its measured height) + a small gap. Sections also carry the same offset as `scroll-margin-top`
 * (CSS) for hash loads and no-JS anchors.
 */
export function stickyOffset(): number {
  const root = getComputedStyle(document.documentElement);
  const header = parseFloat(root.getPropertyValue('--header-h')) || 76;
  const nav = document.querySelector<HTMLElement>('[data-discipline-nav]')?.offsetHeight ?? 0;
  return header + nav + 16;
}

/** Smooth-scroll to a section (Lenis when active, native otherwise), update the hash, move focus. */
export function scrollToSection(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = target.getBoundingClientRect().top + window.scrollY - stickyOffset();
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, { immediate: reduced });
  else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  history.replaceState(null, '', `#${id}`);
  target.focus({ preventScroll: true });
  return true;
}

/** In-page link to a section: a real anchor (works without JS), smooth-scrolled with the bar offset. */
export function SectionLink({
  id,
  className,
  children,
  current,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  current?: boolean;
}) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (scrollToSection(id)) event.preventDefault();
  };
  return (
    <a href={`#${id}`} onClick={onClick} className={className} aria-current={current ? 'location' : undefined}>
      {children}
    </a>
  );
}
