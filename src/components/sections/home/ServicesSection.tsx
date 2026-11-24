import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Link } from '@/i18n/navigation';
import type { ServicesSection as ServicesData } from '@/lib/api/types';
import type { Translate } from '@/lib/site/translate';
import { ServiceCard } from './ServiceCard';
import { StackingCards } from './StackingCards';

export function ServicesSection({ section, t }: { section: ServicesData; t: Translate }) {
  if (section.categories.length === 0) return null;
  // CMS link next to the heading (admin: Home Page → Our services); defaults when left empty.
  const allHref = section.cta?.url?.startsWith('/') ? section.cta.url : '/services';
  const allLabel = section.cta?.label || t('actions.view_all_services');

  return (
    <section id="services" aria-labelledby="services-title" className="relative section-y">
      <div className="container-page flex flex-col gap-12">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          id="services-title"
          action={
            <Link
              href={allHref}
              className="group inline-flex min-h-11 items-center gap-2 font-bold text-link underline-offset-4 hover:underline"
            >
              {allLabel}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
              />
            </Link>
          }
        />

        <StackingCards
          label={section.title ?? allLabel}
          labels={{ previous: t('misc.previous'), next: t('misc.next') }}
        >
          {section.categories.map((category, i) => (
            <ServiceCard
              key={category.slug}
              category={category}
              index={i}
              total={section.categories.length}
              learnMore={t('actions.learn_more')}
            />
          ))}
        </StackingCards>
      </div>
    </section>
  );
}
