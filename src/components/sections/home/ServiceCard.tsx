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
import { ServiceTags } from './ServiceTags';

/**
 * One stacking card: copy (number + icon, title ≤ 2 lines from lg (full below: plain list), excerpt ≤ 2 lines, tags limited to 1–2 ROWS
 * + "+N", "Learn more" pinned to the bottom) and a photo filling the inline-end column (~45%).
 *
 * Height is CONTENT-driven (never a viewport-based fixed height that the copy can outgrow): every
 * part of the copy is capped (line clamps, tag rows), and the card has a floor of min(70svh, 520px)
 * from lg (globals.css `.stack-card`). Nothing in the copy column clips — the photo column clips
 * itself and carries the card's end-side radii. Sticky stacking only where the whole stack fits
 * (lg AND ≥ 760px tall); shorter laptops, tablets and phones get a normal list.
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
  const titleId = `service-card-${category.slug}`;
  const cover = category.cover;

  return (
    <article
      data-stack-card
      aria-labelledby={titleId}
      className="stack-card"
      style={{ '--i': index, zIndex: index + 1 } as CSSProperties}
    >
      <div
        data-stack-inner
        className={cn(
          'group relative grid rounded-[24px] border border-border bg-card',
          'shadow-[0_30px_60px_-45px_color-mix(in_oklab,var(--brand-black)_70%,transparent)]',
          'transition-[border-color,box-shadow] duration-500 will-change-transform',
          'md:grid-cols-[55fr_45fr]',
          'focus-within:border-lavender/60 hover:border-lavender/60',
        )}
      >
        <div className="flex min-h-0 min-w-0 flex-col gap-4 p-6 md:p-9 lg:p-10 xl:px-12">
          <div className="flex items-center justify-between gap-4">
            <PixelDigits
              value={number}
              cell={5}
              className="text-link"
              label={`${number} / ${String(total).padStart(2, '0')}`}
            />
            <CategoryIcon icon={category.icon} index={index} />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <h3 id={titleId} className="text-card-title text-balance lg:line-clamp-2">
              {category.title}
            </h3>
            <p className="line-clamp-2 measure text-muted">{category.excerpt}</p>
          </div>

          <ServiceTags tags={category.services} />

          {/* Pinned to the bottom of the card; pt keeps a gap above it when the copy is tallest. */}
          <div className="mt-auto pt-2">
            <Link
              href={`/services/${category.slug}`}
              className={buttonClasses(
                'primary',
                "group/btn w-fit ps-6 pe-2 after:absolute after:inset-0 after:content-['']",
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
        </div>

        {/* Full-bleed photo on the inline-end side (grid order follows dir); on top on phones. */}
        <div
          className="relative order-first aspect-[16/10] overflow-hidden rounded-ss-[23px] rounded-se-[23px] bg-surface-2 bg-cover bg-center md:order-none md:aspect-auto md:rounded-ss-none md:rounded-ee-[23px]"
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
                // Desktop: ~45% of the 1280px container, ~520px tall.
                { media: '(min-width: 1024px)', width: 540, unit: 'px', boxRatio: 540 / 520 },
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
