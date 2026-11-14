'use client';

import { useSyncExternalStore } from 'react';

/** matchMedia as a hook (false during SSR). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** document.hidden as a hook. */
export function useDocumentHidden(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.hidden,
    () => false,
  );
}

export interface ThemeColors {
  theme: 'dark' | 'light';
  bg: string;
}

function subscribeHtmlClass(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function readThemeKey(): string {
  const root = document.documentElement;
  const theme = root.classList.contains('light') ? 'light' : 'dark';
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim() || (theme === 'light' ? '#ffffff' : '#06030f');
  return `${theme}|${bg}`;
}

/**
 * Active theme + resolved CSS variables, re-read whenever <html class> changes (next-themes).
 * Null during SSR.
 */
export function useThemeColors(): ThemeColors | null {
  const key = useSyncExternalStore(subscribeHtmlClass, readThemeKey, () => null);
  if (!key) return null;
  const [theme, bg] = key.split('|');
  return { theme: theme as ThemeColors['theme'], bg };
}

/**
 * True once the page has loaded and the main thread is idle (max `timeout` ms after load).
 * Used to start heavy work (the 3D scene) after the LCP has painted.
 */
export function useIdleAfterLoad(timeout = 1500): boolean {
  return useSyncExternalStore(
    subscribeIdle(timeout),
    () => idleReached,
    () => false,
  );
}

let idleReached = false;
// One stable subscribe function per timeout (a new function each render would resubscribe and
// keep postponing the idle callback).
const idleSubscribers = new Map<number, (onChange: () => void) => () => void>();
function subscribeIdle(timeout: number) {
  let subscribe = idleSubscribers.get(timeout);
  if (!subscribe) {
    subscribe = createIdleSubscriber(timeout);
    idleSubscribers.set(timeout, subscribe);
  }
  return subscribe;
}
function createIdleSubscriber(timeout: number) {
  return (onChange: () => void) => {
    if (idleReached) return () => {};
    let idleId = 0;
    let timer = 0;
    const done = () => {
      idleReached = true;
      onChange();
    };
    const schedule = () => {
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(done, { timeout });
      else timer = setTimeout(done, 200) as unknown as number;
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (idleId) window.cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
    };
  };
}

/** Tells whether the component is hydrated on the client (false on the server render). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
