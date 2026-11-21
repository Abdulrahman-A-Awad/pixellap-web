import { ArrowRight, MessageCircle, Plus } from 'lucide-react';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { JsonLd } from '@/components/seo/JsonLd';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import type { Faq } from '@/lib/api/types';

export interface FaqHelp {
  title: string;
  text: string;
  contactLabel: string;
  contactHref?: string;
  whatsappUrl?: string | null;
  whatsappLabel: string;
}

/**
 * FAQ: two columns (5/7). Start: sticky intro (eyebrow, H2, text) + a "Didn't find your answer?"
 * card linking to /contact (and WhatsApp when set). End: the questions as cards.
 *
 * Native <details name="faq-{scope}"> — an exclusive accordion with zero JS (browsers without
 * `name` support simply allow several open). Smooth height via ::details-content + interpolate-size
 * where supported (globals.css), instant elsewhere. Emits FAQPage JSON-LD. Answers are HTML from
 * the admin rich editor.
 */
export function FaqSection({
  faqs,
  scope,
  eyebrow,
  title,
  subtitle,
  help,
  id = 'faq',
}: {
  faqs: Faq[];
  /** Groups the items into one exclusive accordion (e.g. "home", a category slug). */
  scope: string;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  help?: FaqHelp;
  id?: string;
}) {
  if (faqs.length === 0) return null;
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className="section-y">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} id={headingId} />

          {help && (
            <div
              data-reveal
              className="flex flex-col items-start gap-3 rounded-[20px] border border-border bg-card p-6"
            >
              <p className="text-title">{help.title}</p>
              <p className="text-muted">{help.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href={help.contactHref ?? '/contact'} className={buttonClasses('primary')}>
                  {help.contactLabel}
                  <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                </Link>
                {help.whatsappUrl && (
                  <a
                    href={help.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses('outline')}
                  >
                    <MessageCircle aria-hidden="true" className="size-4" />
                    {help.whatsappLabel}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:col-span-7">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              name={`faq-${scope}`}
              data-reveal
              className="faq-item group rounded-[20px] border border-border bg-card transition-colors duration-300 open:border-lavender/50 hover:border-lavender/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-start text-lg font-bold md:px-7 md:py-6 [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill border border-border transition-[transform,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-primary group-open:bg-primary group-open:text-on-primary"
                >
                  <Plus className="size-4" />
                </span>
              </summary>
              <div
                className="prose-answer measure px-6 pb-6 text-muted md:px-7 md:pb-7"
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
