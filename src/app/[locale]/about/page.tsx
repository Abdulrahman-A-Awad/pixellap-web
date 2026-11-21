import type { Metadata } from 'next';
import { PageBlocks } from '@/components/sections/about/PageBlocks';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import { StatsSection } from '@/components/sections/home/StatsSection';
import { PageHero } from '@/components/sections/PageHero';
import { resolveLocale } from '@/i18n/locale';
import { getHome, getPage, getSite } from '@/lib/api/endpoints';
import type { ContactCtaSection, StatsSection as StatsData } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';
import { settingValue, whatsappUrl } from '@/lib/site/settings';
import { createTranslator } from '@/lib/site/translate';

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: page } = await getPage('about', locale);
  return buildMetadata({
    locale,
    path: '/about',
    title: page.seo.title,
    description: page.seo.description,
    image: page.hero?.conversions?.lg ?? page.hero?.url,
  });
}

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const locale = await resolveLocale(params);
  const [{ data: page }, { data: site }, { data: home }] = await Promise.all([
    getPage('about', locale),
    getSite(locale),
    getHome(locale),
  ]);
  const t = createTranslator(site.ui_strings);

  // Reuse the home stats + closing CTA (they follow the home sections' visibility).
  const stats = home.find((s): s is StatsData => s.key === 'stats');
  const contactCta = home.find((s): s is ContactCtaSection => s.key === 'contact_cta');
  const whatsapp = whatsappUrl(site.settings);
  const responseTime = settingValue(site.settings.response_time);

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} image={page.hero} />

      <PageBlocks
        blocks={page.blocks}
        cta={{
          label: t('actions.start_project'),
          whatsappUrl: whatsapp,
          whatsappLabel: t('contact.whatsapp'),
          responseTime,
        }}
      />

      {stats && <StatsSection items={stats.items} title={stats.title} eyebrow={stats.eyebrow} id="about-stats" />}

      {contactCta && (
        <ContactCtaBand
          id="about-contact"
          title={contactCta.title}
          subtitle={contactCta.subtitle}
          responseTime={contactCta.response_time ?? responseTime}
          whatsappUrl={whatsapp}
          ctaLabel={contactCta.cta?.label ?? t('actions.start_project')}
          whatsappLabel={t('contact.whatsapp')}
        />
      )}
    </>
  );
}
