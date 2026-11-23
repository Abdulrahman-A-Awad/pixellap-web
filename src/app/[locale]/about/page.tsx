import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AboutHero } from '@/components/sections/about/AboutHero';
import { type ContentBlock, PageBlockView } from '@/components/sections/about/PageBlocks';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import { ClientsSection } from '@/components/sections/home/ClientsSection';
import { ProcessSection } from '@/components/sections/home/ProcessSection';
import { StatsSection } from '@/components/sections/home/StatsSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { resolveLocale } from '@/i18n/locale';
import { getHome, getPage, getSite } from '@/lib/api/endpoints';
import type {
  ClientsSection as ClientsData,
  ContactCtaSection,
  CtaBlock,
  ProcessSection as ProcessData,
  StatsSection as StatsData,
} from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { imageSource } from '@/lib/images';
import { buildMetadata } from '@/lib/seo/metadata';
import { aboutPageJsonLd, alternateSiteName } from '@/lib/seo/structured-data';
import { withSiteName } from '@/lib/site/brand';
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
  });
}

/**
 * About: hero (eyebrow + title + subtitle, wide scroll-scaled image) → the CMS content blocks in
 * order (who we are, mission & vision, values, text) → the HOME stats tiles, process (scroll-linked
 * line) and clients marquee (same components, same CMS data and visibility as home) → ONE closing CTA
 * band: the page's `cta` block when it has one, otherwise the global home CTA. Content sections
 * alternate bg / surface like the home page.
 */
export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const locale = await resolveLocale(params);
  const [{ data: page }, { data: site }, { data: home }] = await Promise.all([
    getPage('about', locale),
    getSite(locale),
    getHome(locale),
  ]);
  const t = createTranslator(site.ui_strings);
  const siteName = site.settings.site_name;

  const stats = home.find((s): s is StatsData => s.key === 'stats');
  const process = home.find((s): s is ProcessData => s.key === 'process');
  const clients = home.find((s): s is ClientsData => s.key === 'clients');
  const globalCta = home.find((s): s is ContactCtaSection => s.key === 'contact_cta');
  const pageCta = page.blocks.find((b): b is CtaBlock => b.type === 'cta');
  const whatsapp = whatsappUrl(site.settings);
  const responseTime = settingValue(site.settings.response_time);

  // Content sections in order; each entry renders only when it has content (keeps the bands alternating).
  const sections: { key: string; node: ReactNode }[] = [];
  let imageBlocks = 0;
  for (const block of page.blocks) {
    if (block.type === 'cta') continue;
    const flip = block.type === 'image_text' && imageBlocks++ % 2 === 1;
    sections.push({ key: `block-${block.id}`, node: <PageBlockView block={block as ContentBlock} flip={flip} /> });
  }
  if (stats && stats.items.length > 0) {
    sections.push({
      key: 'stats',
      node: (
        <StatsSection
          id="about-stats"
          items={stats.items}
          eyebrow={withSiteName(stats.eyebrow, siteName)}
          title={withSiteName(stats.title, siteName)}
          subtitle={withSiteName(stats.subtitle, siteName)}
        />
      ),
    });
  }
  if (process && process.steps.length > 0)
    sections.push({ key: 'process', node: <ProcessSection section={process} /> });
  if (clients && clients.items.length > 0)
    sections.push({ key: 'clients', node: <ClientsSection section={clients} /> });

  const cta = pageCta
    ? {
        title: pageCta.title,
        subtitle: pageCta.body,
        responseTime,
        label: t('actions.start_project'),
        href: '/contact',
      }
    : globalCta
      ? {
          title: globalCta.title,
          subtitle: globalCta.subtitle,
          responseTime: globalCta.response_time ?? responseTime,
          label: globalCta.cta?.label ?? t('actions.start_project'),
          href: globalCta.cta?.url?.startsWith('/') ? globalCta.cta.url : '/contact',
        }
      : null;

  return (
    <>
      <AboutHero eyebrow={t('nav.about')} title={page.title} subtitle={page.subtitle} image={page.hero} />

      {sections.map((section, i) => (
        <div key={section.key} data-section={section.key} className={cn(i % 2 === 0 && 'tone-surface')}>
          {section.node}
        </div>
      ))}

      {cta && (
        <ContactCtaBand
          id="about-contact"
          title={cta.title}
          subtitle={cta.subtitle}
          responseTime={cta.responseTime}
          whatsappUrl={whatsapp}
          ctaLabel={cta.label}
          ctaHref={cta.href}
          whatsappLabel={t('contact.whatsapp')}
        />
      )}

      <JsonLd
        data={aboutPageJsonLd(
          site,
          locale,
          {
            title: page.seo.title || page.title,
            description: page.seo.description,
            image: page.hero ? imageSource(page.hero) : null,
          },
          await alternateSiteName(locale),
        )}
      />
    </>
  );
}
