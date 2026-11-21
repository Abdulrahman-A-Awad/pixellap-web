'use client';

import { ArrowRight, Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { LanguageSwitch } from './LanguageSwitch';
import { NavLinks } from './NavLinks';
import { ThemeToggle } from './ThemeToggle';

// Loaded on first use: keeps Motion out of the initial bundle.
const loadMobileMenu = () => import('./MobileMenu').then((m) => m.MobileMenu);
const MobileMenu = dynamic(loadMobileMenu, { ssr: false });

const SOLID_AFTER = 24; // px
const HIDE_AFTER = 120; // px — never hide near the top

export function Header() {
  const { site, t } = useSite();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Transparent at the top → blurred surface after 24px. Hide on scroll down, show on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setSolid(y > SOLID_AFTER);
      if (Math.abs(y - lastY) > 4) {
        setHidden(y > lastY && y > HIDE_AFTER);
        lastY = y;
      }
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
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b transition-[transform,background-color,border-color,backdrop-filter] duration-300 ease-out-expo',
          solid ? 'border-border bg-bg/85 backdrop-blur-xl backdrop-saturate-150' : 'border-transparent bg-transparent',
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div className="header-in container-page flex h-(--header-h) items-center gap-4">
          <Link href="/" className="me-auto inline-flex items-center rounded-md" aria-label={siteName}>
            <Logo variant="horizontal" height={40} alt={siteName} priority className="hidden lg:inline-flex" />
            <Logo variant="horizontal" height={32} alt={siteName} priority className="lg:hidden" />
          </Link>

          <nav aria-label={t('misc.main_navigation')} className="hidden lg:block">
            <NavLinks />
          </nav>

          {/* Phones/tablets: theme + menu only; language and the CTA live in the menu sheet. */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitch className="hidden lg:inline-grid" />
            <ThemeToggle />
            <Link href="/contact" className={buttonClasses('primary', 'ms-1.5 hidden lg:inline-flex')}>
              {t('actions.start_project')}
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </Link>
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
              className="inline-flex size-11 items-center justify-center rounded-pill hover:bg-surface-2 lg:hidden"
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
