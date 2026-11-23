'use client';

import { CornerDownLeft, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { useRouter } from '@/i18n/navigation';
import type { MediaAsset, ServiceRow } from '@/lib/api/types';
import { interpolate } from '@/lib/site/format';
import { matchRange, normalizeSearch, searchTokens } from '@/lib/site/search';

export interface SearchGroup {
  slug: string;
  title: string;
  icon: MediaAsset | null;
  index: number;
  services: ServiceRow[];
}

interface Hit {
  group: SearchGroup;
  service: ServiceRow;
  /** 0 = title starts with the query, 1 = title contains it, 2 = found in the description/category. */
  rank: number;
}

/** The title with the first query token highlighted (normalised matching: diacritics, أ/إ/آ, ى, ة). */
function Highlighted({ text, token }: { text: string; token: string }): ReactNode {
  const range = matchRange(text, token);
  if (!range) return text;
  return (
    <>
      {text.slice(0, range[0])}
      <mark className="search-mark">{text.slice(range[0], range[1])}</mark>
      {text.slice(range[1])}
    </>
  );
}

/**
 * Instant search over every service (client-side, ~43 rows): a combobox input (APG pattern: focus
 * stays in the input, aria-activedescendant points at the active result) with a glass results panel
 * grouped by discipline (icon + name, then matching services with the match highlighted). Every query
 * word must appear in the service title, its short description or the discipline name; title matches
 * rank first. ↑/↓ move (wrapping), Enter opens /services/{slug}#{anchor}, Esc clears/closes. Arabic is
 * matched without diacritics and with أ/إ/آ→ا, ى→ي, ة→ه. Results count is announced politely.
 */
export function ServiceSearch({
  groups,
  label,
  placeholder,
  hint,
  emptyText,
  resultsText,
  clearLabel,
}: {
  groups: SearchGroup[];
  label: string;
  placeholder: string;
  hint: string;
  /** With {query}. */
  emptyText: string;
  /** With {count}. */
  resultsText: string;
  clearLabel: string;
}) {
  const router = useRouter();
  const uid = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalised haystacks, built once.
  const index = useMemo(
    () =>
      groups.flatMap((group) =>
        group.services.map((service) => ({
          group,
          service,
          title: normalizeSearch(service.title).value,
          rest: normalizeSearch(`${service.short} ${group.title}`).value,
        })),
      ),
    [groups],
  );

  const tokens = useMemo(() => searchTokens(query), [query]);
  const hits: Hit[] = useMemo(() => {
    if (tokens.length === 0) return [];
    const found: Hit[] = [];
    for (const row of index) {
      if (!tokens.every((t) => row.title.includes(t) || row.rest.includes(t))) continue;
      const rank = row.title.startsWith(tokens[0]) ? 0 : tokens.every((t) => row.title.includes(t)) ? 1 : 2;
      found.push({ group: row.group, service: row.service, rank });
    }
    // Disciplines keep their order; inside one, better matches first (stable for equal ranks).
    return found.sort((a, b) => a.group.index - b.group.index || a.rank - b.rank);
  }, [index, tokens]);

  const showPanel = open && tokens.length > 0;
  const optionId = (i: number) => `${uid}-opt-${i}`;
  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    setOpen(false);
    router.push(`/services/${hit.group.slug}#${hit.service.anchor}`);
  };

  // Keep the active result in view.
  useEffect(() => {
    if (!showPanel) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, showPanel]);

  // Outside pointer → close.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (hits.length === 0) return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + step + hits.length) % hits.length);
    } else if (event.key === 'Enter') {
      if (!showPanel || hits.length === 0) return;
      event.preventDefault();
      go(hits[active] ?? hits[0]);
    } else if (event.key === 'Escape') {
      if (showPanel) setOpen(false);
      else setQuery('');
    }
  };

  // Results grouped for rendering; the flat index drives keyboard navigation.
  const grouped: { group: SearchGroup; items: { hit: Hit; flat: number }[] }[] = [];
  hits.forEach((hit, flat) => {
    const last = grouped[grouped.length - 1];
    if (last && last.group.slug === hit.group.slug) last.items.push({ hit, flat });
    else grouped.push({ group: hit.group, items: [{ hit, flat }] });
  });

  return (
    <div ref={rootRef} className="relative w-full max-w-2xl">
      <label htmlFor={`${uid}-input`} className="sr-only">
        {label}
      </label>
      <div className="search-field glass-card flex items-center gap-3 ps-5 pe-2">
        <Search aria-hidden="true" className="size-5 shrink-0 text-link" />
        <input
          id={`${uid}-input`}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={`${uid}-list`}
          aria-activedescendant={showPanel && hits.length > 0 ? optionId(active) : undefined}
          aria-describedby={`${uid}-hint`}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-14 min-w-0 flex-1 bg-transparent text-lead text-text outline-none placeholder:text-muted md:h-16"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
            aria-label={clearLabel}
          >
            <X aria-hidden="true" className="size-4.5" />
          </button>
        )}
      </div>
      <p id={`${uid}-hint`} className="sr-only">
        {hint}
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {tokens.length > 0 ? interpolate(resultsText, { count: hits.length }) : ''}
      </p>

      {showPanel && (
        <div className="search-pop" ref={listRef}>
          {hits.length === 0 ? (
            <p className="px-4 py-6 text-center text-muted">{interpolate(emptyText, { query: query.trim() })}</p>
          ) : (
            <div id={`${uid}-list`} role="listbox" aria-label={label} className="flex flex-col gap-2">
              {grouped.map(({ group, items }) => (
                <div key={group.slug} role="group" aria-labelledby={`${uid}-g-${group.slug}`}>
                  <p
                    id={`${uid}-g-${group.slug}`}
                    className="flex items-center gap-2.5 px-3 pt-2 pb-1.5 text-meta font-bold text-muted"
                  >
                    <CategoryIcon icon={group.icon} index={group.index} size="sm" className="size-6 rounded-md p-1" />
                    {group.title}
                  </p>
                  {items.map(({ hit, flat }) => (
                    <div
                      key={hit.service.id}
                      id={optionId(flat)}
                      role="option"
                      aria-selected={flat === active}
                      data-index={flat}
                      data-active={flat === active ? '' : undefined}
                      className="search-option"
                      onPointerDown={(e) => e.preventDefault()}
                      onPointerMove={() => setActive(flat)}
                      onClick={() => go(hit)}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-text">
                          <Highlighted text={hit.service.title} token={tokens[0]} />
                        </span>
                        <span className="block truncate text-meta text-muted">{hit.service.short}</span>
                      </span>
                      <CornerDownLeft aria-hidden="true" className="search-enter size-4 shrink-0 rtl:-scale-x-100" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
