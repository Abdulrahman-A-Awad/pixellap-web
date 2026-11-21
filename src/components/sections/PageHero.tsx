import Image from 'next/image';
import type { ReactNode } from 'react';
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
}: {
  title: string;
  subtitle?: string | null;
  eyebrow?: ReactNode;
  image?: MediaAsset | null;
}) {
  return (
    <section className="relative pt-32 pb-14 md:pt-40 md:pb-16">
      <div className="container-page flex flex-col gap-4">
        {eyebrow && <p className="text-meta font-bold text-link">{eyebrow}</p>}
        <h1 className="max-w-4xl text-page-title text-balance">{title}</h1>
        {subtitle && <p className="mt-1 measure text-lead text-pretty text-muted">{subtitle}</p>}
        {image && (
          <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-card border border-border bg-surface">
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
