'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import type { Faq } from '@/lib/api/types';

/**
 * Exclusive accordion (disclosure pattern: button[aria-expanded] + region). The answer HTML is
 * always in the DOM (SEO, find-in-page after opening); the panel animates its height with
 * grid-template-rows 0fr → 1fr in every browser and is visibility-hidden once closed
 * (globals.css `.faq-panel`). Open card: lavender border + lifted shadow; the + turns into ×.
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId();

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => {
        const isOpen = open === faq.id;
        const button = `${uid}-q-${faq.id}`;
        const panel = `${uid}-a-${faq.id}`;
        return (
          <Reveal
            key={faq.id}
            index={Math.min(i, 5)}
            className="faq-item surface-card transition-[border-color,box-shadow] duration-300 hover:border-lavender/40"
          >
            <div data-open={isOpen ? '' : undefined}>
              <h3>
                <button
                  id={button}
                  type="button"
                  data-faq-trigger
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 px-6 py-5 text-start text-lg font-bold md:px-7 md:py-6"
                >
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="faq-icon inline-flex size-9 shrink-0 items-center justify-center rounded-pill border border-border"
                  >
                    <Plus className="size-4" />
                  </span>
                </button>
              </h3>
              <div id={panel} role="region" aria-labelledby={button} className="faq-panel">
                <div>
                  <div
                    className="prose-answer measure px-6 pb-6 text-muted md:px-7 md:pb-7"
                    // Trusted HTML from the CMS rich editor.
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
