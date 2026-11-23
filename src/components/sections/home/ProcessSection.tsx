import type { CSSProperties } from 'react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { PixelField } from '@/components/brand/PixelField';
import { PixelIcon, type PixelIconName } from '@/components/brand/PixelIcon';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { ProcessSection as ProcessData } from '@/lib/api/types';
import { ProcessProgress, ProcessStep } from './ProcessProgress';

/** Decorative step icons (brief → idea → production → launch), cycled for longer processes. */
const ICONS: PixelIconName[] = ['search', 'idea', 'clapper', 'rocket'];

/** Glow pulse: seconds per segment, then a pause before it starts again from step 1. */
const PULSE_STEP = 0.9;
const PULSE_PAUSE = 1.6;

/**
 * Keyframes for the pulse that loops along the completed line. Every segment runs the same
 * keyframes, delayed by index × PULSE_STEP; the travel takes the first PULSE_STEP of the cycle, so the
 * pulse visibly runs from the first marker to the last, then rests. Offsets depend on the step
 * count, so they are generated here (CSS keyframe offsets cannot use variables).
 */
function pulseKeyframes(segments: number) {
  const cycle = segments * PULSE_STEP + PULSE_PAUSE;
  const end = ((PULSE_STEP / cycle) * 100).toFixed(2);
  return {
    cycle,
    css:
      `@keyframes process-pulse-x{0%{background-position:-56px 50%}${end}%,100%{background-position:calc(100% + 56px) 50%}}` +
      `@keyframes process-pulse-y{0%{background-position:50% -56px}${end}%,100%{background-position:50% calc(100% + 56px)}}`,
  };
}

/**
 * Process: equal-height cards joined by a line through each step's marker. Desktop: one row, markers
 * on the line above the cards; phones/tablets: vertical timeline on the inline-start side. Layout and
 * line geometry are pure CSS (globals.css `.process-*`); ProcessProgress links the line to the scroll
 * (row top at 85% → row bottom at 85%); markers pop and cards rise as it reaches them; a glow pulse
 * loops along the completed line. Card: pixel icon in a soft chip + pixel-digit number, title, text.
 */
export function ProcessSection({
  section,
  id = 'process',
  icons = ICONS,
}: {
  /** Header + steps (home: the CMS process section; contact: "What happens next" from ui strings). */
  section: Pick<ProcessData, 'eyebrow' | 'title' | 'subtitle' | 'steps'>;
  id?: string;
  /** Step icons, cycled. */
  icons?: PixelIconName[];
}) {
  if (section.steps.length === 0) return null;
  const total = section.steps.length;
  const pulse = pulseKeyframes(Math.max(total - 1, 1));

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative isolate section-y">
      <style href={`process-pulse-${total}`} precedence="default">
        {pulse.css}
      </style>
      <PixelField seed={33} corner="bottom-start" count={8} />
      <div className="container-page flex flex-col gap-12">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          id={`${id}-title`}
          wide
        />

        <ProcessProgress>
          <ol
            className="process-steps grid"
            style={
              {
                '--cols': Math.min(total, 4),
                '--pulse-cycle': `${pulse.cycle}s`,
                '--pulse-step': `${PULSE_STEP}s`,
              } as CSSProperties
            }
          >
            {section.steps.map((step, i) => {
              const number = String(i + 1).padStart(2, '0');
              return (
                <ProcessStep key={`${step.title}-${i}`} index={i}>
                  <div className="process-card surface-card flex h-full flex-col gap-4 p-6 lg:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <span className="process-icon inline-flex size-14 items-center justify-center rounded-[16px]">
                        <PixelIcon name={icons[i % icons.length]} cell={4} gradient />
                      </span>
                      <PixelDigits value={number} cell={4} className="process-num" label={number} />
                    </div>
                    <h3 className="mt-1 text-title">{step.title}</h3>
                    <p className="text-muted">{step.description}</p>
                  </div>
                </ProcessStep>
              );
            })}
          </ol>
        </ProcessProgress>
      </div>
    </section>
  );
}
