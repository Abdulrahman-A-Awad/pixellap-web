'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { BrandIcon } from '@/components/brand/BrandIcons';
import { useSite } from '@/components/providers/SiteProvider';
import { interpolate } from '@/lib/site/format';
import { whatsappDigits } from '@/lib/site/settings';

const TOOLTIP_DELAY = 4000; // ms
const TOOLTIP_SEEN_KEY = 'wa-tooltip-seen';
const GAP = 16; // px between the widget and the footer bar / viewport edge (24px from sm)

/**
 * Floating WhatsApp chat widget, bottom-end corner (mirrors in RTL). Hidden without a real number.
 *
 * - Button with a soft pulse ring; after 4 s a small tooltip bubble (once per session).
 * - Click → compact chat card (brand header, "typically replies…", greeting bubble, "Start chat"
 *   → wa.me/{digits}?text={localized message incl. the current page title}).
 * - Esc / close button / click outside closes and returns focus to the button.
 * - Lifts above the footer bottom bar while it is on screen (written as a CSS var, no re-render).
 * No Motion / GSAP: CSS transitions only (this ships on every page).
 */
export function WhatsAppButton() {
  const { site, t } = useSite();
  const digits = whatsappDigits(site.settings);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const start = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [href, setHref] = useState<string | null>(null);
  const titleId = useId();

  // Tooltip after 4 s, once per session (storage may be unavailable: then it simply shows).
  useEffect(() => {
    if (!digits) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(TOOLTIP_SEEN_KEY) === '1';
    } catch {}
    if (seen) return;
    const timer = window.setTimeout(() => {
      setTooltip(true);
      try {
        sessionStorage.setItem(TOOLTIP_SEEN_KEY, '1');
      } catch {}
    }, TOOLTIP_DELAY);
    return () => window.clearTimeout(timer);
  }, [digits]);

  // Lift above the footer's bottom bar: --wa-lift = how much of the bar is inside the viewport.
  useEffect(() => {
    const el = root.current;
    const bar = document.querySelector<HTMLElement>('[data-footer-bar]');
    if (!el || !bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const lift = Math.max(0, window.innerHeight - bar.getBoundingClientRect().top);
      el.style.setProperty('--wa-lift', `${Math.round(lift)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [digits]);

  // Open: focus "Start chat"; Esc or a click outside closes (focus back on the button).
  useEffect(() => {
    if (!open) return;
    start.current?.focus({ preventScroll: true });
    const close = (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) toggle.current?.focus({ preventScroll: true });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  if (!digits) return null;

  const siteName = site.settings.site_name;

  const openCard = () => {
    // The page title is only known in the browser, at the moment the visitor asks.
    const page = document.title.split(/\s[|–—-]\s/)[0]?.trim() || siteName;
    const text = interpolate(t('whatsapp.prefill'), { page });
    setHref(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`);
    setTooltip(false);
    setOpen(true);
  };

  return (
    <div
      ref={root}
      className="wa-widget fixed end-4 z-30 flex flex-col items-end gap-3 sm:end-6"
      style={{ bottom: `calc(var(--wa-lift, 0px) + ${GAP}px)` }}
    >
      {/* Chat card */}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        data-open={open ? '' : undefined}
        inert={!open}
        className="wa-card w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--brand-black)_60%,transparent)]"
      >
        <div className="flex items-center gap-3 bg-linear-to-br from-royal to-iris px-4 py-3.5 text-on-primary">
          <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-pill bg-on-primary/12 ring-1 ring-on-primary/20">
            <Image
              src="/brand/pixellap-mark-white.svg"
              alt=""
              width={246}
              height={284}
              unoptimized
              className="h-5.5 w-auto"
            />
            {/* "Online" dot */}
            <span
              aria-hidden="true"
              className="absolute end-0 bottom-0 size-3 rounded-pill bg-whatsapp ring-2 ring-iris"
            />
          </span>
          <div className="min-w-0 flex-1 leading-snug">
            <p id={titleId} className="font-bold">
              {siteName}
            </p>
            <p className="text-meta text-on-primary/80">{t('whatsapp.replies')}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              toggle.current?.focus({ preventScroll: true });
            }}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-on-primary/85 transition-colors hover:bg-on-primary/15 hover:text-on-primary focus-visible:outline-on-primary"
          >
            <X aria-hidden="true" className="size-4.5" />
            <span className="sr-only">{t('misc.close')}</span>
          </button>
        </div>

        <div className="wa-chat-bg flex flex-col gap-4 p-4">
          <p className="wa-bubble relative max-w-[88%] rounded-[16px] rounded-ss-[4px] bg-bg px-4 py-3 text-[0.95rem] leading-relaxed shadow-sm">
            {t('whatsapp.greeting')}
          </p>
          <a
            ref={start}
            href={href ?? `https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-whatsapp px-5 text-sm font-bold text-on-whatsapp transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98]"
          >
            <BrandIcon name="whatsapp" className="size-4.5" />
            {t('whatsapp.start')}
          </a>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        {/* Tooltip bubble */}
        {tooltip && !open && (
          <button
            type="button"
            onClick={openCard}
            className="wa-tooltip absolute inset-y-0 end-full my-auto me-3 h-fit w-max max-w-[min(15rem,calc(100vw-7rem))] rounded-[14px] border border-border bg-surface px-4 py-2.5 text-start text-sm font-bold text-text shadow-lg"
          >
            {t('whatsapp.tooltip')}
          </button>
        )}

        <button
          ref={toggle}
          type="button"
          onClick={() => (open ? setOpen(false) : openCard())}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="wa-fab relative inline-flex size-14 items-center justify-center rounded-pill bg-whatsapp text-on-whatsapp shadow-lg shadow-black/30 transition-transform duration-200 hover:scale-105"
        >
          {!open && <span aria-hidden="true" className="wa-pulse absolute inset-0 rounded-pill" />}
          {open ? <X aria-hidden="true" className="size-6" /> : <BrandIcon name="whatsapp" className="size-7" />}
          <span className="sr-only">{open ? t('misc.close') : t('whatsapp.open')}</span>
        </button>
      </div>
    </div>
  );
}
