import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { FaqList } from '@/components/sections/home/FaqList';
import { Link } from '@/i18n/navigation';
import type { Faq } from '@/lib/api/types';
import type { Translate } from '@/lib/site/translate';

/** The first 3 home FAQs (same accordion as the home page) + "More questions" → /#faq. Hidden without FAQs. */
export function ContactFaq({ faqs, t }: { faqs: Faq[]; t: Translate }) {
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="contact-faq-title" className="section-y pt-0">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading
          title={t('contact.faq_title')}
          id="contact-faq-title"
          action={
            <Link
              href="/#faq"
              className="group inline-flex min-h-11 items-center gap-2 font-bold text-link underline-offset-4 hover:underline"
            >
              {t('contact.faq_more')}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
              />
            </Link>
          }
        />
        <FaqList faqs={faqs.slice(0, 3)} />
      </div>
    </section>
  );
}
