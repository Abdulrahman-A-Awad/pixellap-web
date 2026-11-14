'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import type { Faq } from '@/lib/api/types';
import { cn } from '@/lib/cn';

/**
 * Accessible accordion: button + region, aria-expanded/aria-controls, one item open at a time.
 * Height animates with the grid-template-rows 0fr → 1fr trick (pure CSS).
 * Answers are HTML from the admin rich editor.
 */
export function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();

  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((faq, i) => {
        const expanded = open === i;
        const buttonId = `${base}-q${faq.id}`;
        const panelId = `${base}-a${faq.id}`;
        return (
          <li key={faq.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-start text-lg font-bold transition-colors hover:text-link"
              >
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-flex size-9 shrink-0 items-center justify-center rounded-[8px] border border-border transition-[transform,background-color,color] duration-300',
                    expanded && 'rotate-45 border-primary bg-primary text-on-primary',
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out-expo',
                expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden" inert={!expanded}>
                <div
                  className="prose-answer max-w-3xl pb-6 text-muted"
                  // Trusted HTML from the CMS rich editor.
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
