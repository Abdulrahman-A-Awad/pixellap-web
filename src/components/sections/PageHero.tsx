import type { ReactNode } from 'react';
import { PixelField } from '@/components/brand/PixelField';

/** Simple page header used by inner pages (title + optional subtitle). */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  seed = 11,
}: {
  title: string;
  subtitle?: string | null;
  eyebrow?: ReactNode;
  seed?: number;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
      <PixelField seed={seed} />
      <div className="container-page flex flex-col gap-5">
        {eyebrow && <p className="text-sm font-medium text-link">{eyebrow}</p>}
        <h1 className="max-w-4xl text-display">{title}</h1>
        {subtitle && <p className="max-w-2xl text-lg text-muted md:text-xl">{subtitle}</p>}
      </div>
    </section>
  );
}
