import { PixelField } from '@/components/brand/PixelField';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { ProcessSection as ProcessData } from '@/lib/api/types';
import { ProcessLine } from './ProcessLine';

/**
 * Steps on a line: horizontal on desktop, vertical (inline-start side) on mobile.
 * The line grows from the start side as you scroll; steps light up when it reaches them.
 */
export function ProcessSection({ section }: { section: ProcessData }) {
  if (section.steps.length === 0) return null;

  return (
    <section id="process" aria-labelledby="process-title" className="relative isolate overflow-clip py-20 md:py-28">
      <PixelField seed={33} rows={9} density={0.03} className="opacity-50" />
      <div className="container-page flex flex-col gap-14">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          id="process-title"
        />

        <ProcessLine className="process relative">
          {/* Track + drawn line (vertical on mobile, horizontal on desktop). */}
          <div aria-hidden="true" className="process-track" />
          <div aria-hidden="true" className="process-line" />

          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
            {section.steps.map((step, i) => (
              <li key={`${step.title}-${i}`} data-step className="process-step flex gap-5 lg:flex-col lg:gap-6">
                <span className="process-dot relative z-10 inline-flex size-12 shrink-0 items-center justify-center rounded-[10px] border border-border bg-surface text-lg font-bold transition-[background-color,color,border-color,box-shadow] duration-500">
                  <bdi dir="ltr">{String(i + 1).padStart(2, '0')}</bdi>
                </span>
                <div className="flex flex-col gap-2 pt-1 lg:pt-0">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </ProcessLine>
      </div>
    </section>
  );
}
