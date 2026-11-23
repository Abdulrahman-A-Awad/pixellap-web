import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { Eyebrow, SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { CtaLink } from '@/components/ui/CtaLink';
import { Parallax } from '@/components/ui/Parallax';
import type { AboutSection, StatsSection } from '@/lib/api/types';
import { coverSizes, imageSource } from '@/lib/images';
import { withSiteName } from '@/lib/site/brand';
import { StatTiles } from './StatTiles';

/**
 * Home "About" (+ numbers): rounded image with the pixel-mark overlay | eyebrow, H2, text, link.
 * Below both columns, a full-width strip of up to 4 equal-height stat tiles — 2×2 on phones. Each tile
 * is one start-aligned group: icon chip + label on the top row, the large numeral (lavender → iris,
 * accent suffix attached after it, always LTR) directly below. The tiles of a row share subgrid
 * rows, so labels of different lengths never push the numbers out of line.
 * The stats come from the `stats` section (only when it is visible); its eyebrow / title / subtitle
 * render as a small heading above the strip.
 */
export function AboutTeaser({
  section,
  stats,
  siteName,
}: {
  section: AboutSection;
  stats: StatsSection | undefined;
  siteName: string;
}) {
  const image = section.image;
  const title = withSiteName(section.title, siteName);
  const items = stats?.items.slice(0, 4) ?? [];
  const statsHeading = stats && (stats.eyebrow || stats.title || stats.subtitle);

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-page flex flex-col gap-12 lg:gap-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal
            variant="scale-in"
            className="group relative aspect-[4/3] overflow-clip rounded-[28px] border border-border bg-surface-2 lg:aspect-[5/4]"
          >
            <Parallax>
              <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]">
                {image ? (
                  <Image
                    src={imageSource(image)}
                    alt={image.alt}
                    fill
                    sizes={coverSizes(image, [
                      // Half of the 1280px container (minus the gap); 5:4 box.
                      // 5:4 / 4:3 frame + 48px of parallax travel.
                      { media: '(min-width: 1280px)', width: 560, unit: 'px', boxRatio: 560 / 496 },
                      { media: '(min-width: 1024px)', width: 44, unit: 'vw', boxRatio: 1.12 },
                      { media: null, width: 100, unit: 'vw', boxRatio: 1.15 },
                    ])}
                    className="object-cover"
                  />
                ) : (
                  <PixelComposition seed={57} cols={7} rows={6} />
                )}
              </div>
            </Parallax>
            {/* Subtle brand mark in the bottom inline-end corner, on a soft local shade only. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/55 to-transparent"
            />
            <Reveal variant="slide-end" index={3} className="absolute end-6 bottom-6">
              <Image
                src="/brand/pixellap-mark-white.svg"
                alt=""
                aria-hidden="true"
                width={246}
                height={284}
                unoptimized
                className="h-14 w-auto opacity-85"
              />
            </Reveal>
          </Reveal>

          <div className="flex flex-col items-start gap-8">
            <SectionHeading
              eyebrow={withSiteName(section.eyebrow, siteName)}
              title={title}
              subtitle={withSiteName(section.subtitle, siteName)}
              id="about-title"
            />

            {section.cta && (
              <Reveal index={3}>
                <CtaLink
                  cta={section.cta}
                  className="group inline-flex min-h-11 items-center gap-2 font-bold text-link underline-offset-4 hover:underline"
                >
                  {section.cta.label}
                  {/* Descriptive link text for assistive tech / SEO ("Learn more: About…"). */}
                  {title && <span className="sr-only">: {title}</span>}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                  />
                </CtaLink>
              </Reveal>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-6">
            {statsHeading && (
              <div className="flex flex-col gap-2">
                {stats.eyebrow && <Eyebrow>{withSiteName(stats.eyebrow, siteName)}</Eyebrow>}
                {stats.title && <h3 className="text-title text-balance">{withSiteName(stats.title, siteName)}</h3>}
                {stats.subtitle && <p className="measure text-muted">{withSiteName(stats.subtitle, siteName)}</p>}
              </div>
            )}
            <StatTiles items={items} />
          </div>
        )}
      </div>
    </section>
  );
}
