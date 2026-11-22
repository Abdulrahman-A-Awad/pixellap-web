'use client';

import { ArrowRight, Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { Link } from '@/i18n/navigation';
import { LanguageSwitch } from './LanguageSwitch';
import { NavLinks } from './NavLinks';
import { ThemeToggle } from './ThemeToggle';

// Loaded on first use: keeps Motion out of the initial bundle.
const loadMobileMenu = () => import('./MobileMenu').then((m) => m.MobileMenu);
const MobileMenu = dynamic(loadMobileMenu, { ssr: false });

const COMPACT_AFTER = 24; // px

/**
 * Floating glass navbar (iOS style): a centred pill (max 1200px, 12px from the top), translucent
 * surface + backdrop blur/saturate, hairline border, soft shadow — ALWAYS visible. After 24px of
 * scroll it compacts (64 → 56px desktop, 56 → 52px phones) with a spring (CSS, globals.css
 * `.nav-pill`). `--header-h` = the space it occupies, so offsets never change while it compacts.
 * Phones/tablets: logo + theme + menu; the menu opens as a glass sheet (MobileMenu, lazy).
 */
export function Header() {
  const { site, t } = useSite();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setCompact(window.scrollY > COMPACT_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const siteName = site.settings.site_name;

  return (
    <>
      <header data-header className="nav-shell" data-compact={compact ? '' : undefined}>
        <div data-nav-pill className="nav-pill header-in flex items-center gap-3 ps-5 pe-2 lg:gap-4 lg:ps-6">
          <Link href="/" className="me-auto inline-flex items-center rounded-md" aria-label={siteName}>
            <Logo variant="horizontal" height={36} alt={siteName} priority className="hidden lg:inline-flex" />
            <Logo variant="horizontal" height={30} alt={siteName} priority className="lg:hidden" />
          </Link>

          <nav aria-label={t('misc.main_navigation')} className="hidden lg:block">
            <NavLinks />
          </nav>

          {/* Phones/tablets: theme + menu only; language and the CTA live in the menu sheet. */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitch className="hidden lg:inline-grid" />
            <ThemeToggle />
            <Magnetic className="ms-1.5 hidden lg:inline-flex">
              <Link href="/contact" className={buttonClasses('primary')}>
                {t('actions.start_project')}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </Link>
            </Magnetic>
            <button
              ref={menuButtonRef}
              type="button"
              onPointerDown={() => void loadMobileMenu()}
              onFocus={() => void loadMobileMenu()}
              onClick={() => {
                setMenuLoaded(true);
                setMenuOpen(true);
              }}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="btn-press inline-flex size-11 items-center justify-center rounded-pill hover:bg-surface-2 lg:hidden"
            >
              <Menu aria-hidden="true" className="size-6" />
              <span className="sr-only">{t('misc.menu')}</span>
            </button>
          </div>
        </div>
      </header>

      {menuLoaded && (
        <MobileMenu
          open={menuOpen}
          onClose={() => {
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
        />
      )}
    </>
  );
}
