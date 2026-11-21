'use client';

import { ArrowRight, X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Logo } from '@/components/brand/Logo';
import { BrandIcon } from '@/components/brand/BrandIcons';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { lockScroll } from '@/lib/motion/lenis';
import { whatsappUrl } from '@/lib/site/settings';
import { LanguageSwitch } from './LanguageSwitch';
import { NAV_ITEMS, isActive } from './nav';
import { ThemeToggle } from './ThemeToggle';

const GRID_COLS = 8;
const GRID_ROWS = 12;
const EASE = [0.16, 1, 0.3, 1] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen menu sheet (≤ 1023px): pixel-grid reveal, large staggered links, then the CTA +
 * WhatsApp buttons and the language pill + theme toggle at the bottom. Focus trap, Esc / close
 * button, body scroll locked.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { site, t } = useSite();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const whatsapp = whatsappUrl(site.settings);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      lockScroll(false);
    };
  }, [open]);

  const cells = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => i);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('misc.menu')}
            data-lenis-prevent
            className="fixed inset-0 z-50 overflow-y-auto lg:hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.15 } }}
          >
            {/* Solid sheet under the grid once it has filled in (hides sub-pixel seams between cells). */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-surface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.45 } }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
            />
            {/* Pixel-grid reveal */}
            <div
              aria-hidden="true"
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              }}
            >
              {cells.map((i) => {
                const col = i % GRID_COLS;
                const row = Math.floor(i / GRID_COLS);
                return (
                  <motion.span
                    key={i}
                    className="bg-surface"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.02, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE, delay: (row + col) * 0.018 }}
                  />
                );
              })}
            </div>

            <div className="relative flex min-h-full flex-col">
              <div className="container-page flex h-(--header-h) items-center justify-between">
                <Logo variant="horizontal" height={32} alt={site.settings.site_name} />
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex size-11 items-center justify-center rounded-pill hover:bg-surface-2"
                >
                  <X aria-hidden="true" className="size-6" />
                  <span className="sr-only">{t('misc.close')}</span>
                </button>
              </div>

              <nav aria-label={t('misc.main_navigation')} className="container-page flex-1 py-8">
                <ul className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item, index) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.25 + index * 0.07 }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-4 py-2.5 text-[clamp(2rem,8vw,2.75rem)] leading-tight font-bold transition-colors',
                            active ? 'text-link' : 'text-text hover:text-link',
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              'size-2.5 rounded-[3px] transition-colors',
                              active ? 'bg-primary' : 'bg-border',
                            )}
                          />
                          {t(item.label)}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                className="container-page flex flex-col gap-6 pb-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.25 + NAV_ITEMS.length * 0.07 }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/contact" onClick={onClose} className={buttonClasses('primary', 'w-full')}>
                    {t('actions.start_project')}
                    <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                  </Link>
                  {whatsapp && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses('outline', 'w-full')}
                    >
                      <BrandIcon name="whatsapp" className="size-4.5 text-whatsapp" />
                      {t('contact.whatsapp')}
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
                  <LanguageSwitch onNavigate={onClose} />
                  <ThemeToggle className="border border-border" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
