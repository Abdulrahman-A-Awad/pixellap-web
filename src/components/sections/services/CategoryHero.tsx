import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { PixelField } from '@/components/brand/PixelField';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import type { ServiceCategoryDetail } from '@/lib/api/types';
import { CategoryIcon } from './CategoryIcon';
import { CategoryVideo } from './CategoryVideo';

/**
 * Category hero: breadcrumb, number, icon, title, excerpt, CTA (copy is server HTML — the LCP).
 * Visual on the inline-end side: hero video (desktop, after idle, poster = cover) over the cover
 * image, or a large brand pixel composition.
 */
export function CategoryHero({
  category,
  index,
  breadcrumb,
  ctaLabel,
}: {
  category: ServiceCategoryDetail;
  index: number;
  breadcrumb: ReactNode;
  ctaLabel: string;
}) {
  const number = String(index + 1).padStart(2, '0');
  const cover = category.cover?.conversions?.lg ?? category.cover?.url ?? null;

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20">
      <PixelField seed={index * 7 + 13} density={0.05} className="opacity-60" />
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          {breadcrumb}
          <div className="flex items-center gap-4">
            <PixelDigits value={number} cell={6} className="text-link" />
            <CategoryIcon icon={category.icon} index={index} size="lg" />
          </div>
          <h1 className="text-display text-balance">{category.title}</h1>
          <p className="max-w-xl text-lg text-pretty text-muted md:text-xl">{category.excerpt}</p>
          <Link
            href={{ pathname: '/contact', query: { service: category.slug } }}
            className={buttonClasses('primary', 'px-6')}
          >
            {ctaLabel}
            <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-border bg-surface lg:aspect-[5/6] xl:aspect-[4/4.2]">
          {cover ? (
            <Image
              src={cover}
              alt={category.cover?.alt ?? ''}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PixelComposition seed={index * 19 + 7} cols={8} rows={9} />
          )}
          {category.hero_video && <CategoryVideo video={category.hero_video} poster={cover} />}
        </div>
      </div>
    </section>
  );
}
