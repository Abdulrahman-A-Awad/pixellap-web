'use client';

import { useEffect } from 'react';
import { useIdleAfterLoad } from '@/lib/hooks/useExternal';
import { observe } from '@/lib/hooks/useInView';

const SELECTOR = '[data-reveal]:not([data-reveal-state])';

/** Runs `fn` when the main thread is idle (setTimeout fallback). Returns a cancel function. */
function whenIdle(fn: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn, { timeout: 1000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 200);
  return () => clearTimeout(id);
}

/**
 * Reveal-on-scroll for the whole app with ONE shared IntersectionObserver.
 *
 * Nothing is hidden by default (server HTML, no JS, before hydration). Elements are only marked
 * once the page has loaded and the main thread is idle: by then every boundary has hydrated, so
 * the server and client markup always match (marking earlier adds attributes to DOM that React
 * has not hydrated yet → hydration warning). At that point, elements already on (or above) the
 * screen get `data-reveal-state="shown"` and are never hidden — no flash, no layout shift, never
 * the LCP; only elements still BELOW the viewport get `"pending"` (hidden via CSS) and switch to
 * `"shown"` when they scroll in. Reduced motion: CSS does not hide anything.
 */
export function RevealObserver() {
  const ready = useIdleAfterLoad();

  useEffect(() => {
    if (!ready) return;
    const stops: (() => void)[] = [];
    const pending = new Set<HTMLElement>();

    const track = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.getBoundingClientRect().top < vh) {
          el.setAttribute('data-reveal-state', 'shown'); // already visible (or scrolled past): never hide it
          return;
        }
        el.setAttribute('data-reveal-state', 'pending');
        pending.add(el);
        const stop = observe(
          el,
          (entry) => {
            if (!entry.isIntersecting) return;
            el.setAttribute('data-reveal-state', 'shown');
            pending.delete(el);
            stop();
          },
          0.12,
          '0px 0px -6% 0px',
        );
        stops.push(stop);
      });
    };

    track();
    // Client-side navigations (and late streamed content) add new sections: pick them up once
    // React has rendered / hydrated them, i.e. on the next idle period.
    let cancelIdle: (() => void) | null = null;
    const mutations = new MutationObserver(() => {
      if (cancelIdle) return;
      cancelIdle = whenIdle(() => {
        cancelIdle = null;
        track();
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      cancelIdle?.();
      stops.forEach((stop) => stop());
      // Un-mark what is still hidden, so a re-mount (StrictMode, HMR) tracks it again
      // instead of leaving it hidden for good.
      pending.forEach((el) => el.removeAttribute('data-reveal-state'));
    };
  }, [ready]);

  return null;
}
