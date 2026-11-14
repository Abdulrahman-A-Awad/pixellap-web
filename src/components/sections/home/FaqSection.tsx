import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { JsonLd } from '@/components/seo/JsonLd';
import type { Faq } from '@/lib/api/types';

/**
 * FAQ as native <details name="faq-{scope}"> — an exclusive accordion with zero JS (browsers
 * without `name` support simply allow several open). Smooth height via ::details-content +
 * interpolate-size where supported (globals.css), instant elsewhere. Emits FAQPage JSON-LD.
 * Answers are HTML from the admin rich editor.
 */
export function FaqSection({
  faqs,
  scope,
  eyebrow,
  title,
  subtitle,
  id = 'faq',
}: {
  faqs: Faq[];
  /** Groups the items into one exclusive accordion (e.g. "home", a category slug). */
  scope: string;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  id?: string;
}) {
  if (faqs.length === 0) return null;
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className="py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          id={headingId}
          className="lg:sticky lg:top-28 lg:self-start"
        />
        <div data-reveal className="divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <details key={faq.id} name={`faq-${scope}`} className="faq-item group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-start text-lg font-bold transition-colors hover:text-link [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-[8px] border border-border transition-[transform,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-primary group-open:bg-primary group-open:text-on-primary"
                >
                  <Plus className="size-4" />
                </span>
              </summary>
              <div
                className="prose-answer max-w-3xl pb-6 text-muted"
                // Trusted HTML from the CMS rich editor.
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </details>
          ))}
        </div>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      />
    </section>
  );
}
