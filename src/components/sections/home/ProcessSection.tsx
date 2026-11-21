import type { CSSProperties } from 'react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { PixelField } from '@/components/brand/PixelField';
import { PixelIcon, type PixelIconName } from '@/components/brand/PixelIcon';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { ProcessSection as ProcessData } from '@/lib/api/types';
import { ProcessLine } from './ProcessLine';

/** Decorative step icons (brief → idea → production → launch), cycled for longer processes. */
const ICONS: PixelIconName[] = ['search', 'idea', 'clapper', 'rocket'];

/**
 * Process: cards connected by a line through each step's marker. Desktop: one row, markers above the
 * cards; phones: a vertical timeline on the inline-start side. The line is measured from the markers
 * and fills over a short scroll range; each step lights up as it is reached (ProcessLine,
 * globals.css `.process-*`). Cards: pixel icon, pixel-digit number, hover lift + gradient border.
 */
export function ProcessSection({ section }: { section: ProcessData }) {
  if (section.steps.length === 0) return null;
  const total = section.steps.length;

  return (
    <section id="process" aria-labelledby="process-title" className="relative isolate section-y">
      <PixelField seed={33} corner="bottom-start" count={8} />
      <div className="container-page flex flex-col gap-12">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          id="process-title"
        />

        <ProcessLine className="relative">
          <ol
            className="process-steps relative grid gap-5 lg:gap-6"
            style={{ '--cols': Math.min(total, 4) } as CSSProperties}
          >
            {section.steps.map((step, i) => {
              const number = String(i + 1).padStart(2, '0');
              return (
                <li
                  key={`${step.title}-${i}`}
                  data-step
                  data-reveal
                  style={{ '--reveal-i': i } as CSSProperties}
                  className="process-step grid grid-cols-[18px_1fr] gap-4 lg:grid-cols-1 lg:grid-rows-[auto_1fr] lg:gap-6"
                >
                  <span aria-hidden="true" data-marker className="process-dot mt-8 lg:mt-0" />
                  <div className="process-card flex h-full flex-col gap-5 rounded-[20px] border border-border bg-card p-6 lg:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="process-icon inline-flex size-16 items-center justify-center rounded-[16px]">
                        <PixelIcon name={ICONS[i % ICONS.length]} cell={5} gradient />
                      </span>
                      <PixelDigits value={number} cell={4} className="process-num mt-1 text-muted" label={number} />
                    </div>
                    <h3 className="text-title">{step.title}</h3>
                    <p className="text-muted">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </ProcessLine>
      </div>
    </section>
  );
}
