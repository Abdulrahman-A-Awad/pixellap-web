import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { PixelField } from '@/components/brand/PixelField';
import { Link } from '@/i18n/navigation';
import type { Site } from '@/lib/api/types';
import { settingValue, socialLinks, whatsappUrl } from '@/lib/site/settings';
import type { Translate } from '@/lib/site/translate';
import { CurrentYear } from './CurrentYear';
import { NAV_ITEMS } from './nav';

/** Network names are proper nouns (not translated copy). */
const NETWORKS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  behance: 'Behance',
};

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-sm font-bold tracking-wide text-text">{children}</h2>;
}

const linkClass = 'text-muted transition-colors hover:text-text';

export function Footer({ site, t }: { site: Site; t: Translate }) {
  const { settings } = site;
  const email = settingValue(settings.email);
  const phone = settingValue(settings.phone);
  const whatsapp = whatsappUrl(settings);
  const address = settingValue(settings.address);
  const hours = settingValue(settings.working_hours);
  const vat = settingValue(settings.vat_number);
  const socials = socialLinks(settings);

  return (
    <footer className="relative isolate mt-24 overflow-hidden border-t border-border bg-surface">
      <PixelField seed={42} rows={8} density={0.05} className="opacity-60" />

      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <Link href="/" className="inline-flex w-fit rounded-md" aria-label={settings.site_name}>
            <Logo height={64} alt={settings.site_name} />
          </Link>
          <p className="max-w-xs text-muted">{settings.tagline}</p>
          {socials.length > 0 && (
            <div>
              <h2 className="sr-only">{t('footer.follow_us')}</h2>
              <ul className="flex flex-wrap gap-2">
                {socials.map(({ network, url }) => (
                  <li key={network}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 items-center rounded-pill border border-border px-3 text-xs text-muted transition-colors hover:border-primary hover:text-text"
                    >
                      {NETWORKS[network] ?? network}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <nav aria-label={t('footer.quick_links')}>
          <Heading>{t('footer.quick_links')}</Heading>
          <ul className="flex flex-col gap-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('footer.services')}>
          <Heading>{t('footer.services')}</Heading>
          <ul className="flex flex-col gap-2.5">
            {site.nav.categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/services/${category.slug}`} className={linkClass}>
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <Heading>{t('footer.contact')}</Heading>
          <ul className="flex flex-col gap-3 text-muted">
            {email && (
              <li className="flex items-start gap-3">
                <Mail aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                <a href={`mailto:${email}`} className={linkClass} dir="ltr">
                  {email}
                </a>
              </li>
            )}
            {phone && (
              <li className="flex items-start gap-3">
                <Phone aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={linkClass} dir="ltr">
                  {phone}
                </a>
              </li>
            )}
            {whatsapp && (
              <li className="flex items-start gap-3">
                <MessageCircle aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t('contact.whatsapp')}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                <span>{address}</span>
              </li>
            )}
            {hours && (
              <li className="flex items-start gap-3">
                <Clock aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-text">{t('footer.working_hours')}</span>
                  {hours}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {settings.site_name}. {t('footer.rights')}
          </p>
          {vat && (
            <p>
              {t('footer.vat')} <span dir="ltr">{vat}</span>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
