import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { Link } from '@/i18n/navigation';
import type { HomeCategoryCard } from '@/lib/api/types';
import { cn } from '@/lib/cn';

const MAX_TAGS = 6;

/**
 * One stacking card. The whole card is clickable through a single stretched link
 * ("Learn more"), so screen readers get one link per card with a clear name.
 */
export function ServiceCard({
  category,
  index,
  total,
  learnMore,
}: {
  category: HomeCategoryCard;
  index: number;
  total: number;
  learnMore: string;
}) {
  const number = String(index + 1).padStart(2, '0');
  const tags = category.services.slice(0, MAX_TAGS);
  const more = category.services.length - tags.length;
  const titleId = `service-card-${category.slug}`;

  return (
    <article
      data-stack-card
      aria-labelledby={titleId}
      className="lg:sticky"
      style={{ top: `calc(6.5rem + ${index} * 1.75rem)`, zIndex: index + 1 }}
    >
      <div
        data-stack-inner
        className={cn(
          'group relative grid overflow-hidden rounded-card border border-border bg-surface shadow-[0_24px_60px_-40px_color-mix(in_oklab,var(--brand-black)_60%,transparent)]',
          'transition-[border-color,box-shadow] duration-500 will-change-transform md:grid-cols-[1.25fr_1fr]',
          'hover:border-lavender/60 hover:shadow-[0_0_0_1px_var(--brand-lavender),0_0_48px_-12px_var(--accent-glow)]',
          'focus-within:border-lavender/60',
        )}
      >
        <div className="flex flex-col gap-6 p-6 md:p-10">
          <div className="flex items-center justify-between gap-4">
            <PixelDigits
              value={number}
              cell={5}
              className="text-link"
              label={`${number} / ${String(total).padStart(2, '0')}`}
            />
            <CategoryIcon icon={category.icon} index={index} />
          </div>

          <div className="flex flex-col gap-3">
            <h3 id={titleId} className="text-2xl font-bold text-balance md:text-3xl">
              {category.title}
            </h3>
            <p className="max-w-prose text-muted">{category.excerpt}</p>
          </div>

          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag} className="rounded-pill border border-border bg-bg/60 px-3 py-1 text-xs text-muted">
                  {tag}
                </li>
              ))}
              {more > 0 && (
                <li className="rounded-pill bg-surface-2 px-3 py-1 text-xs font-bold text-link">
                  <bdi dir="ltr">+{more}</bdi>
                </li>
              )}
            </ul>
          )}

          <Link
            href={`/services/${category.slug}`}
            className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-bold text-link after:absolute after:inset-0 after:content-['']"
          >
            {learnMore}
            <span className="sr-only">: {category.title}</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            />
          </Link>
        </div>

        {/* Cover on the inline-end side (grid order follows dir). */}
        <div className="relative min-h-56 overflow-hidden bg-surface-2 md:min-h-full">
          {category.cover ? (
            <Image
              src={category.cover.conversions?.lg ?? category.cover.url}
              alt={category.cover.alt}
              fill
              sizes="(min-width: 1280px) 520px, (min-width: 768px) 42vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]">
              <PixelComposition seed={index * 11 + 5} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
