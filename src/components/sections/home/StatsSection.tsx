import { PixelField } from '@/components/brand/PixelField';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { HomeStat } from '@/lib/api/types';
import { StatTiles } from './StatTiles';

/**
 * Standalone stats section (home when About is hidden, /about): the shared section header + the same
 * stat tiles as the home About strip (`StatTiles`: count-up, gradient numerals, hover).
 */
export function StatsSection({
  items,
  eyebrow,
  title,
  subtitle,
  id = 'stats',
}: {
  items: HomeStat[];
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  id?: string;
}) {
  if (items.length === 0) return null;
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className="relative isolate section-y">
      <PixelField seed={21} corner="top-end" count={7} />
      <div className="container-page flex flex-col gap-10 lg:gap-12">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} id={headingId} />
        <StatTiles items={items} />
      </div>
    </section>
  );
}
