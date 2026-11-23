import { routing } from '@/i18n/routing';
import { getSite } from '@/lib/api/endpoints';
import type { Locale, ServiceCategoryDetail, ServiceCategoryWithServices, Site } from '@/lib/api/types';
import { settingValue, socialLinks } from '@/lib/site/settings';
import { SITE_URL } from '@/lib/site-url';

/**
 * The site name in the other language (JSON-LD `alternateName`: "بكسل لاب" on English pages, "Pixellap"
 * on Arabic ones). Cached like every /site call; null when it is the same name.
 */
export async function alternateSiteName(locale: Locale): Promise<string | null> {
  const other = routing.locales.find((l) => l !== locale);
  if (!other) return null;
  const [{ data: here }, { data: there }] = await Promise.all([getSite(locale), getSite(other)]);
  return there.settings.site_name && there.settings.site_name !== here.settings.site_name
    ? there.settings.site_name
    : null;
}

/** schema.org Service for a category page, with its sub-services as an offer catalog. */
export function serviceJsonLd(
  category: ServiceCategoryDetail,
  site: Site,
  locale: Locale,
  alternateName: string | null = null,
): Record<string, unknown> {
  const url = `${SITE_URL}/${locale}/services/${category.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: category.title,
    serviceType: category.title,
    description: category.seo.description ?? category.excerpt,
    url,
    areaServed: 'AE',
    ...(category.cover ? { image: category.cover.url } : {}),
    provider: {
      '@type': 'Organization',
      name: site.settings.site_name,
      ...(alternateName ? { alternateName } : {}),
      url: `${SITE_URL}/${locale}`,
      logo: `${SITE_URL}/brand/pixellap-logo.svg`,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: category.title,
      itemListElement: category.services.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.title, description: service.description },
      })),
    },
  };
}

/** schema.org Organization for the home page (only fields that have real values). */
export function organizationJsonLd(
  site: Site,
  locale: Locale,
  alternateName: string | null = null,
): Record<string, unknown> {
  const { settings } = site;
  const email = settingValue(settings.email);
  const phone = settingValue(settings.phone);
  const sameAs = socialLinks(settings).map((s) => s.url);
  const address = settingValue(settings.address);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.site_name,
    ...(alternateName ? { alternateName } : {}),
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/brand/pixellap-logo.svg`,
    description: settings.seo_default_description,
    ...(settings.og_image ? { image: settings.og_image } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(address ? { address: { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'AE' } } : {}),
    ...(email || phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            areaServed: 'AE',
            availableLanguage: ['English', 'Arabic'],
            ...(email ? { email } : {}),
            ...(phone ? { telephone: phone } : {}),
          },
        }
      : {}),
  };
}

/** schema.org ContactPage (contact page), with the Organization (+ its contact point) as main entity. */
export function contactPageJsonLd(
  site: Site,
  locale: Locale,
  page: { title: string; description?: string | null },
  alternateName: string | null = null,
): Record<string, unknown> {
  const organization = organizationJsonLd(site, locale, alternateName);
  delete organization['@context']; // nested entity: the page carries the context
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: page.title,
    ...(page.description ? { description: page.description } : {}),
    url: `${SITE_URL}/${locale}/contact`,
    inLanguage: locale,
    mainEntity: organization,
  };
}

/** schema.org AboutPage (about page), with the Organization as main entity. */
export function aboutPageJsonLd(
  site: Site,
  locale: Locale,
  page: { title: string; description?: string | null; image?: string | null },
  alternateName: string | null = null,
): Record<string, unknown> {
  const organization = organizationJsonLd(site, locale, alternateName);
  delete organization['@context']; // nested entity: the page carries the context
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: page.title,
    ...(page.description ? { description: page.description } : {}),
    ...(page.image ? { primaryImageOfPage: page.image } : {}),
    url: `${SITE_URL}/${locale}/about`,
    inLanguage: locale,
    mainEntity: organization,
  };
}

/** schema.org ItemList of the service categories (services index), each a Service by the Organization. */
export function servicesItemListJsonLd(
  categories: ServiceCategoryWithServices[],
  site: Site,
  locale: Locale,
  page: { title: string; description?: string | null },
  alternateName: string | null = null,
): Record<string, unknown> {
  const provider = {
    '@type': 'Organization',
    name: site.settings.site_name,
    ...(alternateName ? { alternateName } : {}),
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/brand/pixellap-logo.svg`,
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.title,
    ...(page.description ? { description: page.description } : {}),
    url: `${SITE_URL}/${locale}/services`,
    numberOfItems: categories.length,
    itemListElement: categories.map((category, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: category.title,
        serviceType: category.title,
        description: category.excerpt,
        url: `${SITE_URL}/${locale}/services/${category.slug}`,
        areaServed: 'AE',
        ...(category.cover ? { image: category.cover.url } : {}),
        provider,
      },
    })),
  };
}
