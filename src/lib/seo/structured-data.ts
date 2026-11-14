import type { Locale, ServiceCategoryDetail, Site } from '@/lib/api/types';
import { settingValue, socialLinks } from '@/lib/site/settings';
import { SITE_URL } from '@/lib/site-url';

/** schema.org Service for a category page, with its sub-services as an offer catalog. */
export function serviceJsonLd(category: ServiceCategoryDetail, site: Site, locale: Locale): Record<string, unknown> {
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
export function organizationJsonLd(site: Site, locale: Locale): Record<string, unknown> {
  const { settings } = site;
  const email = settingValue(settings.email);
  const phone = settingValue(settings.phone);
  const sameAs = socialLinks(settings).map((s) => s.url);
  const address = settingValue(settings.address);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.site_name,
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
