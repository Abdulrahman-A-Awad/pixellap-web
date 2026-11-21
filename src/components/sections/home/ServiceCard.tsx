import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { Link } from '@/i18n/navigation';
import type { HomeCategoryCard } from '@/lib/api/types';
import { cn } from '@/lib/cn';

const MAX_TAGS = 4;

/**
 * One stacking card: copy (number + icon, title, 2-line excerpt, ≤ 4 tags + "+N", "Learn more")
 * and a full-bleed photo on the inline-end side (~45%). Desktop height min(78vh, 560px) so the next
 * card's top edge peeks below it. The whole card is clickable through a single stretched link, so
 * screen readers get one link per card with a clear name.
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
      style={{ top: `calc(6.5rem + ${index} * 1.25rem)`, zIndex: index + 1 }}
    >
      <div
        data-stack-inner
        className={cn(
          'group relative grid overflow-hidden rounded-[24px] border border-border bg-card',
          'shadow-[0_30px_60px_-45px_color-mix(in_oklab,var(--brand-black)_70%,transparent)]',
          'transition-[border-color,box-shadow] duration-500 will-change-transform',
          'md:grid-cols-[55fr_45fr] lg:h-[min(78vh,560px)]',
          'hover:border-lavender/60 hover:shadow-[0_0_0_1px_var(--brand-lavender),0_0_48px_-12px_var(--accent-glow)]',
          'focus-within:border-lavender/60',
        )}
      >
        <div className="flex min-w-0 flex-col gap-5 p-6 md:p-9 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <PixelDigits
              value={number}
              cell={5}
              className="text-link"
              label={`${number} / ${String(total).padStart(2, '0')}`}
            />
            <CategoryIcon icon={category.icon} index={index} />
          </div>

          <div className="mt-auto flex flex-col gap-3 md:mt-6 lg:mt-auto">
            <h3 id={titleId} className="text-heading text-balance">
              {category.title}
            </h3>
            <p className="line-clamp-2 measure text-muted">{category.excerpt}</p>
          </div>

          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag} className="rounded-pill border border-border px-3 py-1 text-meta text-muted">
                  {tag}
                </li>
              ))}
              {more > 0 && (
                <li className="rounded-pill bg-surface-2 px-3 py-1 text-meta font-bold text-link">
                  <bdi dir="ltr">+{more}</bdi>
                </li>
              )}
            </ul>
          )}

          <Link
            href={`/services/${category.slug}`}
            className="mt-2 inline-flex min-h-11 w-fit items-center gap-2 font-bold text-link after:absolute after:inset-0 after:content-[''] lg:mt-auto"
          >
            {learnMore}
            <span className="sr-only">: {category.title}</span>
            <span
              aria-hidden="true"
              className="inline-flex size-9 items-center justify-center rounded-pill border border-border transition-[transform,background-color,border-color,color] duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary"
            >
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </span>
          </Link>
        </div>

        {/* Full-bleed photo on the inline-end side (grid order follows dir); on top on phones. */}
        <div className="relative order-first aspect-[16/10] overflow-hidden bg-surface-2 md:order-none md:aspect-auto md:h-full">
          {category.cover ? (
            <Image
              src={category.cover.conversions?.lg ?? category.cover.url}
              alt={category.cover.alt}
              fill
              sizes="(min-width: 1280px) 560px, (min-width: 768px) 45vw, 100vw"
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
