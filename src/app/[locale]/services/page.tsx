import type { Metadata } from 'next';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import { ProcessSection } from '@/components/sections/home/ProcessSection';
import { PageHero } from '@/components/sections/PageHero';
import { ServicesBento } from '@/components/sections/services/ServicesBento';
import { resolveLocale } from '@/i18n/locale';
import { getCategories, getHome, getPage, getSite } from '@/lib/api/endpoints';
import type { ContactCtaSection, ProcessSection as ProcessData } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';
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
    image: page.hero?.conversions?.lg ?? page.hero?.url,
  });
}

export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const locale = await resolveLocale(params);
  const [{ data: page }, { data: categories }, { data: site }, { data: home }] = await Promise.all([
    getPage('services', locale),
    getCategories(locale),
    getSite(locale),
    getHome(locale),
  ]);
  const t = createTranslator(site.ui_strings);
  const process = home.find((s): s is ProcessData => s.key === 'process');
  const cta = home.find((s): s is ContactCtaSection => s.key === 'contact_cta');

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} image={page.hero} seed={5} />

      <section aria-label={page.title} className="pb-12">
        <div className="container-page">
          <ServicesBento categories={categories} countLabel={(n) => plural(t, locale, 'services.count', n)} />
        </div>
      </section>

      {process && <ProcessSection section={process} />}

      {cta && (
        <ContactCtaBand
          title={cta.title}
          subtitle={cta.subtitle}
          responseTime={cta.response_time ?? settingValue(site.settings.response_time)}
          whatsappUrl={whatsappUrl(site.settings)}
          ctaLabel={cta.cta?.label ?? t('actions.start_project')}
          whatsappLabel={t('contact.whatsapp')}
        />
      )}
    </>
  );
}
