'use client';

import { useTheme } from 'next-themes';
import { useId } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import { cn } from '@/lib/cn';

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Sun in dark mode (→ switch to light), moon in light mode — ONE svg that morphs (`.theme-icon`,
 * globals.css): the core grows and a masked circle slides in to cut the crescent while the rays
 * rotate and shrink away. Driven by the theme class on <html>, so there is no hydration flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useSite();
  const maskId = `theme-cut-${useId().replace(/:/g, '')}`;

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-pill text-text transition-colors duration-200 hover:bg-surface-2',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon size-5 overflow-visible">
        <mask id={maskId}>
          <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
          <circle className="theme-icon-cut" cx="12" cy="12" r="7.5" fill="#000" />
        </mask>
        <circle className="theme-icon-core" cx="12" cy="12" r="9" fill="currentColor" mask={`url(#${maskId})`} />
        <g className="theme-icon-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {RAYS.map((deg) => (
            <line key={deg} x1="12" y1="1.5" x2="12" y2="3.5" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      </svg>
      <span className="sr-only light:hidden">{t('misc.theme_light')}</span>
      <span className="sr-only hidden light:inline">{t('misc.theme_dark')}</span>
    </button>
  );
}
