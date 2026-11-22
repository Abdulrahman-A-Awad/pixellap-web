'use client';

import { useEffect, useRef, useState } from 'react';

/** Rows of tags allowed: 1 on short viewports (< 760px tall), 2 otherwise. */
const SHORT = '(max-height: 759px)';

/**
 * Service tags limited to a number of ROWS (not a fixed count), with a "+N" pill for the rest — so a
 * card never grows past its budget whatever the tag lengths, language or column width.
 *
 * The server renders the first `initial` tags (+N). After hydration the tag widths are measured once
 * in an invisible probe list (all tags + the widest "+N"), and a greedy flex-wrap simulation picks
 * how many fit in the allowed rows with the pill; recomputed on resize. Only React state changes.
 */
export function ServiceTags({ tags, initial = 4 }: { tags: string[]; initial?: number }) {
  const listRef = useRef<HTMLUListElement>(null);
  const probeRef = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState(Math.min(initial, tags.length));

  useEffect(() => {
    const list = listRef.current;
    const probe = probeRef.current;
    if (!list || !probe) return;
    const mq = window.matchMedia(SHORT);

    const fit = () => {
      const rows = mq.matches ? 1 : 2;
      const width = list.clientWidth;
      if (!width) return;
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      const sizes = [...probe.children].map((el) => Math.min(el.getBoundingClientRect().width, width));
      const pill = sizes[tags.length];
      const fits = (k: number) => {
        let row = 1;
        let x = -gap;
        for (const w of k < tags.length ? [...sizes.slice(0, k), pill] : sizes.slice(0, k)) {
          if (x + gap + w > width + 0.5) {
            row += 1;
            x = w;
          } else x += gap + w;
        }
        return row <= rows;
      };
      let k = tags.length;
      while (k > 0 && !fits(k)) k -= 1;
      setVisible(k);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(list);
    mq.addEventListener('change', fit);
    void document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      mq.removeEventListener('change', fit);
    };
  }, [tags.length]);

  if (tags.length === 0) return null;
  const more = tags.length - visible;
  const tag = 'max-w-full truncate rounded-pill border border-border px-3 py-1 text-meta text-muted';
  const pill = 'rounded-pill bg-surface-2 px-3 py-1 text-meta font-bold text-link';

  return (
    <div className="relative">
      <ul ref={listRef} className="flex flex-wrap gap-2">
        {tags.slice(0, visible).map((t) => (
          <li key={t} className={tag}>
            {t}
          </li>
        ))}
        {more > 0 && (
          <li className={pill}>
            <bdi dir="ltr">+{more}</bdi>
          </li>
        )}
      </ul>
      {/* Measuring probe: same styles, never visible, takes no space. */}
      <div aria-hidden="true" className="pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-clip">
        <ul ref={probeRef} className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t} className={tag}>
              {t}
            </li>
          ))}
          <li className={pill}>
            <bdi dir="ltr">+{tags.length}</bdi>
          </li>
        </ul>
      </div>
    </div>
  );
}
