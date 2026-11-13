import { Clock, Hourglass, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/Button';
import type { SiteSettings } from '@/lib/api/types';
import { settingValue, whatsappUrl } from '@/lib/site/settings';
import type { Translate } from '@/lib/site/translate';

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <div className="mt-0.5 break-words text-text">{children}</div>
      </div>
    </li>
  );
}

const iconClass = 'size-5';

export function ContactInfoCard({ settings, t }: { settings: SiteSettings; t: Translate }) {
  const email = settingValue(settings.email);
  const phone = settingValue(settings.phone);
  const whatsapp = whatsappUrl(settings);
  const address = settingValue(settings.address);
  const hours = settingValue(settings.working_hours);
  const responseTime = settingValue(settings.response_time);
  const map = settingValue(settings.map_embed_url);

  return (
    <aside className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6 md:p-8">
      <h2 className="text-xl font-bold">{t('contact.info_title')}</h2>

      <ul className="flex flex-col gap-5">
        {email && (
          <Row icon={<Mail aria-hidden="true" className={iconClass} />} label={t('contact.email')}>
            <a href={`mailto:${email}`} dir="ltr" className="hover:text-primary">
              {email}
            </a>
          </Row>
        )}
        {phone && (
          <Row icon={<Phone aria-hidden="true" className={iconClass} />} label={t('contact.phone')}>
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} dir="ltr" className="hover:text-primary">
              {phone}
            </a>
          </Row>
        )}
        {address && (
          <Row icon={<MapPin aria-hidden="true" className={iconClass} />} label={t('contact.address')}>
            {address}
          </Row>
        )}
        {hours && (
          <Row icon={<Clock aria-hidden="true" className={iconClass} />} label={t('footer.working_hours')}>
            {hours}
          </Row>
        )}
        {responseTime && (
          <Row icon={<Hourglass aria-hidden="true" className={iconClass} />} label={t('contact.response_time')}>
            {responseTime}
          </Row>
        )}
      </ul>

      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses('primary', 'bg-whatsapp text-on-whatsapp hover:bg-whatsapp/90')}
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          {t('contact.whatsapp')}
        </a>
      )}

      {map && (
        <iframe
          src={map}
          title={t('contact.map_title')}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[4/3] w-full rounded-xl border border-border"
          allowFullScreen
        />
      )}
    </aside>
  );
}
