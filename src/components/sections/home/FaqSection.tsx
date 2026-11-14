import { SectionHeading } from '@/components/sections/SectionHeading';
import { JsonLd } from '@/components/seo/JsonLd';
import type { FaqSection as FaqData } from '@/lib/api/types';
import { FaqAccordion } from './FaqAccordion';

/** FAQ accordion + FAQPage structured data for the visible items. */
export function FaqSection({ section }: { section: FaqData }) {
  if (section.faqs.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-title" className="py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          id="faq-title"
          className="lg:sticky lg:top-28 lg:self-start"
        />
        <div data-reveal>
          <FaqAccordion items={section.faqs} />
        </div>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: section.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      />
    </section>
  );
}
