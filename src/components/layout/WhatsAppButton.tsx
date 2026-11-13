'use client';

import { MessageCircle } from 'lucide-react';
import { useSite } from '@/components/providers/SiteProvider';
import { whatsappUrl } from '@/lib/site/settings';

/** Floating WhatsApp button, bottom-end corner (mirrors in RTL). Hidden without a real number. */
export function WhatsAppButton() {
  const { site, t } = useSite();
  const url = whatsappUrl(site.settings);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed end-4 bottom-4 z-30 inline-flex size-14 items-center justify-center rounded-pill bg-whatsapp text-on-whatsapp shadow-lg shadow-black/30 transition-transform hover:scale-105 sm:end-6 sm:bottom-6"
    >
      <MessageCircle aria-hidden="true" className="size-7" />
      <span className="sr-only">{t('contact.whatsapp')}</span>
    </a>
  );
}
