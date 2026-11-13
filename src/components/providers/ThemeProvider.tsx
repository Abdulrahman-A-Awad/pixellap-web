'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

export const THEMES = ['dark', 'light'] as const;

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={[...THEMES]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
