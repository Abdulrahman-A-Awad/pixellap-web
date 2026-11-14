import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { buttonClasses } from '@/components/ui/Button';
import { CtaLink } from '@/components/ui/CtaLink';
import type { ServicesSection as ServicesData } from '@/lib/api/types';
import type { Translate } from '@/lib/site/translate';
import { ServiceCard } from './ServiceCard';
import { StackingCards } from './StackingCards';

export function ServicesSection({ section, t }: { section: ServicesData; t: Translate }) {
  if (section.categories.length === 0) return null;

  return (
    <section id="services" aria-labelledby="services-title" className="relative py-20 md:py-28">
      <div className="container-page flex flex-col gap-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            id="services-title"
          />
          {section.cta && (
            <CtaLink cta={section.cta} className={buttonClasses('outline', 'shrink-0')}>
              {section.cta.label}
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </CtaLink>
          )}
        </div>

        <StackingCards>
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
