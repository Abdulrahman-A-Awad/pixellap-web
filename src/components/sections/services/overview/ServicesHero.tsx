import { ArrowDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { Reveal } from '@/components/motion/Reveal';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { Eyebrow } from '@/components/sections/SectionHeading';
import type { ServiceCategoryWithServices } from '@/lib/api/types';
import { SectionLink } from './SectionLink';
import { ServiceSearch, type SearchGroup } from './ServiceSearch';

/**
 * Services hero: centred eyebrow, page title, subtitle and a stat line ("6 disciplines | 43 services",
 * counted from the API, localized plurals; the separator is a brand pixel — the font has no "·"), the
 * instant service search, then 6 compact glass discipline tiles (icon, number, name, service count)
 * that smooth-scroll to their showcase. Copy rises in with CSS (`.hero-rise`, LCP-safe); tiles reveal
 * staggered and lift on hover.
 */
export function ServicesHero({
  eyebrow,
  title,
  subtitle,
  disciplinesLabel,
  servicesLabel,
  categories,
  countLabel,
  search,
}: {
  eyebrow: string;
  title: string;
  subtitle: string | null;
  disciplinesLabel: string;
  servicesLabel: string;
  categories: ServiceCategoryWithServices[];
  countLabel: (n: number) => string;
  search: {
    label: string;
    placeholder: string;
    hint: string;
    emptyText: string;
    resultsText: string;
    clearLabel: string;
  };
}) {
  const groups: SearchGroup[] = categories.map((c, index) => ({
    slug: c.slug,
    title: c.title,
    icon: c.icon,
    index,
    services: c.services,
  }));

  return (
    <section className="relative isolate pt-[calc(var(--header-h)+56px)] pb-10 md:pt-[calc(var(--header-h)+80px)] md:pb-14">
      <div aria-hidden="true" className="page-glow" />
      <div className="container-page flex flex-col items-center gap-10 md:gap-12">
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
          <p
            className="hero-rise mt-1 inline-flex items-center gap-3 text-meta font-bold text-link"
            style={{ '--rise-i': 3 } as CSSProperties}
          >
            <span>{disciplinesLabel}</span>
            <span aria-hidden="true" className="size-1.5 rounded-[1.5px] bg-primary" />
            <span>{servicesLabel}</span>
          </p>
        </div>

        <div className="hero-rise relative z-20 flex w-full justify-center" style={{ '--rise-i': 4 } as CSSProperties}>
          <ServiceSearch groups={groups} {...search} />
        </div>

        <ul className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {categories.map((category, i) => (
            <Reveal key={category.slug} as="li" index={i} className="min-w-0">
              <SectionLink
                id={category.slug}
                className="discipline-tile glass-card lift group flex h-full flex-col gap-3 p-4 md:p-5"
              >
                <span className="flex items-center justify-between gap-2">
                  <CategoryIcon icon={category.icon} index={i} size="sm" />
                  <PixelDigits value={String(i + 1).padStart(2, '0')} cell={3} className="text-muted" />
                </span>
                <span className="font-bold text-pretty text-text">{category.title}</span>
                <span className="mt-auto flex items-center justify-between gap-2 text-meta text-muted">
                  {countLabel(category.services.length)}
                  <ArrowDown
                    aria-hidden="true"
                    className="size-4 text-link transition-transform group-hover:translate-y-0.5"
                  />
                </span>
              </SectionLink>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
