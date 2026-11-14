import type { Metadata } from 'next';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import { Hero } from '@/components/sections/hero/Hero';
import { AboutTeaser } from '@/components/sections/home/AboutTeaser';
import { ClientsSection } from '@/components/sections/home/ClientsSection';
import { FaqSection } from '@/components/sections/home/FaqSection';
import { ProcessSection } from '@/components/sections/home/ProcessSection';
import { ServicesSection } from '@/components/sections/home/ServicesSection';
import { StatsSection } from '@/components/sections/home/StatsSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { resolveLocale } from '@/i18n/locale';
import { getHome, getSite } from '@/lib/api/endpoints';
import type { HeroSection, HomeSection, StatsSection as StatsData } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';
import { organizationJsonLd } from '@/lib/seo/structured-data';
import { settingValue, whatsappUrl } from '@/lib/site/settings';
import { createTranslator, type Translate } from '@/lib/site/translate';
import type { Site } from '@/lib/api/types';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: sections } = await getHome(locale);
  const hero = sections.find((s): s is HeroSection => s.key === 'hero');
  return buildMetadata({ locale, path: '/', image: hero?.image?.conversions?.lg ?? hero?.image?.url });
}

/** One home section, by key. Order and visibility come from GET /home. */
function renderSection(section: HomeSection, site: Site, t: Translate, stats: StatsData['items']) {
  switch (section.key) {
    case 'hero':
      return <Hero hero={section} stats={stats} settings={site.settings} t={t} />;
    case 'stats':
      return (
        <StatsSection
          items={section.items}
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
        />
      );
    case 'services':
      return <ServicesSection section={section} t={t} />;
    case 'process':
      return <ProcessSection section={section} />;
    case 'clients':
      return <ClientsSection section={section} />;
    case 'about':
      return <AboutTeaser section={section} />;
    case 'faq':
      return (
        <FaqSection
          faqs={section.faqs}
          scope="home"
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
        />
      );
    case 'contact_cta':
      return (
        <ContactCtaBand
          title={section.title}
          subtitle={section.subtitle}
          responseTime={section.response_time ?? settingValue(site.settings.response_time)}
          whatsappUrl={whatsappUrl(site.settings)}
          ctaLabel={section.cta?.label ?? t('actions.start_project')}
          ctaHref={section.cta?.url?.startsWith('/') ? section.cta.url : '/contact'}
          whatsappLabel={t('contact.whatsapp')}
        />
      );
  }
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await resolveLocale(params);
  const [{ data: sections }, { data: site }] = await Promise.all([getHome(locale), getSite(locale)]);
  const t = createTranslator(site.ui_strings);
  const stats = sections.find((s): s is StatsData => s.key === 'stats')?.items ?? [];

  return (
    <>
      {sections.map((section, i) => (
        // If editors hide/move the hero, keep the first section clear of the fixed header.
        <div
          key={section.key}
          data-section={section.key}
          className={i === 0 && section.key !== 'hero' ? 'pt-20' : undefined}
        >
          {renderSection(section, site, t, stats)}
        </div>
      ))}
      <JsonLd data={organizationJsonLd(site, locale)} />
    </>
  );
}
