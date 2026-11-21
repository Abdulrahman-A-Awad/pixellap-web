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
import type { HeroSection, HomeSection, Site, StatsSection as StatsData } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/seo/metadata';
import { organizationJsonLd } from '@/lib/seo/structured-data';
import { settingValue, whatsappUrl } from '@/lib/site/settings';
import { createTranslator, type Translate } from '@/lib/site/translate';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: sections } = await getHome(locale);
  const hero = sections.find((s): s is HeroSection => s.key === 'hero');
  return buildMetadata({ locale, path: '/', image: hero?.image?.conversions?.lg ?? hero?.image?.url });
}

/**
 * Whether a section renders anything on the home page. Empty sections are skipped so the
 * background alternation never shows two equal bands in a row. The numbers are rendered inside
 * the About section; the standalone stats section only shows when About is hidden.
 */
function rendersOnHome(section: HomeSection, hasAbout: boolean): boolean {
  switch (section.key) {
    case 'stats':
      return !hasAbout && section.items.length > 0;
    case 'services':
      return section.categories.length > 0;
    case 'process':
      return section.steps.length > 0;
    case 'clients':
      return section.items.length > 0;
    case 'faq':
      return section.faqs.length > 0;
    default:
      return true;
  }
}

/** One home section, by key. Order and visibility come from GET /home. */
function renderSection(section: HomeSection, site: Site, t: Translate, stats: StatsData['items']) {
  switch (section.key) {
    case 'hero':
      return <Hero hero={section} settings={site.settings} t={t} />;
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
      return <AboutTeaser section={section} stats={stats} />;
    case 'faq':
      return (
        <FaqSection
          faqs={section.faqs}
          scope="home"
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          help={{
            title: t('faq.help_title'),
            text: t('faq.help_text'),
            contactLabel: t('faq.help_cta'),
            whatsappUrl: whatsappUrl(site.settings),
            whatsappLabel: t('contact.whatsapp'),
          }}
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
  // Visible stats section → its numbers show inside About.
  const stats = sections.find((s): s is StatsData => s.key === 'stats')?.items ?? [];
  const hasAbout = sections.some((s) => s.key === 'about');
  const visible = sections.filter((s) => rendersOnHome(s, hasAbout));

  // Alternate bg / surface between content sections (the hero and the CTA band keep the page bg).
  let band = 0;

  return (
    <>
      {visible.map((section, i) => {
        const banded = section.key !== 'hero' && section.key !== 'contact_cta';
        const surface = banded && band++ % 2 === 0;
        return (
          // If editors hide/move the hero, keep the first section clear of the fixed header.
          <div
            key={section.key}
            data-section={section.key}
            className={cn(surface && 'tone-surface', i === 0 && section.key !== 'hero' && 'pt-19')}
          >
            {renderSection(section, site, t, stats)}
          </div>
        );
      })}
      <JsonLd data={organizationJsonLd(site, locale)} />
    </>
  );
}
