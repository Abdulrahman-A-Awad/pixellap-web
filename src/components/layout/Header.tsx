'use client';

import { ArrowRight, Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { LanguageSwitch } from './LanguageSwitch';
import { NAV_ITEMS, isActive } from './nav';
import { ThemeToggle } from './ThemeToggle';

// Loaded on first use: keeps Motion out of the initial bundle.
const loadMobileMenu = () => import('./MobileMenu').then((m) => m.MobileMenu);
const MobileMenu = dynamic(loadMobileMenu, { ssr: false });

const SOLID_AFTER = 24; // px
const HIDE_AFTER = 120; // px — never hide near the top

export function Header() {
  const { site, t } = useSite();
  const pathname = usePathname();
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
        <div className="container-page flex h-18 items-center gap-4 md:h-19">
          <Link href="/" className="me-auto inline-flex items-center rounded-md" aria-label={siteName}>
            <Logo variant="horizontal" height={40} alt={siteName} priority className="hidden md:inline-flex" />
            <Logo variant="horizontal" height={32} alt={siteName} priority className="md:hidden" />
          </Link>

          <nav aria-label={t('misc.main_navigation')} className="hidden lg:block">
            <ul className="flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative inline-flex min-h-11 items-center rounded-pill px-4 text-[0.95rem] transition-colors',
                        active ? 'text-text' : 'text-muted hover:text-text',
                      )}
                    >
                      {t(item.label)}
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-4 bottom-1.5 h-0.5 rounded-pill bg-primary"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitch />
            <ThemeToggle />
            <Link href="/contact" className={buttonClasses('primary', 'ms-2 hidden md:inline-flex')}>
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
