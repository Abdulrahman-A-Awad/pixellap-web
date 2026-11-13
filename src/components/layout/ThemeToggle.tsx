'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSite } from '@/components/providers/SiteProvider';
import { cn } from '@/lib/cn';

/**
 * Sun in dark mode (→ switch to light), moon in light mode.
 * Icons and labels switch through CSS theme variants, so no hydration flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useSite();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-pill text-text transition-colors hover:bg-surface-2',
        className,
      )}
    >
      <Sun aria-hidden="true" className="size-5 light:hidden" />
      <Moon aria-hidden="true" className="hidden size-5 light:block" />
      <span className="sr-only light:hidden">{t('misc.theme_light')}</span>
      <span className="sr-only hidden light:inline">{t('misc.theme_dark')}</span>
    </button>
  );
}
