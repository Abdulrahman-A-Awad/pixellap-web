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
 * Tablet: 2 columns. Mobile: 1 column. Each tile is a single link: photo on top (always fully
 * visible), text on its own solid card panel underneath.
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
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
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
                'group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card',
                'transition-[border-color,box-shadow] duration-500',
                'hover:border-lavender/70 hover:shadow-[0_0_0_1px_var(--brand-lavender),0_0_56px_-14px_var(--accent-glow)]',
                'focus-visible:border-lavender',
              )}
            >
              {/* Photo: always fully visible (no scrim) in both themes. */}
              <div
                aria-hidden="true"
                className={cn(
                  'relative aspect-[16/10] shrink-0 overflow-hidden bg-surface-2',
                  large && 'lg:aspect-auto lg:min-h-80 lg:flex-1',
                )}
              >
                <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]">
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
                    <PixelComposition seed={i * 17 + 3} cols={large ? 10 : 8} rows={large ? 6 : 5} />
                  )}
                </div>
              </div>

              {/* Text on its own solid panel. */}
              <div className={cn('flex flex-1 flex-col gap-3 p-6 md:p-7', large && 'lg:flex-none lg:p-9')}>
                <div className="flex items-center justify-between gap-4">
                  <PixelDigits value={number} cell={4} className="text-link" />
                  <CategoryIcon icon={category.icon} index={i} size="sm" />
                </div>
                <h2 className={cn('text-balance', large ? 'text-heading' : 'text-title')}>{category.title}</h2>
                <p className={cn('text-muted', large ? 'measure text-lead' : 'line-clamp-2')}>{category.excerpt}</p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-3">
                  <span className="rounded-pill border border-border px-3 py-1 text-meta text-muted">
                    {countLabel(category.services_count)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-pill bg-primary text-on-primary transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  >
                    <ArrowRight className="size-4 rtl:-scale-x-100" />
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
