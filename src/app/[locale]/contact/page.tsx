import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactFaq } from '@/components/contact/ContactFaq';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactFormSkeleton } from '@/components/contact/ContactFormSkeleton';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactInfoCard } from '@/components/contact/ContactInfoCard';
import { NextSteps } from '@/components/contact/NextSteps';
import { QuickContact } from '@/components/contact/QuickContact';
import { JsonLd } from '@/components/seo/JsonLd';
import { resolveLocale } from '@/i18n/locale';
import { getCategories, getHome, getPage, getSite } from '@/lib/api/endpoints';
import type { Faq } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';
import { alternateSiteName, contactPageJsonLd } from '@/lib/seo/structured-data';
import { interpolate } from '@/lib/site/format';
import { whatsappDigits } from '@/lib/site/settings';
import { createTranslator } from '@/lib/site/translate';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: page } = await getPage('contact', locale);
  return buildMetadata({
    locale,
    path: '/contact',
    title: page.seo.title,
    description: page.seo.description,
  });
}

/**
 * /contact (Apple-style): centred hero over a brand glow → three glass quick-contact cards
 * overlapping it → form (7/12, glass card) + info card (5/12, sticky on desktop) → "What happens
 * next" (process line, plays on enter) → the first 3 home FAQs. ContactPage + Organization JSON-LD.
 */
export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const locale = await resolveLocale(params);
  const [{ data: page }, { data: site }, { data: categories }, { data: home }] = await Promise.all([
    getPage('contact', locale),
    getSite(locale),
    getCategories(locale),
    getHome(locale),
  ]);
  const t = createTranslator(site.ui_strings);
  const faqs: Faq[] = home.find((s) => s.key === 'faq')?.faqs ?? [];
  const digits = whatsappDigits(site.settings);
  const whatsappHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(interpolate(t('whatsapp.prefill'), { page: page.title }))}`
    : null;

  return (
    <>
      <ContactHero eyebrow={t('nav.contact')} title={page.title} subtitle={page.subtitle} />
      <QuickContact settings={site.settings} pageTitle={page.title} t={t} />

      <section aria-labelledby="contact-form-title" className="pt-12 md:pt-16">
        <div className="container-page grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="surface-card p-6 md:p-8 lg:col-span-7">
            <h2 id="contact-form-title" className="mb-6 text-title">
              {t('contact.form_title')}
            </h2>
            {/* useSearchParams (?service=) is request-time data → its own Suspense boundary. */}
            <Suspense fallback={<ContactFormSkeleton />}>
              <ContactForm categories={categories} whatsappHref={whatsappHref} />
            </Suspense>
          </div>
          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:col-span-5">
            <ContactInfoCard settings={site.settings} t={t} />
          </div>
        </div>
      </section>

      <NextSteps t={t} />
      <ContactFaq faqs={faqs} t={t} />

      <JsonLd
        data={contactPageJsonLd(
          site,
          locale,
          { title: page.title, description: page.seo.description },
          await alternateSiteName(locale),
        )}
      />
    </>
  );
}
