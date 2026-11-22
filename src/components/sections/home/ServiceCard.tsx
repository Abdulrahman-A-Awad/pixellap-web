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
import { Parallax } from '@/components/ui/Parallax';
import { ServiceTags } from './ServiceTags';

/**
 * One services card (StackingCards): copy (number + icon, title ≤ 2 lines in stack mode, excerpt
 * 1–2 lines, ONE row of tags + "+N", "Learn more" pinned to the bottom) and a photo (40%, gentle
 * parallax, hover zoom). Layout follows the CARD's width (container queries), so the same markup
 * works stacked on laptops/tablets and in the phone / short-screen carousel. Heights and modes:
 * globals.css `.stack-*`. One stretched link per card (whole card clickable, one link for SR).
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
      style={{ '--i': index, '--stack-n': total, zIndex: index + 1 } as CSSProperties}
    >
      <div
        data-stack-inner
        className={cn(
          'surface-card group relative grid h-full overflow-clip will-change-transform',
          'transition-[border-color,box-shadow] duration-500',
          '@2xl:grid-cols-[3fr_2fr]',
          'focus-within:border-lavender/60 hover:border-lavender/60',
        )}
      >
        <div data-stack-copy className="flex min-h-0 min-w-0 flex-col gap-3.5 p-6 @2xl:p-8 @4xl:px-10">
          <div className="flex items-center justify-between gap-4">
            <PixelDigits
              value={number}
              cell={4}
              className="text-link"
              label={`${number} / ${String(total).padStart(2, '0')}`}
            />
            <CategoryIcon icon={category.icon} index={index} />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <h3 id={titleId} className="stack-title text-card-title text-balance">
              {category.title}
            </h3>
            <p className="stack-excerpt line-clamp-2 measure text-muted">{category.excerpt}</p>
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

        {/* Photo: inline-end column (40%) from 42rem of card width, on top in the carousel. The card
            clips it (continuous corners); the layer inside drifts ±24px (Parallax) and scales on hover. */}
        <div
          className="relative order-first aspect-[16/10] overflow-hidden bg-surface-2 bg-cover bg-center @2xl:order-none @2xl:aspect-auto"
          // Low-res placeholder (400w) under the photo: the card never shows an empty frame.
          style={cover?.conversions?.thumb ? { backgroundImage: `url(${cover.conversions.thumb})` } : undefined}
        >
          <Parallax>
            <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]">
              {cover ? (
                <Image
                  src={imageSource(cover)}
                  alt={cover.alt}
                  fill
                  loading="eager"
                  fetchPriority={index === 0 ? 'auto' : 'low'}
                  sizes={coverSizes(cover, [
                    // Stack: 40% of the ≤ 1200px card, ≤ 520px tall (+ 48px parallax travel).
                    { media: '(min-width: 768px)', width: 480, unit: 'px', boxRatio: 480 / 568 },
                    // Carousel: 86% of the screen, 16:10 (+ 48px).
                    { media: null, width: 86, unit: 'vw', boxRatio: 1.3 },
                  ])}
                  className="object-cover"
                />
              ) : (
                <PixelComposition seed={index * 11 + 5} />
              )}
            </div>
          </Parallax>
        </div>

        {/* Shade: faded in by GSAP as the next card covers this one (colour per theme: --stack-shade). */}
        <span
          aria-hidden="true"
          data-stack-shade
          className="stack-shade pointer-events-none absolute inset-0 z-10 opacity-0"
        />
      </div>
    </article>
  );
}
