import type { CSSProperties } from 'react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { PixelField } from '@/components/brand/PixelField';
import { PixelIcon, type PixelIconName } from '@/components/brand/PixelIcon';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { ProcessSection as ProcessData } from '@/lib/api/types';
import { ProcessReveal } from './ProcessReveal';

/** Decorative step icons (brief → idea → production → launch), cycled for longer processes. */
const ICONS: PixelIconName[] = ['search', 'idea', 'clapper', 'rocket'];

/**
 * Process: equal-height cards joined by a line through each step's marker. Desktop: one row, markers
 * on the line above the cards; phones/tablets: vertical timeline on the inline-start side.
 * Layout and line are pure CSS (globals.css `.process-*`); ProcessReveal only triggers the one-shot
 * sequential reveal when the steps scroll in. Card: pixel icon in a soft chip + pixel-digit number on
 * one row, title, description.
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
          wide
        />

        <ProcessReveal>
          <ol
            className="process-steps grid"
            style={{ '--cols': Math.min(total, 4), '--count': total } as CSSProperties}
          >
            {section.steps.map((step, i) => {
              const number = String(i + 1).padStart(2, '0');
              return (
                <li key={`${step.title}-${i}`} className="process-step" style={{ '--i': i } as CSSProperties}>
                  <span aria-hidden="true" className="process-dot" />
                  <span aria-hidden="true" className="process-seg" />
                  <div className="process-card flex h-full flex-col gap-4 rounded-[20px] border border-border bg-card p-6 lg:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <span className="process-icon inline-flex size-14 items-center justify-center rounded-[14px]">
                        <PixelIcon name={ICONS[i % ICONS.length]} cell={4} gradient />
                      </span>
                      <PixelDigits value={number} cell={4} className="process-num" label={number} />
                    </div>
                    <h3 className="mt-1 text-title">{step.title}</h3>
                    <p className="text-muted">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </ProcessReveal>
      </div>
    </section>
  );
}
