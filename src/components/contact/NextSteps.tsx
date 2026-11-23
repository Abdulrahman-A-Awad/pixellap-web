import type { CSSProperties } from 'react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { PixelIcon, type PixelIconName } from '@/components/brand/PixelIcon';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { ProcessProgress, ProcessStep } from '@/components/sections/home/ProcessProgress';
import type { Translate } from '@/lib/site/translate';

const STEPS: { icon: PixelIconName; key: string }[] = [
  { icon: 'search', key: 'contact.next_1' },
  { icon: 'clock', key: 'contact.next_2' },
  { icon: 'star', key: 'contact.next_3' },
];

/**
 * "What happens next": the home process-line style (same markup + CSS `.process-*`), three steps
 * from ui strings. Not scroll-linked: the line draws and the steps light up once, in sequence, when
 * it scrolls in (ProcessProgress trigger="enter").
 */
export function NextSteps({ t }: { t: Translate }) {
  return (
    <section aria-labelledby="next-title" className="section-y">
      <div className="container-page flex flex-col gap-12">
        <SectionHeading title={t('contact.next_title')} id="next-title" />
        <ProcessProgress trigger="enter">
          <ol className="process-steps grid" style={{ '--cols': STEPS.length } as CSSProperties}>
            {STEPS.map((step, i) => {
              const number = String(i + 1).padStart(2, '0');
              return (
                <ProcessStep key={step.key} index={i}>
                  <div className="process-card surface-card flex h-full flex-col gap-4 p-6 lg:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <span className="process-icon inline-flex size-14 items-center justify-center rounded-[16px]">
                        <PixelIcon name={step.icon} cell={4} gradient />
                      </span>
                      <PixelDigits value={number} cell={4} className="process-num" label={number} />
                    </div>
                    <h3 className="mt-1 text-title">{t(`${step.key}_title`)}</h3>
                    <p className="text-muted">{t(`${step.key}_text`)}</p>
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
