'use client';

import { useEffect } from 'react';
import { pulse } from '../overview/SectionLink';

/**
 * Highlights the anchor target when the page is opened (or the hash changes) with a #fragment —
 * e.g. a deep link from the services search (/services/{slug}#{anchor}). Renders nothing.
 */
export function HashPulse() {
  useEffect(() => {
    const run = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (target) pulse(target);
    };
    // After the browser / router has scrolled to it.
    const timer = window.setTimeout(run, 400);
    window.addEventListener('hashchange', run);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('hashchange', run);
    };
  }, []);
  return null;
}
