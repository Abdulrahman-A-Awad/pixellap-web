import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { Reveal } from '@/components/motion/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { Parallax } from '@/components/ui/Parallax';
import { Link } from '@/i18n/navigation';
import type { ServiceCategoryWithServices } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { coverSizes, imageSource } from '@/lib/images';
import { interpolate } from '@/lib/site/format';
import { ServiceRows } from './ServiceRows';
import { ShowcaseVideo } from './ShowcaseVideo';

/**
 * One discipline, Apple-style. Desktop (lg): two columns — the MEDIA column is sticky under both bars
 * (`.showcase-media`: height = viewport − navbar − discipline nav − gaps, capped, so it is never clipped
 * on 1366×657) while the content column scrolls: pixel number, title, rich description, every service
 * as an expandable row, then "Explore {category}" + "Start a project" (→ /contact?service=). Sections
 * alternate the media side (logical order, so RTL mirrors). The frame scales in as it enters (Reveal
 * scale-in), the image drifts (Parallax), the white pixel mark sits in a corner; a hero video plays
 * over the cover while in view. Phones/tablets: media on top (not sticky), rows below.
 */
export function DisciplineShowcase({
  category,
  index,
  flip,
  eager,
  labels,
}: {
  category: ServiceCategoryWithServices;
  index: number;
  flip: boolean;
  /** First showcase: its media loads eagerly. */
  eager: boolean;
  labels: { explore: string; start: string; details: string };
}) {
  const number = String(index + 1).padStart(2, '0');
  const cover = category.cover;
  const titleId = `${category.slug}-title`;

  return (
    <section id={category.slug} tabIndex={-1} aria-labelledby={titleId} className="showcase section-y outline-none">
      <div className="container-page grid items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className={cn('showcase-media-col', flip && 'lg:order-last')}>
          <Reveal
            variant="scale-in"
            className="showcase-media group relative overflow-clip rounded-[28px] border border-border bg-surface-2"
          >
            <Parallax>
              <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]">
                {cover ? (
                  <Image
                    src={imageSource(cover)}
                    alt={cover.alt}
                    fill
                    sizes={coverSizes(cover, [
                      // Half the 1280px container (minus the gap); frame ~ 4:5 on laptops (+48px parallax).
                      { media: '(min-width: 1280px)', width: 560, unit: 'px', boxRatio: 0.78 },
                      { media: '(min-width: 1024px)', width: 46, unit: 'vw', boxRatio: 0.85 },
                      { media: null, width: 92, unit: 'vw', boxRatio: 1.2 },
                    ])}
                    loading={eager ? 'eager' : 'lazy'}
                    fetchPriority={eager ? 'high' : undefined}
                    className="object-cover"
                  />
                ) : (
                  <PixelComposition seed={index * 11 + 5} cols={6} rows={7} />
                )}
                {category.hero_video && (
                  <ShowcaseVideo video={category.hero_video} poster={cover?.conversions?.lg ?? cover?.url ?? null} />
                )}
              </div>
            </Parallax>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/55 to-transparent"
            />
            <Image
              src="/brand/pixellap-mark-white.svg"
              alt=""
              aria-hidden="true"
              width={246}
              height={284}
              unoptimized
              className="absolute end-6 bottom-6 h-12 w-auto opacity-85"
            />
          </Reveal>
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:py-6">
          <Reveal className="flex flex-col gap-5">
            <PixelDigits value={number} cell={5} className="text-link" label={number} />
            <h2 id={titleId} className="text-heading text-balance">
              {category.title}
            </h2>
            {category.description ? (
              <div
                className="prose-rich measure text-lead text-pretty text-muted"
                // Trusted HTML from the CMS rich editor.
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            ) : (
              <p className="measure text-lead text-muted">{category.excerpt}</p>
            )}
          </Reveal>

          {category.services.length > 0 && (
            <Reveal index={1} className="border-t border-border">
              <ServiceRows categorySlug={category.slug} services={category.services} detailsLabel={labels.details} />
            </Reveal>
          )}

          <Reveal index={2} className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Link href={`/services/${category.slug}`} className={buttonClasses('primary', 'w-full sm:w-auto')}>
              {interpolate(labels.explore, { category: category.title })}
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </Link>
            <Link href={`/contact?service=${category.slug}`} className={buttonClasses('outline', 'w-full sm:w-auto')}>
              {labels.start}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
