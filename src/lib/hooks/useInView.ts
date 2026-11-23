'use client';

import { useEffect, useState, type RefObject } from 'react';

type Callback = (entry: IntersectionObserverEntry) => void;

/**
 * One IntersectionObserver per (threshold, rootMargin), shared by every caller. Several callers may
 * watch the SAME element with the same options (e.g. a reveal and a parallax): each keeps its own
 * callback, and the element is unobserved only when the last one stops.
 */
const observers = new Map<string, { observer: IntersectionObserver; callbacks: Map<Element, Set<Callback>> }>();

export function observe(element: Element, callback: Callback, threshold = 0, rootMargin = '0px'): () => void {
  const key = `${threshold}|${rootMargin}`;
  let entry = observers.get(key);
  if (!entry) {
    const callbacks = new Map<Element, Set<Callback>>();
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => callbacks.get(e.target)?.forEach((cb) => cb(e))),
      { threshold, rootMargin },
    );
    entry = { observer, callbacks };
    observers.set(key, entry);
  }
  const { observer, callbacks } = entry;
  const set = callbacks.get(element) ?? new Set<Callback>();
  const isNew = set.size === 0;
  set.add(callback);
  callbacks.set(element, set);
  // Already observed: re-observe so the observer reports the current state again (the new caller gets
  // its initial entry; the existing ones receive a repeat of the state they already have).
  if (!isNew) observer.unobserve(element);
  observer.observe(element);
  return () => {
    const current = callbacks.get(element);
    if (!current?.delete(callback)) return;
    if (current.size === 0) {
      callbacks.delete(element);
      observer.unobserve(element);
    }
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
