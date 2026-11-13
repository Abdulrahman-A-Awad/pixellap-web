'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * Current year, read on the client only: Cache Components forbids `new Date()` while
 * prerendering, so the server snapshot is empty and the year fills in on hydration.
 */
export function CurrentYear() {
  const year = useSyncExternalStore(
    noopSubscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <span>{year}</span>;
}
