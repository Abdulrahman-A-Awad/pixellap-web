'use client';

import { useEffect, useState, type RefObject } from 'react';

type Callback = (entry: IntersectionObserverEntry) => void;

/** One IntersectionObserver per (threshold, rootMargin), shared by every caller. */
const observers = new Map<string, { observer: IntersectionObserver; callbacks: Map<Element, Callback> }>();

export function observe(element: Element, callback: Callback, threshold = 0, rootMargin = '0px'): () => void {
  const key = `${threshold}|${rootMargin}`;
  let entry = observers.get(key);
  if (!entry) {
    const callbacks = new Map<Element, Callback>();
    const observer = new IntersectionObserver((entries) => entries.forEach((e) => callbacks.get(e.target)?.(e)), {
      threshold,
      rootMargin,
    });
    entry = { observer, callbacks };
    observers.set(key, entry);
  }
  entry.callbacks.set(element, callback);
  entry.observer.observe(element);
  const { observer, callbacks } = entry;
  return () => {
    callbacks.delete(element);
    observer.unobserve(element);
  };
}

/**
 * True once the element is at least `threshold` visible (stays true when `once`).
 * Uses the shared observer registry — cheap to use in many islands.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { threshold = 0, once = true, rootMargin = '0px' } = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stop = observe(
      el,
      (entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) stop();
        } else if (!once) {
          setInView(false);
        }
      },
      threshold,
      rootMargin,
    );
    return stop;
  }, [ref, threshold, once, rootMargin]);

  return inView;
}
