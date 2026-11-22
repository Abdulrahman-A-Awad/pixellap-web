import type { CSSProperties } from 'react';
import { PixelField } from '@/components/brand/PixelField';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { HomeStat } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { StatCount } from './StatCount';

/** Big counters with thin dividers; 2×2 on mobile, one row on desktop. */
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
      <div className="container-page flex flex-col gap-12">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} id={headingId} />

        <dl
          className={cn(
            'grid grid-cols-2 border-y border-border',
            items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
          )}
        >
          {items.map((stat, i) => (
            <div
              key={`${stat.label}-${i}`}
              data-reveal
              style={{ '--reveal-i': i } as CSSProperties}
              className={cn(
                // column-reverse keeps <dt> before <dd> in the DOM; justify-end aligns every number to the top.
                'flex flex-col-reverse justify-end gap-3 px-4 py-8 md:px-8 md:py-10',
                // Dividers: between columns (logical) and between the two mobile rows.
                i % 2 === 1 && 'border-s border-border',
                i >= 2 && 'border-t border-border lg:border-t-0',
                i > 0 && 'lg:border-s',
              )}
            >
              <dt className="text-meta text-muted">{stat.label}</dt>
              <dd className="text-[clamp(2.5rem,4vw,3.5rem)] leading-none">
                {/* Numbers stay LTR inside RTL text. */}
                <bdi dir="ltr" className="inline-flex items-baseline">
                  {stat.prefix && <span className="font-display-thin text-link">{stat.prefix}</span>}
                  {/* CSS count-up (globals.css .stat-count): the real number stays in the DOM. */}
                  <StatCount value={stat.value} />
                  {stat.suffix && <span className="font-display-thin text-link">{stat.suffix}</span>}
                </bdi>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
