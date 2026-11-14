import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { Link } from '@/i18n/navigation';
import type { ServiceCategory } from '@/lib/api/types';
import { cn } from '@/lib/cn';

/**
 * Desktop: 3 columns, deterministic "2 large + 4 medium" layout —
 *   [ 0 0 1 ]
 *   [ 0 0 2 ]
 *   [ 3 4 4 ]
 *   [ 5 4 4 ]
 * Tablet: 2 columns. Mobile: 1 column. Each tile is a single link.
 */
const LARGE = new Set([0, 4]);

export function ServicesBento({
  categories,
  countLabel,
}: {
  categories: ServiceCategory[];
  /** e.g. "9 services" (plural-aware, per locale). */
  countLabel: (count: number) => string;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:auto-rows-[minmax(17rem,auto)] lg:grid-cols-3 lg:gap-5">
      {categories.map((category, i) => {
        const large = LARGE.has(i) && categories.length >= 6;
        const number = String(i + 1).padStart(2, '0');
        return (
          <li
            key={category.slug}
            data-reveal
            style={{ '--reveal-i': i % 3 } as CSSProperties}
            className={cn(large && 'lg:col-span-2 lg:row-span-2')}
          >
            <Link
              href={`/services/${category.slug}`}
              className={cn(
                'group relative isolate flex h-full min-h-72 flex-col justify-end overflow-hidden rounded-card border border-border bg-surface p-6 md:p-8',
                'transition-[border-color,box-shadow] duration-500',
                'hover:border-lavender/70 hover:shadow-[0_0_0_1px_var(--brand-lavender),0_0_56px_-14px_var(--accent-glow)]',
                'focus-visible:border-lavender',
                large && 'lg:min-h-[34rem] lg:p-10',
              )}
            >
              {/* Visual: cover photo or a brand pixel composition. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
              >
                {category.cover ? (
                  <Image
                    src={category.cover.conversions?.lg ?? category.cover.url}
                    alt=""
                    fill
                    sizes={
                      large
                        ? '(min-width: 1024px) 66vw, (min-width: 768px) 50vw, 100vw'
                        : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                    }
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-y-0 end-0 w-[78%] opacity-90">
                    <PixelComposition seed={i * 17 + 3} cols={large ? 8 : 6} rows={large ? 8 : 5} />
                  </div>
                )}
              </div>
              {/* Scrim: page surface → transparent, from the text corner (dark in dark mode). */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-linear-to-t from-surface from-15% via-surface/70 via-45% to-transparent to-75%"
              />

              <div className="flex items-start justify-between gap-4">
                <PixelDigits value={number} cell={large ? 6 : 5} className="text-link" />
                <CategoryIcon icon={category.icon} index={i} />
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-16">
                <h2 className={cn('font-bold text-balance', large ? 'text-3xl md:text-4xl' : 'text-2xl')}>
                  {category.title}
                </h2>
                <p className={cn('text-muted', large ? 'max-w-lg text-lg' : 'line-clamp-2')}>{category.excerpt}</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="rounded-pill border border-border bg-bg/60 px-3 py-1 text-sm text-muted backdrop-blur">
                    {countLabel(category.services_count)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 items-center justify-center rounded-pill bg-primary text-on-primary transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  >
                    <ArrowRight className="size-5 rtl:-scale-x-100" />
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
