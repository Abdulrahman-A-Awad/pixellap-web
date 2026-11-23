import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import { FaqSection } from '@/components/sections/home/FaqSection';
import { ProcessSection } from '@/components/sections/home/ProcessSection';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { CategoryHero } from '@/components/sections/services/category/CategoryHero';
import { CategoryOverview } from '@/components/sections/services/category/CategoryOverview';
import { HashPulse } from '@/components/sections/services/category/HashPulse';
import { MobileCtaBar } from '@/components/sections/services/category/MobileCtaBar';
import { OtherCategories } from '@/components/sections/services/category/OtherCategories';
import { ServiceGrid } from '@/components/sections/services/category/ServiceGrid';
import { DisciplineNav } from '@/components/sections/services/overview/DisciplineNav';
import { JsonLd } from '@/components/seo/JsonLd';
import { resolveLocale } from '@/i18n/locale';
import { routing } from '@/i18n/routing';
import { getCategories, getCategory, getHome, getSite } from '@/lib/api/endpoints';
import type { ContactCtaSection, Faq, FaqSection as FaqData, ProcessSection as ProcessData } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/seo/metadata';
import { alternateSiteName, serviceJsonLd } from '@/lib/seo/structured-data';
import { interpolate, plural } from '@/lib/site/format';
import { settingValue, whatsappUrl } from '@/lib/site/settings';
import { createTranslator } from '@/lib/site/translate';

export async function generateStaticParams() {
  // Slugs are shared by both locales (the [locale] layout supplies en + ar).
  // Slugs added later still render on demand.
  const { data } = await getCategories(routing.defaultLocale);
  return data.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const { data: category } = await getCategory(slug, locale); // 404 → notFound()
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: category.seo.title ?? category.title,
    description: category.seo.description ?? category.excerpt,
  });
}

/**
 * Category page — a product page: immersive hero (media frame, copy, facts, actions) → overview
 * statement → services (sticky service nav with scroll-spy over a 2-column grid; image cards are
 * featured rows) → the shared process → FAQ (topped up with home FAQs below 2) → the other categories
 * as glass tiles → a category-specific CTA band. Phones get a sticky bottom action bar between the hero
 * and the CTA band. Content sections alternate bg / surface.
 */
export default async function CategoryPage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [{ data: category }, { data: categories }, { data: site }, { data: home }] = await Promise.all([
    getCategory(slug, locale),
    getCategories(locale),
    getSite(locale),
    getHome(locale),
  ]);
  const t = createTranslator(site.ui_strings);
  const index = Math.max(
    0,
    categories.findIndex((c) => c.slug === slug),
  );
  const others = categories.filter((c) => c.slug !== slug);
  const cta = home.find((s): s is ContactCtaSection => s.key === 'contact_cta');
  const process = home.find((s): s is ProcessData => s.key === 'process');
  const homeFaq = home.find((s): s is FaqData => s.key === 'faq');
  const whatsapp = whatsappUrl(site.settings);
  const contactHref = `/contact?service=${category.slug}`;
  const countLabel = (n: number) => plural(t, locale, 'services.count', n);

  // FAQ: the category's own; below 2, topped up with the first general home FAQs.
  const faqs: Faq[] =
    category.faqs.length >= 2
      ? category.faqs
      : [
          ...category.faqs,
          ...(homeFaq?.faqs ?? []).filter((f) => !category.faqs.some((c) => c.id === f.id)).slice(0, 2),
        ];

  // Bands after the hero alternate bg / surface (the overview is first, on surface).
  let band = 0;
  const tone = () => (band++ % 2 === 0 ? 'tone-surface' : undefined);

  return (
    <>
      <CategoryHero
        category={category}
        index={index}
        facts={[countLabel(category.services.length), t('services.fact_bilingual')]}
        labels={{ start: t('actions.start_project'), explore: t('services.explore_services') }}
        breadcrumb={
          <Breadcrumbs
            locale={locale}
            label={t('misc.breadcrumb')}
            items={[
              { label: t('nav.home'), href: '/' },
              { label: t('nav.services'), href: '/services' },
              { label: category.title },
            ]}
          />
        }
      />

      {category.description && (
        <div className={tone()}>
          <CategoryOverview title={t('services.overview')} description={category.description} />
        </div>
      )}

      {category.services.length > 0 && (
        <section
          id="services"
          tabIndex={-1}
          aria-labelledby="services-list-title"
          className={cn('services-flow outline-none', tone())}
        >
          <DisciplineNav
            label={t('services.index_label')}
            items={category.services.map((s) => ({ slug: s.anchor, title: s.title }))}
          />
          <div className="container-page flex flex-col gap-8 pt-8 pb-[clamp(64px,8vw,112px)] lg:gap-10 lg:pt-12">
            <SectionHeading
              id="services-list-title"
              title={t('services.list_title')}
              subtitle={countLabel(category.services.length)}
            />
            <ServiceGrid
              services={category.services}
              categorySlug={category.slug}
              requestLabel={t('services.request')}
            />
          </div>
        </section>
      )}

      {process && process.steps.length > 0 && (
        <div className={tone()}>
          <ProcessSection section={{ ...process, eyebrow: t('services.process_eyebrow') }} />
        </div>
      )}

      {faqs.length > 0 && (
        <div className={tone()}>
          <FaqSection
            faqs={faqs}
            scope={category.slug}
            id="category-faq"
            title={t('services.faq_title')}
            help={{
              title: t('faq.help_title'),
              text: t('faq.help_text'),
              contactLabel: t('faq.help_cta'),
              contactHref,
              whatsappUrl: whatsapp,
              whatsappLabel: t('contact.whatsapp'),
            }}
          />
        </div>
      )}

      <div className={tone()}>
        <OtherCategories
          title={t('services.explore_other')}
          categories={others}
          all={categories}
          countLabel={countLabel}
        />
      </div>

      <ContactCtaBand
        id="category-cta"
        title={interpolate(t('services.cta_title'), { category: category.title })}
        subtitle={cta?.subtitle ?? null}
        responseTime={cta?.response_time ?? settingValue(site.settings.response_time)}
        whatsappUrl={whatsapp}
        ctaLabel={t('actions.start_project')}
        ctaHref={contactHref}
        whatsappLabel={t('contact.whatsapp')}
      />

      <MobileCtaBar
        href={contactHref}
        label={t('actions.start_project')}
        whatsappUrl={whatsapp}
        whatsappLabel={t('contact.whatsapp')}
        heroId="category-hero"
        endId="category-cta"
      />
      <HashPulse />

      <JsonLd data={serviceJsonLd(category, site, locale, await alternateSiteName(locale))} />
    </>
  );
}
