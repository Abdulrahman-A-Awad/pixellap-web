'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MAIN_ID } from '@/components/layout/SkipLink';
import { usePrefersReducedMotion } from '@/lib/motion/useReducedMotion';
import { seededRandom } from '@/lib/random';

const COLS = 12;
const ROWS = 8;
/** Per-square transition + max stagger = phase length (cover 280ms + reveal 280ms, ≈ 600ms total). */
const PHASE_MS = 280;
const SAFETY_MS = 2500;

type Phase = 'idle' | 'cover' | 'reveal';

const random = seededRandom(808);
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    // Diagonal sweep with a little jitter (normalised 0–1).
    delay: ((col + row) / (COLS + ROWS - 2)) * 0.75 + random() * 0.25,
    color: random() < 0.55 ? 'var(--brand-iris)' : 'var(--brand-royal)',
  };
});

/**
 * Pixel-grid page transition for internal navigation:
 * cover (squares scale in, staggered) → router.push → reveal (squares scale out) → focus <main>.
 * Pure CSS transitions; no animation for reduced motion, modified clicks, other locales (full
 * reload of the root layout), hash links or back/forward (those just move focus).
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [seenPath, setSeenPath] = useState(pathname);
  const firstRender = useRef(true);

  // Route changed while covered → reveal (derived during render, no effect setState).
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    if (phase === 'cover') setPhase('reveal');
  }

  // Intercept internal link clicks (capture: runs before next/link's own handler).
  useEffect(() => {
    if (reduced) return;
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
      if (url.pathname === window.location.pathname) return; // same page / hash links
      const locale = (p: string) => p.split('/')[1];
      if (locale(url.pathname) !== locale(window.location.pathname)) return; // root layout swap
      event.preventDefault();
      setPhase('cover');
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), PHASE_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [reduced, router]);

  // Reveal → idle; safety reset if a navigation never lands.
  useEffect(() => {
    if (phase === 'idle') return;
    const timer = window.setTimeout(() => setPhase('idle'), phase === 'reveal' ? PHASE_MS + 40 : SAFETY_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // After every navigation (incl. back/forward): move focus to <main> for keyboard/SR users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.getElementById(MAIN_ID)?.focus({ preventScroll: true });
  }, [pathname]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      className="page-transition pointer-events-none fixed inset-0 z-[80] grid data-[phase=cover]:pointer-events-auto"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
    >
      {CELLS.map((cell, i) => (
        <span key={i} style={{ '--d': cell.delay, background: cell.color } as CSSProperties} />
      ))}
    </div>
  );
}
