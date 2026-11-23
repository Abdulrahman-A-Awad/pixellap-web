import { ArrowDown, ArrowRight, Check, Layers } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { buttonClasses } from '@/components/ui/Button';
import { Parallax } from '@/components/ui/Parallax';
import { Link } from '@/i18n/navigation';
import type { ServiceCategoryDetail } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { coverSizes, imageSource } from '@/lib/images';
import { CategoryIcon } from '../CategoryIcon';
import { SectionLink } from '../overview/SectionLink';
import { ShowcaseVideo } from '../overview/ShowcaseVideo';

const rise = (i: number) => ({ '--rise-i': i }) as CSSProperties;

/**
 * Immersive category hero. Breadcrumb, then a large rounded media frame (the hero video while in view
 * when there is one, else the cover; Parallax; white pixel mark). The copy is rendered ONCE (one H1):
 * from lg it is positioned on the frame over a dark gradient from the reading start (white text in
 * both themes, `.category-hero-copy`); below lg it flows under the media in theme colours — never
 * overlapping. Copy: pixel number + icon chip, H1 (balanced; two lines in the copy width — no
 * line-clamp: its overflow clipping cut Arabic glyphs), excerpt, fact chips, "Start a
 * project" (→ /contact?service=) + "Explore the services" (→ #services). Staggered CSS rise
 * (`.hero-rise`, LCP-safe). The frame fits 1366×657 under the navbar.
 */
export function CategoryHero({
  category,
  index,
  breadcrumb,
  facts,
  labels,
}: {
  category: ServiceCategoryDetail;
  index: number;
  breadcrumb: ReactNode;
  facts: string[];
  labels: { start: string; explore: string };
}) {
  const number = String(index + 1).padStart(2, '0');
  const cover = category.cover;

  return (
    <section
      id="category-hero"
      className="relative pt-[calc(var(--header-h)+20px)] pb-[clamp(40px,5vw,72px)] md:pt-[calc(var(--header-h)+28px)]"
    >
      <div className="container-page flex flex-col gap-5">
        <div className="hero-rise" style={rise(0)}>
          {breadcrumb}
        </div>

        <div className="relative">
          <div className="category-hero-frame relative overflow-clip rounded-[28px] border border-border bg-surface-2">
            <Parallax>
              <div className="absolute inset-0">
                {cover ? (
                  <Image
                    src={imageSource(cover)}
                    alt={cover.alt}
                    fill
                    sizes={coverSizes(cover, [
                      // Full container width; laptop frame ~1232×480 (+48px parallax); phones 4:3.
                      { media: '(min-width: 1280px)', width: 1232, unit: 'px', boxRatio: 1232 / 528 },
                      { media: '(min-width: 1024px)', width: 94, unit: 'vw', boxRatio: 2.2 },
                      { media: null, width: 92, unit: 'vw', boxRatio: 1.15 },
                    ])}
                    loading="eager"
                    fetchPriority="high"
                    className="object-cover"
                  />
                ) : (
                  <PixelComposition seed={index * 19 + 7} cols={12} rows={6} />
                )}
                {category.hero_video && (
                  <ShowcaseVideo video={category.hero_video} poster={cover?.conversions?.lg ?? cover?.url ?? null} />
                )}
              </div>
            </Parallax>
            <div aria-hidden="true" className="category-hero-shade absolute inset-0 hidden lg:block" />
            <Image
              src="/brand/pixellap-mark-white.svg"
              alt=""
              aria-hidden="true"
              width={246}
              height={284}
              unoptimized
              className="absolute end-6 bottom-6 h-10 w-auto opacity-80 md:h-12"
            />
          </div>

          <div className="category-hero-copy flex flex-col items-start gap-5 pt-8 lg:absolute lg:inset-y-0 lg:start-0 lg:max-w-[40rem] lg:justify-center lg:p-10 xl:p-14">
            <div className="hero-rise flex items-center gap-3" style={rise(1)}>
              <PixelDigits value={number} cell={5} className="category-hero-number" label={number} />
              <CategoryIcon icon={category.icon} index={index} size="md" className="category-hero-chip" />
            </div>
            <h1 className="hero-rise text-page-title text-balance" style={rise(2)}>
              {category.title}
            </h1>
            <p className="category-hero-muted hero-rise measure text-lead text-pretty" style={rise(3)}>
              {category.excerpt}
            </p>
            <ul className="hero-rise flex flex-wrap gap-2" style={rise(4)}>
              {facts.map((fact, i) => (
                <li
                  key={fact}
                  className="category-hero-fact inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-meta font-bold"
                >
                  {i === 0 ? (
                    <Layers aria-hidden="true" className="size-3.5" />
                  ) : (
                    <Check aria-hidden="true" className="size-3.5" />
                  )}
                  {fact}
                </li>
              ))}
            </ul>
            <div className="hero-rise mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={rise(5)}>
              <Link
                href={{ pathname: '/contact', query: { service: category.slug } }}
                className={buttonClasses('primary', 'w-full px-6 sm:w-auto')}
              >
                {labels.start}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </Link>
              <SectionLink
                id="services"
                className={cn(buttonClasses('outline', 'w-full sm:w-auto'), 'category-hero-ghost')}
              >
                {labels.explore}
                <ArrowDown aria-hidden="true" className="size-4" />
              </SectionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
