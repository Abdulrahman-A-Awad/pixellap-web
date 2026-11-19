'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect, type ReactNode } from 'react';

export const THEMES = ['dark', 'light'] as const;

/**
 * Keeps <meta name="theme-color"> (browser UI / status bar) on the active theme's --bg.
 * The server value is the dark default (viewport in [locale]/layout.tsx).
 */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (!bg) return;
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      meta.content = bg;
    });
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={[...THEMES]}
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
