import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import { FaqSection } from '@/components/sections/home/FaqSection';
import { ProcessSection } from '@/components/sections/home/ProcessSection';
import { StatsSection } from '@/components/sections/home/StatsSection';
import { DisciplineNav } from '@/components/sections/services/overview/DisciplineNav';
import { DisciplineShowcase } from '@/components/sections/services/overview/DisciplineShowcase';
import { ServicesHero } from '@/components/sections/services/overview/ServicesHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { resolveLocale } from '@/i18n/locale';
import { getCategoriesWithServices, getHome, getPage, getSite } from '@/lib/api/endpoints';
import type {
  ContactCtaSection,
  FaqSection as FaqData,
  ProcessSection as ProcessData,
  StatsSection as StatsData,
} from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/seo/metadata';
import { alternateSiteName, servicesItemListJsonLd } from '@/lib/seo/structured-data';
import { withSiteName } from '@/lib/site/brand';
import { plural } from '@/lib/site/format';
import { settingValue, whatsappUrl } from '@/lib/site/settings';
import { createTranslator } from '@/lib/site/translate';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: page } = await getPage('services', locale);
  return buildMetadata({
    locale,
    path: '/services',
    title: page.seo.title,
    description: page.seo.description,
  });
}

/**
 * Services index — scroll storytelling: hero (title, computed stat line, instant service search,
 * 6 discipline tiles) → sticky discipline nav (scroll-spy) over one showcase per discipline (sticky
 * media | description + every service as an expandable row) → the shared process, stats tiles, home
 * FAQ and ONE closing CTA band. Content sections after the showcases alternate bg / surface.
 */
export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const locale = await resolveLocale(params);
  const [{ data: page }, { data: categories }, { data: site }, { data: home }] = await Promise.all([
    getPage('services', locale),
    getCategoriesWithServices(locale),
    getSite(locale),
    getHome(locale),
  ]);
  const t = createTranslator(site.ui_strings);
  const siteName = site.settings.site_name;
  const process = home.find((s): s is ProcessData => s.key === 'process');
  const stats = home.find((s): s is StatsData => s.key === 'stats');
  const faq = home.find((s): s is FaqData => s.key === 'faq');
  const cta = home.find((s): s is ContactCtaSection => s.key === 'contact_cta');
  const serviceTotal = categories.reduce((n, c) => n + c.services.length, 0);
  const whatsapp = whatsappUrl(site.settings);

  // After the showcases: each renders only when it has content (keeps the bands alternating).
  const after: { key: string; node: ReactNode }[] = [];
  if (process && process.steps.length > 0) after.push({ key: 'process', node: <ProcessSection section={process} /> });
  if (stats && stats.items.length > 0) {
    after.push({
      key: 'stats',
      node: (
        <StatsSection
          id="services-stats"
          items={stats.items}
          eyebrow={withSiteName(stats.eyebrow, siteName)}
          title={withSiteName(stats.title, siteName)}
          subtitle={withSiteName(stats.subtitle, siteName)}
        />
      ),
    });
  }
  if (faq && faq.faqs.length > 0) {
    after.push({
      key: 'faq',
      node: (
        <FaqSection
          id="services-faq"
          faqs={faq.faqs}
          scope="home"
          eyebrow={faq.eyebrow}
          title={faq.title}
          subtitle={faq.subtitle}
          help={{
            title: t('faq.help_title'),
            text: t('faq.help_text'),
            contactLabel: t('faq.help_cta'),
            whatsappUrl: whatsapp,
            whatsappLabel: t('contact.whatsapp'),
          }}
        />
      ),
    });
  }

  return (
    <>
      <ServicesHero
        eyebrow={t('services.hero_eyebrow')}
        title={page.title}
        subtitle={page.subtitle}
        disciplinesLabel={plural(t, locale, 'services.disciplines', categories.length)}
        servicesLabel={plural(t, locale, 'services.count', serviceTotal)}
        categories={categories}
        countLabel={(n) => plural(t, locale, 'services.count', n)}
        search={{
          label: t('services.search_label'),
          placeholder: t('services.search_placeholder'),
          hint: t('services.search_hint'),
          emptyText: t('services.search_empty'),
          resultsText: t('services.search_results'),
          clearLabel: t('services.search_clear'),
        }}
      />

      {categories.length > 0 && (
        <div className="services-flow">
          <DisciplineNav
            revealOnStick
            label={t('services.nav_label')}
            items={categories.map((c) => ({ slug: c.slug, title: c.title }))}
          />
          {categories.map((category, i) => (
            <div key={category.slug} className={cn(i % 2 === 0 && 'tone-surface')}>
              <DisciplineShowcase
                category={category}
                index={i}
                flip={i % 2 === 1}
                eager={i === 0}
                labels={{
                  explore: t('services.explore'),
                  start: t('actions.start_project'),
                  details: t('services.details'),
                }}
              />
            </div>
          ))}
        </div>
      )}

      {after.map((section, i) => (
        // Continue the alternation after the showcases.
        <div
          key={section.key}
          data-section={section.key}
          className={cn((categories.length + i) % 2 === 0 && 'tone-surface')}
        >
          {section.node}
        </div>
      ))}

      {cta && (
        <ContactCtaBand
          title={cta.title}
          subtitle={cta.subtitle}
          responseTime={cta.response_time ?? settingValue(site.settings.response_time)}
          whatsappUrl={whatsapp}
          ctaLabel={cta.cta?.label ?? t('actions.start_project')}
          ctaHref={cta.cta?.url?.startsWith('/') ? cta.cta.url : '/contact'}
          whatsappLabel={t('contact.whatsapp')}
        />
      )}

      <JsonLd
        data={servicesItemListJsonLd(
          categories,
          site,
          locale,
          { title: page.seo.title || page.title, description: page.seo.description },
          await alternateSiteName(locale),
        )}
      />
    </>
  );
}
