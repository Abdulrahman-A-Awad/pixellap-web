import { Clock, Hourglass, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { SocialLinks } from '@/components/layout/SocialLinks';
import type { SiteSettings } from '@/lib/api/types';
import { settingValue } from '@/lib/site/settings';
import type { Translate } from '@/lib/site/translate';

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-link"
      >
        {icon}
      </span>
      {/* The label is for screen readers; visually the icon says it. */}
      <p className="min-w-0 pt-2 break-words text-text">
        <span className="sr-only">{label}: </span>
        {children}
      </p>
    </li>
  );
}

/**
 * Contact info (sticky beside the form on desktop): the response-time promise as a chip, working
 * hours, the address (value only), the social icons (same component as the footer) and the map
 * (rounded, lazy, slightly desaturated in dark) when Settings has an embed URL. Email / phone /
 * WhatsApp live in the quick-contact cards above.
 */
export function ContactInfoCard({ settings, t }: { settings: SiteSettings; t: Translate }) {
  const address = settingValue(settings.address);
  const hours = settingValue(settings.working_hours);
  const responseTime = settingValue(settings.response_time);
  const map = settingValue(settings.map_embed_url);

  return (
    <aside aria-labelledby="contact-info-title" className="surface-card flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col items-start gap-3">
        <h2 id="contact-info-title" className="text-title">
          {t('contact.info_title')}
        </h2>
        {responseTime && (
          <p className="inline-flex items-center gap-2 rounded-pill bg-primary/10 px-3.5 py-1.5 text-meta font-bold text-link">
            <Hourglass aria-hidden="true" className="size-4" />
            <span className="sr-only">{t('contact.response_time')}: </span>
            {responseTime}
          </p>
        )}
      </div>

      {(hours || address) && (
        <ul className="flex flex-col gap-4">
          {hours && (
            <Row icon={<Clock className="size-5" />} label={t('footer.working_hours')}>
              {hours}
            </Row>
          )}
          {address && (
            <Row icon={<MapPin className="size-5" />} label={t('contact.address')}>
              {address}
            </Row>
          )}
        </ul>
      )}

      <SocialLinks settings={settings} label={t('footer.follow_us')} />

      {map && (
        <iframe
          src={map}
          title={t('contact.map_title')}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="map-embed aspect-[4/3] w-full"
          allowFullScreen
        />
      )}
    </aside>
  );
}
