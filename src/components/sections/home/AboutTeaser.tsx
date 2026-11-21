import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { CtaLink } from '@/components/ui/CtaLink';
import type { AboutSection, HomeStat } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { StatCount } from './StatCount';

/**
 * Per-index divider classes for the stat grid: 2 columns on phones and lg+ (the stats sit in the
 * text column), 4 in a row on md (single-column layout, full width). Logical borders only.
 */
function statCell(i: number): string {
  return cn(
    'flex flex-col-reverse justify-end gap-2 py-6',
    // Column dividers + matching inner padding.
    i % 2 === 1 && 'border-s border-border ps-6',
    i === 2 && 'md:border-s md:ps-6 lg:border-s-0 lg:ps-0',
    // Row divider between the two rows (2-column layouts only).
    i < 2 && 'border-b border-border md:border-b-0 lg:border-b',
  );
}

/**
 * Home "About" (+ numbers): image with a subtle pixel-mark overlay | eyebrow, H2, text, link, and
 * the stats below the text (large thin numerals, muted labels, thin dividers, no boxes). The stats
 * come from the `stats` section and only show when that section is visible.
 */
export function AboutTeaser({ section, stats }: { section: AboutSection; stats: HomeStat[] }) {
  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div
          data-reveal
          className="relative aspect-[4/3] overflow-clip rounded-[24px] border border-border bg-surface-2 lg:aspect-[4/5]"
        >
          {section.image ? (
            <Image
              src={section.image.conversions?.lg ?? section.image.url}
              alt={section.image.alt}
              fill
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
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
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
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
                {section.title && <span className="sr-only">: {section.title}</span>}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                />
              </CtaLink>
            </div>
          )}

          {stats.length > 0 && (
            <dl className="grid w-full grid-cols-2 border-t border-border md:grid-cols-4 lg:grid-cols-2">
              {stats.slice(0, 4).map((stat, i) => (
                <div
                  key={`${stat.label}-${i}`}
                  data-reveal
                  style={{ '--reveal-i': i } as CSSProperties}
                  className={statCell(i)}
                >
                  {/* column-reverse keeps <dt> before <dd> in the DOM while the number shows first. */}
                  <dt className="text-meta text-muted">{stat.label}</dt>
                  <dd className="text-[3rem] leading-none">
                    {/* Numbers stay LTR inside RTL text. */}
                    <bdi dir="ltr" className="inline-flex items-baseline gap-0.5">
                      {stat.prefix && <span className="font-display-thin text-link">{stat.prefix}</span>}
                      <StatCount value={stat.value} />
                      {stat.suffix && <span className="font-display-thin text-link">{stat.suffix}</span>}
                    </bdi>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
