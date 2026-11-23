'use client';

import type { MouseEvent, ReactNode } from 'react';
import { getLenis } from '@/lib/motion/lenis';

/**
 * Space taken by the sticky bars above a section: the floating navbar (--header-h) + the discipline
 * nav (its measured height) + a small gap. Sections also carry the same offset as `scroll-margin-top`
 * (CSS) for hash loads and no-JS anchors.
 */
export function stickyOffset(target?: HTMLElement): number {
  const root = getComputedStyle(document.documentElement);
  // --header-h is declared in rem: convert to px (parseFloat alone would read "4.75rem" as 4.75).
  const raw = root.getPropertyValue('--header-h').trim();
  const header = raw.endsWith('rem') ? parseFloat(raw) * parseFloat(root.fontSize) : parseFloat(raw) || 76;
  const navEl = document.querySelector<HTMLElement>('[data-discipline-nav]');
  // A target that CONTAINS the nav (e.g. the #services wrapper) starts with it: only the navbar counts.
  if (!navEl || target?.contains(navEl)) return header + 8;
  return header + navEl.offsetHeight + 16;
}

/**
 * Brief highlight on a navigated-to card (`[data-pulse]` CSS ring, ~1.6s). Set after hydration on an
 * attribute React does not own, so it never conflicts with rendering.
 */
export function pulse(target: HTMLElement): void {
  target.removeAttribute('data-pulse');
  void target.offsetWidth; // restart the animation
  target.setAttribute('data-pulse', '');
  window.setTimeout(() => target.removeAttribute('data-pulse'), 1800);
}

/**
 * Document y of an element from the offsetTop chain — unlike getBoundingClientRect it ignores
 * transforms, so a card still in its hidden reveal state (translateY 24px) is not mis-measured.
 */
function documentTop(el: HTMLElement): number {
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) y += node.offsetTop;
  return y;
}

/** Smooth-scroll to a section (Lenis when active, native otherwise), update the hash, move focus. */
export function scrollToSection(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = documentTop(target) - stickyOffset(target);
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, { immediate: reduced });
  else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  history.replaceState(null, '', `#${id}`);
  target.focus({ preventScroll: true });
  // Service cards light up once the scroll has (mostly) arrived.
  if (target.classList.contains('svc-card')) window.setTimeout(() => pulse(target), reduced ? 0 : 500);
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
