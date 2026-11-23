'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { ServiceRow } from '@/lib/api/types';

/** Pointer hover opens a row after this delay, so sweeping across the list does not make it jump. */
const HOVER_INTENT_MS = 140;

/**
 * A discipline's services as rows (index, title, chevron). One row open at a time: hover (fine
 * pointers, with intent delay), keyboard focus or a tap/click opens it; the panel grows smoothly
 * (grid-rows 0fr → 1fr, `.svc-row`) to show the short description and a "Details" link to the card on
 * the category page (/services/{slug}#{anchor}). Disclosure pattern: button[aria-expanded] + region.
 * DOM budget (43 rows on one page): a panel's content mounts the first time its row opens (then stays,
 * so closing still animates), the chevron is CSS (`.svc-row-chevron`), the index has no extra wrapper.
 */
export function ServiceRows({
  categorySlug,
  services,
  detailsLabel,
}: {
  categorySlug: string;
  services: ServiceRow[];
  detailsLabel: string;
}) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set());
  const show = (id: number | null) => {
    setOpen(id);
    if (id !== null) setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };
  const hover = useRef<number | undefined>(undefined);
  const finePointer = useRef(false);

  useEffect(() => {
    finePointer.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    return () => window.clearTimeout(hover.current);
  }, []);

  const hoverOpen = (id: number) => {
    if (!finePointer.current) return;
    window.clearTimeout(hover.current);
    hover.current = window.setTimeout(() => show(id), HOVER_INTENT_MS);
  };
  const hoverLeave = () => window.clearTimeout(hover.current);

  return (
    <ol
      className="svc-rows flex flex-col"
      onPointerLeave={() => {
        if (!finePointer.current) return;
        hoverLeave();
        show(null);
      }}
    >
      {services.map((service, i) => {
        const isOpen = open === service.id;
        const button = `${uid}-b-${service.id}`;
        const panel = `${uid}-p-${service.id}`;
        return (
          <li
            key={service.id}
            className="svc-row"
            data-open={isOpen ? '' : undefined}
            onPointerEnter={() => hoverOpen(service.id)}
            onPointerLeave={hoverLeave}
          >
            <h3>
              <button
                id={button}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => show(isOpen ? null : service.id)}
                onFocus={(e) => {
                  // Keyboard focus opens the row (a mouse click is handled by onClick).
                  if (e.currentTarget.matches(':focus-visible')) show(service.id);
                }}
                className="svc-row-head flex w-full cursor-pointer items-center gap-4 py-4 text-start"
              >
                <span
                  aria-hidden="true"
                  dir="ltr"
                  className="svc-row-index w-7 shrink-0 text-start text-meta font-bold"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 text-lg font-bold text-pretty">{service.title}</span>
                <span aria-hidden="true" className="svc-row-chevron" />
              </button>
            </h3>
            <div id={panel} role="region" aria-labelledby={button} className="svc-row-panel">
              <div>
                {seen.has(service.id) && (
                  <div className="flex flex-col items-start gap-3 ps-11 pb-5">
                    {service.short && <p className="measure text-muted">{service.short}</p>}
                    <Link
                      href={`/services/${categorySlug}#${service.anchor}`}
                      className="group inline-flex min-h-11 items-center gap-1.5 text-meta font-bold text-link underline-offset-4 hover:underline"
                      tabIndex={isOpen ? undefined : -1}
                    >
                      {detailsLabel}
                      <span className="sr-only">: {service.title}</span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                      />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
