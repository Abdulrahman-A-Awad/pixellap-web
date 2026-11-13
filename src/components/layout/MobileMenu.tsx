'use client';

import { ArrowRight, X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Logo } from '@/components/brand/Logo';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { lockScroll } from '@/lib/motion/lenis';
import { LanguageSwitch } from './LanguageSwitch';
import { NAV_ITEMS, isActive } from './nav';
import { ThemeToggle } from './ThemeToggle';

const GRID_COLS = 8;
const GRID_ROWS = 12;
const EASE = [0.16, 1, 0.3, 1] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Full-screen menu: pixel-grid reveal, staggered links, focus trap, Esc closes, scroll locked. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { site, t } = useSite();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

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
              <div className="container-page flex h-18 items-center justify-between">
                <Logo variant="mark" height={34} alt={site.settings.site_name} />
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
                            'block py-2 text-heading transition-colors',
                            active ? 'text-link' : 'text-text hover:text-link',
                          )}
                        >
                          {t(item.label)}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                className="container-page flex flex-wrap items-center gap-2 pb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.4, delay: 0.55 }}
              >
                <Link href="/contact" onClick={onClose} className={buttonClasses('primary', 'w-full sm:w-auto')}>
                  {t('actions.start_project')}
                  <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                </Link>
                <LanguageSwitch onNavigate={onClose} />
                <ThemeToggle />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
