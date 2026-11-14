'use client';

import { useEffect } from 'react';
import { observe } from '@/lib/hooks/useInView';

const SELECTOR = '[data-reveal]:not([data-reveal-state])';

/**
 * Reveal-on-scroll for the whole app with ONE shared IntersectionObserver.
 *
 * Nothing is hidden by default (server HTML, no JS, before hydration): content that is already
 * on screen is never hidden, so it can never delay the LCP. On mount, only elements that start
 * BELOW the viewport get `data-reveal-state="pending"` (hidden via CSS) and switch to
 * `"shown"` when they scroll in. Reduced motion: CSS does not hide anything.
 */
export function RevealObserver() {
  useEffect(() => {
    const stops: (() => void)[] = [];

    const track = (root: ParentNode) => {
      const vh = window.innerHeight;
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.getBoundingClientRect().top < vh) {
          el.setAttribute('data-reveal-state', 'shown'); // already visible: never hide it
          return;
        }
        el.setAttribute('data-reveal-state', 'pending');
        const stop = observe(
          el,
          (entry) => {
            if (!entry.isIntersecting) return;
            el.setAttribute('data-reveal-state', 'shown');
            stop();
          },
          0.12,
          '0px 0px -6% 0px',
        );
        stops.push(stop);
      });
    };

    track(document);
    // Client-side navigations add new sections: pick them up.
    const mutations = new MutationObserver(() => track(document));
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      stops.forEach((stop) => stop());
    };
  }, []);

  return null;
}
