'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
  icon: ReactNode;
}

/** Phones: the list opens as a bottom sheet. */
const SHEET_QUERY = '(max-width: 639px)';
const TYPEAHEAD_MS = 600;

/**
 * Select-only combobox (WAI-ARIA APG pattern): a button[role=combobox] that keeps focus and points at
 * the active option with aria-activedescendant, plus a listbox. Looks like the floating-label fields
 * (`.float-input` + `.float-label`, "Optional" tag), chevron rotates. ≥ 640px: glass popover under the
 * field; phones: bottom sheet (portal on <body>; the backdrop takes no touch scrolling, the list
 * scrolls on its own — no html overflow lock, which shifts the mobile visual viewport). Keyboard: ↑/↓, Home/End,
 * type-ahead (any printable key), Enter/Space select, Esc closes, Tab closes; outside click closes.
 * The active option follows the pointer too. RTL via logical properties only (globals.css `.select-*`).
 */
export function ServiceSelect({
  id,
  label,
  optionalTag,
  sheetTitle,
  options,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
}: {
  id: string;
  label: string;
  optionalTag?: string;
  /** Heading of the phone bottom sheet. */
  sheetTitle: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: '', at: 0 });

  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-opt-${i}`;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const show = (index: number) => {
    setSheet(window.matchMedia(SHEET_QUERY).matches);
    setActive(Math.max(0, Math.min(options.length - 1, index)));
    setOpen(true);
  };
  const close = () => setOpen(false);
  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    close();
    triggerRef.current?.focus();
  };

  // Keep the active option in view.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)
      ?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is derived from id
  }, [open, active, sheet]);

  // Outside pointer → close. The phone sheet layer (portal: backdrop + sheet) counts as inside: its
  // backdrop closes on CLICK, so the tap never falls through to the page underneath.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || layerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  /** Type-ahead: the next option (after the active one) whose label starts with the typed text. */
  const matchTyped = (key: string, now: number): number => {
    const state = typeahead.current;
    state.text = now - state.at > TYPEAHEAD_MS ? key : state.text + key;
    state.at = now;
    const query = state.text.toLocaleLowerCase();
    // Repeating one letter cycles through the options with that initial.
    const repeat = query.length > 1 && [...query].every((c) => c === query[0]);
    const needle = repeat ? query[0] : query;
    const start = repeat || query.length === 1 ? active + 1 : Math.max(active, 0);
    for (let k = 0; k < options.length; k++) {
      const i = (start + k) % options.length;
      if (options[i].label.toLocaleLowerCase().startsWith(needle)) return i;
    }
    return -1;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;
    const last = options.length - 1;
    const printable = key.length === 1 && key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (!open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        show(selectedIndex >= 0 ? selectedIndex : key === 'ArrowUp' ? last : 0);
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        show(key === 'Home' ? 0 : last);
      } else if (printable) {
        const match = matchTyped(key, event.timeStamp);
        if (match >= 0) show(match);
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        if (event.altKey) choose(active);
        else setActive((i) => Math.min(last, i + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey) choose(active);
        else setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActive(0);
        break;
      case 'End':
        event.preventDefault();
        setActive(last);
        break;
      case 'PageDown':
        event.preventDefault();
        setActive((i) => Math.min(last, i + 5));
        break;
      case 'PageUp':
        event.preventDefault();
        setActive((i) => Math.max(0, i - 5));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(active);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        close();
        break;
      default:
        if (printable) {
          const match = matchTyped(key, event.timeStamp);
          if (match >= 0) setActive(match);
        }
    }
  };

  const list = (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      aria-labelledby={labelId}
      tabIndex={-1}
      className="select-list flex flex-col gap-0.5"
    >
      {options.map((option, i) => {
        const isSelected = i === selectedIndex;
        return (
          <li
            key={option.value}
            id={optionId(i)}
            role="option"
            aria-selected={isSelected}
            data-active={i === active ? '' : undefined}
            className="select-option"
            // Keep focus on the combobox while clicking an option.
            onPointerDown={(e) => e.preventDefault()}
            onPointerMove={() => setActive(i)}
            onClick={() => choose(i)}
          >
            <span aria-hidden="true" className="inline-flex shrink-0">
              {option.icon}
            </span>
            <span className="min-w-0 flex-1">{option.label}</span>
            {isSelected && <Check aria-hidden="true" className="select-check size-4.5 shrink-0" />}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div ref={rootRef} className="float-field">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        data-filled={selected ? '' : undefined}
        onClick={() => (open ? close() : show(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (!open) onBlur?.();
        }}
        className="float-input select-trigger"
      >
        {/* The value (empty until chosen: the label rests inside the field like the other inputs). */}
        <span className="flex min-w-0 items-center gap-2.5">
          {selected && (
            <>
              <span aria-hidden="true" className="select-trigger-icon inline-flex shrink-0">
                {selected.icon}
              </span>
              <span className="truncate">{selected.label}</span>
            </>
          )}
        </span>
      </button>
      <span id={labelId} className="float-label">
        <span className="truncate">{label}</span>
        {optionalTag && <span className="optional-tag">{optionalTag}</span>}
      </span>
      <ChevronDown aria-hidden="true" className="select-chevron size-5" />

      {open && !sheet && <div className="select-pop">{list}</div>}
      {open &&
        sheet &&
        createPortal(
          <div ref={layerRef}>
            {/* Backdrop tap closes; preventDefault keeps focus on the combobox. */}
            <div
              aria-hidden="true"
              className="select-backdrop"
              onPointerDown={(e) => e.preventDefault()}
              onClick={close}
            />
            <div className="select-sheet">
              <span aria-hidden="true" className="mx-auto mt-1 mb-3 h-1.5 w-10 shrink-0 rounded-pill bg-border" />
              <p aria-hidden="true" className="mb-2 px-3 font-bold text-text">
                {sheetTitle}
              </p>
              {list}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
