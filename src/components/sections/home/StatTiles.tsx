import { PixelIcon, type PixelIconName } from '@/components/brand/PixelIcon';
import { Reveal } from '@/components/motion/Reveal';
import type { HomeStat } from '@/lib/api/types';
import { StatCount } from './StatCount';

/** Decorative icon per stat tile (growth, people, time, quality), cycled. */
const STAT_ICONS: PixelIconName[] = ['chart', 'people', 'clock', 'star'];

/**
 * THE stat tiles (home About strip, standalone stats section, /about): up to 4 equal-height
 * `.surface-card` tiles, 2×2 on phones, one row from lg. Each tile is one start-aligned group: icon
 * chip + label on the top row, the large numeral (lavender → iris, accent suffix attached, always LTR)
 * directly below. The tiles of a row share subgrid rows, so labels of different lengths never push the
 * numbers out of line. CSS count-up (`StatCount`), hover lift + chip tilt (`.stat-tile`).
 */
export function StatTiles({ items }: { items: HomeStat[] }) {
  const tiles = items.slice(0, 4);
  if (tiles.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {tiles.map((stat, i) => (
        <Reveal
          key={`${stat.label}-${i}`}
          index={i}
          className="stat-tile surface-card row-span-2 grid grid-rows-subgrid gap-y-2 p-5 sm:p-6"
        >
          {/* Row 1 (aligned to the bottom, so it sits right above the number): chip + label. */}
          <dt className="flex flex-col items-start gap-2 self-end text-meta text-muted sm:flex-row sm:items-center sm:gap-2.5">
            <span
              aria-hidden="true"
              className="stat-chip inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] text-link"
            >
              <PixelIcon name={STAT_ICONS[i % STAT_ICONS.length]} cell={3} />
            </span>
            <span className="text-pretty">{stat.label}</span>
          </dt>
          <dd>
            {/* "120+": numeral block always LTR; suffix after it, accent, smaller, no gap. */}
            <bdi dir="ltr" className="stat-number inline-flex items-baseline text-stat">
              {stat.prefix && <span className="stat-affix">{stat.prefix}</span>}
              <StatCount value={stat.value} className="font-bold" />
              {stat.suffix && <span className="stat-affix">{stat.suffix}</span>}
            </bdi>
          </dd>
        </Reveal>
      ))}
    </dl>
  );
}
