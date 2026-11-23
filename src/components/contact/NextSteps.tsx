import type { PixelIconName } from '@/components/brand/PixelIcon';
import { ProcessSection } from '@/components/sections/home/ProcessSection';
import type { Translate } from '@/lib/site/translate';

const STEPS = ['contact.next_1', 'contact.next_2', 'contact.next_3'] as const;
const ICONS: PixelIconName[] = ['search', 'clock', 'star'];

/**
 * "What happens next": THE home process section (same markup, scroll-linked line, marker pop, card
 * activation that reverses when scrolling back up, glow pulse) with three steps from ui strings.
 */
export function NextSteps({ t }: { t: Translate }) {
  return (
    <ProcessSection
      id="next"
      icons={ICONS}
      section={{
        eyebrow: null,
        title: t('contact.next_title'),
        subtitle: null,
        steps: STEPS.map((key) => ({ title: t(`${key}_title`), description: t(`${key}_text`) })),
      }}
    />
  );
}
