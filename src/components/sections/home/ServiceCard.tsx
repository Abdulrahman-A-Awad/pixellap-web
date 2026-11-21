import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import type { HomeCategoryCard } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { coverSizes, imageSource } from '@/lib/images';

const MAX_TAGS = 4;

/**
 * One stacking card: copy (number + icon, title, 2-line excerpt, ≤ 4 tags + "+N", "Learn more" pill)
 * and a full-bleed photo on the inline-end side (~45%).
 *
 * Desktop (globals.css `.stack-card`): sticky at header + 24px + index × 14px; height
 * min(100svh − header − 64px − (n − 1) × 14px, 560px), so the WHOLE card incl. the button is visible
 * even for the last, most offset card. Opaque (bg-card); the photo has the low-res `thumb` as
 * placeholder and loads eagerly (never a blank frame while a card stacks).
 * The whole card is clickable through one stretched link (one link per card for screen readers).
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
  const cover = category.cover;

  return (
    <article
      data-stack-card
      aria-labelledby={titleId}
      className="stack-card"
      style={{ '--i': index, '--n': total, zIndex: index + 1 } as CSSProperties}
    >
      <div
        data-stack-inner
        className={cn(
          'group relative grid overflow-hidden rounded-[24px] border border-border bg-card',
          'shadow-[0_30px_60px_-45px_color-mix(in_oklab,var(--brand-black)_70%,transparent)]',
          'transition-[border-color,box-shadow] duration-500 will-change-transform',
          'md:grid-cols-[55fr_45fr] lg:h-full',
          'focus-within:border-lavender/60 hover:border-lavender/60',
        )}
      >
        <div className="flex min-w-0 flex-col gap-4 p-6 md:p-9 lg:gap-5 lg:p-10 xl:p-12">
          <div className="flex items-center justify-between gap-4">
            <PixelDigits
              value={number}
              cell={5}
              className="text-link"
              label={`${number} / ${String(total).padStart(2, '0')}`}
            />
            <CategoryIcon icon={category.icon} index={index} />
          </div>

          <div className="mt-auto flex flex-col gap-3 md:mt-4 lg:mt-auto">
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
            className={buttonClasses(
              'primary',
              "group/btn mt-2 w-fit ps-6 pe-2 after:absolute after:inset-0 after:content-[''] lg:mt-auto",
            )}
          >
            {learnMore}
            <span className="sr-only">: {category.title}</span>
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-pill bg-on-primary/15 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            >
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </span>
          </Link>
        </div>

        {/* Full-bleed photo on the inline-end side (grid order follows dir); on top on phones. */}
        <div
          className="relative order-first aspect-[16/10] overflow-hidden bg-surface-2 bg-cover bg-center md:order-none md:aspect-auto md:h-full"
          // Low-res placeholder (400w) under the photo: the card never shows an empty frame.
          style={cover?.conversions?.thumb ? { backgroundImage: `url(${cover.conversions.thumb})` } : undefined}
        >
          {cover ? (
            <Image
              src={imageSource(cover)}
              alt={cover.alt}
              fill
              loading="eager"
              fetchPriority={index === 0 ? 'auto' : 'low'}
              sizes={coverSizes(cover, [
                // Desktop: ~45% of the 1280px container, 560px tall.
                { media: '(min-width: 1024px)', width: 540, unit: 'px', boxRatio: 540 / 560 },
                { media: '(min-width: 768px)', width: 45, unit: 'vw', boxRatio: 0.8 },
                { media: null, width: 100, unit: 'vw', boxRatio: 16 / 10 },
              ])}
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
