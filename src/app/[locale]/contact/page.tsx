import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactFormSkeleton } from '@/components/contact/ContactFormSkeleton';
import { ContactInfoCard } from '@/components/contact/ContactInfoCard';
import { PageHero } from '@/components/sections/PageHero';
import { resolveLocale } from '@/i18n/locale';
import { getCategories, getPage, getSite } from '@/lib/api/endpoints';
import { buildMetadata } from '@/lib/seo/metadata';
import { createTranslator } from '@/lib/site/translate';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: page } = await getPage('contact', locale);
  return buildMetadata({
    locale,
    path: '/contact',
    title: page.seo.title,
    description: page.seo.description,
    image: page.hero?.conversions?.lg ?? page.hero?.url,
  });
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const locale = await resolveLocale(params);
  const [{ data: page }, { data: site }, { data: categories }] = await Promise.all([
    getPage('contact', locale),
    getSite(locale),
    getCategories(locale),
  ]);
  const t = createTranslator(site.ui_strings);

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} seed={9} />

      <section className="container-page grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        <div className="rounded-card border border-border bg-surface p-6 md:p-8">
          <h2 className="mb-6 text-xl font-bold">{t('contact.form_title')}</h2>
          {/* useSearchParams (?service=) is request-time data → its own Suspense boundary. */}
          <Suspense fallback={<ContactFormSkeleton />}>
            <ContactForm categories={categories} />
          </Suspense>
        </div>
        <ContactInfoCard settings={site.settings} t={t} />
      </section>
    </>
  );
}
