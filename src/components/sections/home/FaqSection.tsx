import { ArrowRight, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { JsonLd } from '@/components/seo/JsonLd';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import type { Faq } from '@/lib/api/types';
import { FaqList } from './FaqList';

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
 * The questions are an exclusive accordion (FaqList: smooth height in every browser, open card
 * highlighted). Emits FAQPage JSON-LD. Answers are HTML from the admin rich editor.
 */
export function FaqSection({
  faqs,
  eyebrow,
  title,
  subtitle,
  help,
  id = 'faq',
}: {
  faqs: Faq[];
  /** Accordion group name (e.g. "home", a category slug); kept for callers, each list is exclusive. */
  scope?: string;
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
            <Reveal index={3} className="surface-card flex flex-col items-start gap-3 p-6">
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
            </Reveal>
          )}
        </div>

        <div className="lg:col-span-7">
          <FaqList faqs={faqs} />
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
