import type { CSSProperties } from 'react';
import { PixelField } from '@/components/brand/PixelField';
import { SectionHeading } from '@/components/sections/SectionHeading';
import type { HomeStat } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { StatCounter } from './StatCounter';

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
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className="relative isolate overflow-hidden py-20 md:py-28"
    >
      <PixelField seed={21} rows={8} density={0.035} className="opacity-50" />
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
              <dt className="text-sm text-muted md:text-base">{stat.label}</dt>
              <dd className="text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-bold tracking-tight">
                {/* Numbers stay LTR inside RTL text. */}
                <bdi dir="ltr" className="inline-flex items-baseline">
                  {stat.prefix && <span className="text-primary">{stat.prefix}</span>}
                  <StatCounter value={stat.value} />
                  {stat.suffix && <span className="text-primary">{stat.suffix}</span>}
                </bdi>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
