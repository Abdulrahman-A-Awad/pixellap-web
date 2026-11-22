import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import { FaqSection } from '@/components/sections/home/FaqSection';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { CategoryHero } from '@/components/sections/services/CategoryHero';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { CategoryRail } from '@/components/sections/services/CategoryRail';
import { ServiceChips, ServiceIndex } from '@/components/sections/services/ServiceIndex';
import { serviceAnchor, ServiceItemCard } from '@/components/sections/services/ServiceItemCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/i18n/navigation';
import { resolveLocale } from '@/i18n/locale';
import { routing } from '@/i18n/routing';
import { getCategories, getCategory, getHome, getSite } from '@/lib/api/endpoints';
import type { ContactCtaSection } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';
import { alternateSiteName, serviceJsonLd } from '@/lib/seo/structured-data';
import { plural } from '@/lib/site/format';
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
  const items = category.services.map((s) => ({ id: serviceAnchor(s), title: s.title }));

  return (
    <>
      <CategoryHero
        category={category}
        index={index}
        ctaLabel={t('actions.start_project')}
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

      {/* Overview: rich text from the admin editor. */}
      {category.description && (
        <section aria-labelledby="overview-title" className="py-12 md:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <h2 id="overview-title" data-reveal className="text-heading">
              {t('services.overview')}
            </h2>
            <div
              data-reveal
              className="prose-rich measure text-lead text-muted"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          </div>
        </section>
      )}

      {/* Services list: sticky index (desktop) + cards. */}
      {category.services.length > 0 && (
        <section id="services-list" aria-labelledby="services-list-title" className="py-12 md:py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[minmax(16rem,22rem)_1fr] lg:gap-16">
            {/* min-w-0: grid items default to min-width:auto and would grow to fit the chip row. */}
            <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                id="services-list-title"
                title={t('services.list_title')}
                subtitle={plural(t, locale, 'services.count', category.services.length)}
              />
              <div className="hidden lg:block">
                <ServiceIndex items={items} label={t('services.index_label')} />
              </div>
              <ServiceChips items={items} label={t('services.jump_to')} />
            </div>

            <div className="flex min-w-0 flex-col gap-6 md:gap-8">
              {category.services.map((service, i) => (
                <ServiceItemCard
                  key={service.id}
                  service={service}
                  index={i}
                  categorySlug={category.slug}
                  requestLabel={t('services.request')}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection
        faqs={category.faqs}
        scope={category.slug}
        id="category-faq"
        title={t('services.faq_title')}
        help={{
          title: t('faq.help_title'),
          text: t('faq.help_text'),
          contactLabel: t('faq.help_cta'),
          contactHref: `/contact?service=${category.slug}`,
          whatsappUrl: whatsappUrl(site.settings),
          whatsappLabel: t('contact.whatsapp'),
        }}
      />

      {/* Other categories. */}
      {others.length > 0 && (
        <section aria-labelledby="other-services-title" className="py-12 md:py-20">
          <div className="container-page flex flex-col gap-4">
            <h2 id="other-services-title" className="text-heading">
              {t('services.explore_other')}
            </h2>
            <CategoryRail label={t('services.explore_other')} prevLabel={t('misc.previous')} nextLabel={t('misc.next')}>
              {others.map((other) => {
                const otherIndex = categories.findIndex((c) => c.slug === other.slug);
                return (
                  <li key={other.slug} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[30%]">
                    <Link
                      href={`/services/${other.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-[border-color,box-shadow] duration-300 hover:border-lavender/70 hover:shadow-[0_0_40px_-14px_var(--accent-glow)]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                        {other.cover ? (
                          <Image
                            src={other.cover.conversions?.md ?? other.cover.url}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 78vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
                            <PixelComposition seed={otherIndex * 17 + 3} cols={8} rows={4} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <div className="flex items-center gap-3">
                          <CategoryIcon icon={other.icon} index={otherIndex} size="sm" />
                          <h3 className="text-lg font-bold">{other.title}</h3>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted">{other.excerpt}</p>
                        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm text-link">
                          {plural(t, locale, 'services.count', other.services_count)}
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </CategoryRail>
          </div>
        </section>
      )}

      {cta && (
        <ContactCtaBand
          title={cta.title}
          subtitle={cta.subtitle}
          responseTime={cta.response_time ?? settingValue(site.settings.response_time)}
          whatsappUrl={whatsappUrl(site.settings)}
          ctaLabel={cta.cta?.label ?? t('actions.start_project')}
          ctaHref={`/contact?service=${category.slug}`}
          whatsappLabel={t('contact.whatsapp')}
        />
      )}

      <JsonLd data={serviceJsonLd(category, site, locale, await alternateSiteName(locale))} />
    </>
  );
}
