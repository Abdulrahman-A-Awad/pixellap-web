import Image from 'next/image';
import type { ReactNode } from 'react';
import { PixelField } from '@/components/brand/PixelField';
import type { MediaAsset } from '@/lib/api/types';

/**
 * Inner-page header: title + subtitle (+ optional hero image). Server-rendered and never
 * hidden behind JS or animations — it is above the fold on every page.
 */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  image,
  seed = 11,
}: {
  title: string;
  subtitle?: string | null;
  eyebrow?: ReactNode;
  image?: MediaAsset | null;
  seed?: number;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
      <PixelField seed={seed} />
      <div className="container-page flex flex-col gap-5">
        {eyebrow && <p className="text-sm font-bold text-link">{eyebrow}</p>}
        <h1 className="max-w-4xl text-display text-balance">{title}</h1>
        {subtitle && <p className="max-w-2xl text-lg text-pretty text-muted md:text-xl">{subtitle}</p>}
        {image && (
          <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-card border border-border bg-surface">
            <Image
              src={image.conversions?.lg ?? image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
