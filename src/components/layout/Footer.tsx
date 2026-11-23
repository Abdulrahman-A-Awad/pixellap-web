import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Link } from '@/i18n/navigation';
import type { Site } from '@/lib/api/types';
import { formatPhone, telHref } from '@/lib/site/format';
import { settingValue } from '@/lib/site/settings';
import type { Translate } from '@/lib/site/translate';
import { CurrentYear } from './CurrentYear';
import { NAV_ITEMS } from './nav';
import { SocialLinks } from './SocialLinks';

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 text-meta font-bold text-text">{children}</h2>;
}

const linkClass = 'text-muted transition-colors hover:text-text';

export function Footer({ site, t }: { site: Site; t: Translate }) {
  const { settings } = site;
  const email = settingValue(settings.email);
  const phone = settingValue(settings.phone);
  const address = settingValue(settings.address);
  const hours = settingValue(settings.working_hours);
  const vat = settingValue(settings.vat_number);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <Link href="/" className="inline-flex w-fit rounded-md" aria-label={settings.site_name}>
            <Logo variant="horizontal" height={48} alt={settings.site_name} />
          </Link>
          <p className="max-w-xs text-muted">{settings.tagline}</p>
          <SocialLinks settings={settings} label={t('footer.follow_us')} />
        </div>

        <nav aria-label={t('footer.quick_links')} className="lg:col-span-2">
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

        <nav aria-label={t('footer.services')} className="lg:col-span-3">
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

        <div className="lg:col-span-3">
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
                <a href={telHref(phone)} className={linkClass} dir="ltr">
                  {formatPhone(phone)}
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

      {/* data-footer-bar: the floating WhatsApp widget lifts above this bar when it is on screen. */}
      <div data-footer-bar className="border-t border-border">
        <div className="container-page py-5 text-meta text-muted">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
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
      </div>
    </footer>
  );
}
