import { ArrowRight } from 'lucide-react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Link } from '@/i18n/navigation';
import type { ServiceCategory } from '@/lib/api/types';
import { CategoryIcon } from '../CategoryIcon';

/**
 * The other disciplines as compact glass tiles (icon, number, name, service count, arrow) — no photos.
 * 5 across from xl, 3 + 2 (centred) from md, a horizontal snap row on phones.
 */
export function OtherCategories({
  title,
  categories,
  all,
  countLabel,
}: {
  title: string;
  /** The categories to show (all but the current one). */
  categories: ServiceCategory[];
  /** Every category, for the numbers. */
  all: ServiceCategory[];
  countLabel: (n: number) => string;
}) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="other-services-title" className="section-y">
      <div className="container-page flex flex-col gap-8 lg:gap-10">
        <SectionHeading title={title} id="other-services-title" />
        <ul className="other-cats -mx-(--gutter) flex snap-x snap-mandatory gap-3 overflow-x-auto px-(--gutter) pb-2 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-5">
          {categories.map((category, i) => {
            const index = all.findIndex((c) => c.slug === category.slug);
            return (
              <Reveal
                key={category.slug}
                as="li"
                index={i}
                className="w-[70%] shrink-0 snap-start sm:w-[42%] md:col-span-2 md:w-auto xl:col-span-1"
              >
                <Link
                  href={`/services/${category.slug}`}
                  className="glass-card lift group flex h-full flex-col gap-4 p-5 transition-colors hover:border-lavender/50"
                >
                  <span className="flex items-center justify-between gap-3">
                    <CategoryIcon icon={category.icon} index={index} size="sm" />
                    <PixelDigits value={String(index + 1).padStart(2, '0')} cell={3} className="text-muted" />
                  </span>
                  <span className="font-bold text-pretty text-text">{category.title}</span>
                  <span className="mt-auto flex items-center justify-between gap-2 text-meta text-muted">
                    {countLabel(category.services_count)}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 text-link transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
