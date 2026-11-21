import { Clapperboard, Compass, Lightbulb, Rocket, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { PixelField } from '@/components/brand/PixelField';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { ProcessSection as ProcessData } from '@/lib/api/types';
import { ProcessLine } from './ProcessLine';

/** Decorative step icons (brief → idea → production → launch), cycled for longer processes. */
const ICONS: LucideIcon[] = [Compass, Lightbulb, Clapperboard, Rocket];

/**
 * Process: cards connected by a line. Desktop: one row, the line runs through the node above each
 * card; phones: a vertical timeline on the inline-start side. The line draws as you scroll and each
 * node lights up when it is reached (ProcessLine; globals.css `.process-*`).
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

        <div style={{ '--cols': Math.min(total, 4) } as CSSProperties}>
          <ProcessLine className="relative">
            <div aria-hidden="true" className="process-track" />
            <div aria-hidden="true" className="process-line" />

            <ol className="process-steps relative grid gap-5">
              {section.steps.map((step, i) => {
                const Icon = ICONS[i % ICONS.length];
                const number = String(i + 1).padStart(2, '0');
                return (
                  <li
                    key={`${step.title}-${i}`}
                    data-step
                    data-reveal
                    style={{ '--reveal-i': i } as CSSProperties}
                    className="process-step grid grid-cols-[14px_1fr] gap-4 lg:grid-cols-1 lg:grid-rows-[auto_1fr] lg:gap-5"
                  >
                    <span aria-hidden="true" className="process-dot mt-7 lg:mt-0" />
                    <div className="flex h-full flex-col gap-4 rounded-[20px] border border-border bg-card p-6 transition-colors duration-500 lg:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <PixelDigits value={number} cell={6} className="text-link" label={number} />
                        <Icon aria-hidden="true" className="size-5 text-muted" strokeWidth={1.5} />
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
      </div>
    </section>
  );
}
