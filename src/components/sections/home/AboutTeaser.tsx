import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelIcon, type PixelIconName } from '@/components/brand/PixelIcon';
import { Eyebrow, SectionHeading } from '@/components/sections/SectionHeading';
import { CtaLink } from '@/components/ui/CtaLink';
import type { AboutSection, StatsSection } from '@/lib/api/types';
import { coverSizes, imageSource } from '@/lib/images';
import { withSiteName } from '@/lib/site/brand';
import { StatCount } from './StatCount';

/** Decorative icon per stat tile (growth, people, time, quality), cycled. */
const STAT_ICONS: PixelIconName[] = ['chart', 'people', 'clock', 'star'];

/**
 * Home "About" (+ numbers): rounded image with the pixel-mark overlay | eyebrow, H2, text, link.
 * Below both columns, a full-width strip of up to 4 stat tiles (pixel icon, large bold numeral with a
 * lavender → iris fill, accent suffix, label) that reveal with the count-up — 2×2 on phones.
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
          <div
            data-reveal
            className="relative aspect-[4/3] overflow-clip rounded-[24px] border border-border bg-surface-2 lg:aspect-[5/4]"
          >
            {image ? (
              <Image
                src={imageSource(image)}
                alt={image.alt}
                fill
                sizes={coverSizes(image, [
                  // Half of the 1280px container (minus the gap); 5:4 box.
                  { media: '(min-width: 1280px)', width: 560, unit: 'px', boxRatio: 5 / 4 },
                  { media: '(min-width: 1024px)', width: 44, unit: 'vw', boxRatio: 5 / 4 },
                  { media: null, width: 100, unit: 'vw', boxRatio: 4 / 3 },
                ])}
                className="object-cover"
              />
            ) : (
              <PixelComposition seed={57} cols={7} rows={6} />
            )}
            {/* Subtle brand mark in the bottom inline-end corner, on a soft local shade only. */}
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
              className="absolute end-6 bottom-6 h-14 w-auto opacity-85"
            />
          </div>

          <div className="flex flex-col items-start gap-8">
            <SectionHeading
              eyebrow={withSiteName(section.eyebrow, siteName)}
              title={title}
              subtitle={withSiteName(section.subtitle, siteName)}
              id="about-title"
            />

            {section.cta && (
              <div data-reveal>
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
              </div>
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
            <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {items.map((stat, i) => (
                <div
                  key={`${stat.label}-${i}`}
                  data-reveal
                  style={{ '--reveal-i': i } as CSSProperties}
                  className="stat-tile flex flex-col-reverse justify-end gap-3 rounded-[20px] border border-border bg-card p-5 sm:p-6 lg:p-7"
                >
                  {/* column-reverse keeps <dt> before <dd> in the DOM while the icon + number show first. */}
                  <dt className="text-meta text-muted sm:text-base">{stat.label}</dt>
                  <dd className="flex flex-col gap-4">
                    <PixelIcon name={STAT_ICONS[i % STAT_ICONS.length]} cell={4} className="text-link" />
                    {/* Numbers stay LTR inside RTL text. */}
                    <bdi
                      dir="ltr"
                      className="stat-number inline-flex items-baseline gap-0.5 text-[clamp(2.25rem,4.4vw,3.5rem)] leading-none font-bold"
                    >
                      {stat.prefix && <span className="stat-affix">{stat.prefix}</span>}
                      <StatCount value={stat.value} className="font-bold" />
                      {stat.suffix && <span className="stat-affix">{stat.suffix}</span>}
                    </bdi>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
