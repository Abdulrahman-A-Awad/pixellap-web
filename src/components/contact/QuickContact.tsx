import { ArrowRight, Mail, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrandIcon } from '@/components/brand/BrandIcons';
import { Reveal } from '@/components/motion/Reveal';
import type { SiteSettings } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { formatPhone, interpolate, telHref } from '@/lib/site/format';
import { settingValue, whatsappDigits } from '@/lib/site/settings';
import type { Translate } from '@/lib/site/translate';

interface Card {
  key: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
  tint: string;
  title: string;
  value: ReactNode;
}

/**
 * Three glass quick-contact cards (WhatsApp / email / call) overlapping the hero bottom; one row
 * from lg (three columns are too narrow on tablets: values would be cut), stacked below; values wrap,
 * never truncate. Each card is one link: tinted icon chip, title, value, an arrow that
 * nudges on hover, hover lift + glow. A card is hidden when its setting is empty or still "TODO".
 * WhatsApp uses the widget's prefilled message (page = this page's title); the phone is grouped for
 * humans and LTR-isolated.
 */
export function QuickContact({ settings, pageTitle, t }: { settings: SiteSettings; pageTitle: string; t: Translate }) {
  const digits = whatsappDigits(settings);
  const email = settingValue(settings.email);
  const phone = settingValue(settings.phone);

  const cards: Card[] = [];
  if (digits) {
    const text = interpolate(t('whatsapp.prefill'), { page: pageTitle });
    cards.push({
      key: 'whatsapp',
      href: `https://wa.me/${digits}?text=${encodeURIComponent(text)}`,
      external: true,
      icon: <BrandIcon name="whatsapp" className="size-5" />,
      tint: 'bg-whatsapp/15 text-whatsapp',
      title: t('contact.chat_title'),
      value: t('whatsapp.replies'),
    });
  }
  if (email) {
    cards.push({
      key: 'email',
      href: `mailto:${email}`,
      icon: <Mail aria-hidden="true" className="size-5" />,
      tint: 'bg-primary/12 text-link',
      title: t('contact.email_title'),
      value: <bdi dir="ltr">{email}</bdi>,
    });
  }
  if (phone) {
    cards.push({
      key: 'phone',
      href: telHref(phone),
      icon: <Phone aria-hidden="true" className="size-5" />,
      tint: 'bg-iris/14 text-link',
      title: t('contact.call_title'),
      value: <bdi dir="ltr">{formatPhone(phone)}</bdi>,
    });
  }
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="quick-contact-title" className="relative z-10 -mt-16 md:-mt-20">
      <h2 id="quick-contact-title" className="sr-only">
        {t('contact.quick_title')}
      </h2>
      <ul
        className={cn(
          'container-page grid gap-4',
          cards.length === 3 ? 'lg:grid-cols-3' : cards.length === 2 ? 'md:grid-cols-2' : 'mx-auto max-w-xl',
        )}
      >
        {cards.map((card, i) => (
          <Reveal key={card.key} as="li" index={i}>
            <a
              href={card.href}
              {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="quick-card glass-card lift flex h-full items-center gap-4 p-5 md:p-6"
            >
              <span
                aria-hidden="true"
                className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-[14px]', card.tint)}
              >
                {card.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-bold text-text">{card.title}</span>
                <span className="text-meta break-words text-muted">{card.value}</span>
              </span>
              <ArrowRight aria-hidden="true" className="quick-arrow size-4 shrink-0 text-link rtl:-scale-x-100" />
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
