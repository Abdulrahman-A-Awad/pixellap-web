'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { lockScroll } from '@/lib/motion/lenis';

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for an open dialog element: focus moves in (and returns on close),
 * Tab is trapped, Esc closes, page scroll is locked.
 */
export function useDialog(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll(true);

    // Wait one frame so the dialog is mounted/animated in.
    const frame = requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      const panel = ref.current;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      lockScroll(false);
      previous?.focus?.();
    };
  }, [open, ref]);
}
