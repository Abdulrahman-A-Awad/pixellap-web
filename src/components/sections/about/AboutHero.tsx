import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { Eyebrow } from '@/components/sections/SectionHeading';
import { ScrollFrame } from '@/components/ui/ScrollFrame';
import type { MediaAsset } from '@/lib/api/types';
import { coverSizes, imageSource } from '@/lib/images';

/**
 * About hero: centred eyebrow, page title and subtitle over the soft brand glow (same language as the
 * contact hero; CSS `.hero-rise` stagger, LCP-safe), then the page hero image as a wide rounded frame
 * (28px) that scales down slightly with a parallax drift as you scroll (`ui/ScrollFrame`), with the
 * white pixel mark in the bottom inline-end corner on a soft local shade. No image → pixel composition.
 */
export function AboutHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  image: MediaAsset | null;
}) {
  return (
    <section className="relative isolate overflow-clip pt-[calc(var(--header-h)+56px)] pb-[clamp(40px,5vw,72px)] md:pt-[calc(var(--header-h)+80px)]">
      <div aria-hidden="true" className="page-glow" />
      <div className="container-page flex flex-col items-center gap-10 md:gap-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="hero-rise" style={{ '--rise-i': 0 } as CSSProperties}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1 className="hero-rise max-w-4xl text-page-title text-balance" style={{ '--rise-i': 1 } as CSSProperties}>
            {title}
          </h1>
          {subtitle && (
            <p
              className="hero-rise mt-1 measure text-lead text-pretty text-muted"
              style={{ '--rise-i': 2 } as CSSProperties}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="hero-rise w-full" style={{ '--rise-i': 3 } as CSSProperties}>
          <ScrollFrame className="relative aspect-[4/3] w-full overflow-clip rounded-[28px] border border-border bg-surface-2 md:aspect-[16/9] lg:aspect-[21/9]">
            <div className="scroll-frame-layer">
              {image ? (
                <Image
                  src={imageSource(image)}
                  alt={image.alt}
                  fill
                  sizes={coverSizes(image, [
                    // Full container width; box ratios include the layer's extra 48px.
                    { media: '(min-width: 1280px)', width: 1232, unit: 'px', boxRatio: 2.1 },
                    { media: '(min-width: 1024px)', width: 94, unit: 'vw', boxRatio: 2.05 },
                    { media: '(min-width: 768px)', width: 94, unit: 'vw', boxRatio: 1.6 },
                    { media: null, width: 92, unit: 'vw', boxRatio: 1.15 },
                  ])}
                  loading="eager"
                  fetchPriority="high"
                  className="object-cover"
                />
              ) : (
                <PixelComposition seed={41} cols={12} rows={5} />
              )}
            </div>
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
              className="absolute end-5 bottom-5 h-10 w-auto opacity-85 md:end-8 md:bottom-8 md:h-14"
            />
          </ScrollFrame>
        </div>
      </div>
    </section>
  );
}
