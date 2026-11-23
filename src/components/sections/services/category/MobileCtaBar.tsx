'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrandIcon } from '@/components/brand/BrandIcons';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Phones/tablets only (< lg): a small glass bar fixed to the bottom ("Start a project" + WhatsApp)
 * that slides in once the hero has scrolled away and out again when the closing CTA band (or the
 * footer) comes into view. Respects the safe-area inset. While it shows, `html[data-cta-bar]` hides the
 * floating WhatsApp widget on small screens (the bar already offers WhatsApp). Server HTML: hidden.
 */
export function MobileCtaBar({
  href,
  label,
  whatsappUrl,
  whatsappLabel,
  heroId,
  endId,
}: {
  href: string;
  label: string;
  whatsappUrl: string | null;
  whatsappLabel: string;
  heroId: string;
  /** The closing CTA band: the bar hides while it (or anything after it) is on screen. */
  endId: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const end = document.getElementById(endId) ?? document.querySelector('footer');
    if (!hero) return;
    let pastHero = false;
    let nearEnd = false;
    const update = () => setShow(pastHero && !nearEnd);
    const heroObs = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    });
    const endObs = new IntersectionObserver(([e]) => {
      // On screen, or already scrolled past it (footer zone).
      nearEnd = e.isIntersecting || e.boundingClientRect.top < 0;
      update();
    });
    heroObs.observe(hero);
    if (end) endObs.observe(end);
    return () => {
      heroObs.disconnect();
      endObs.disconnect();
    };
  }, [heroId, endId]);

  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute('data-cta-bar', show);
    return () => root.removeAttribute('data-cta-bar');
  }, [show]);

  return (
    <div className={cn('mobile-cta-bar lg:hidden', show && 'is-shown')} aria-hidden={!show}>
      <div className="glass-card mobile-cta-inner flex items-center gap-2 p-2">
        <Link
          href={href}
          tabIndex={show ? undefined : -1}
          className="btn-press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-primary px-5 font-bold text-on-primary"
        >
          {label}
          <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={show ? undefined : -1}
            aria-label={whatsappLabel}
            className="btn-press inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-whatsapp text-on-whatsapp"
          >
            <BrandIcon name="whatsapp" className="size-5" />
          </a>
        )}
      </div>
    </div>
  );
}
