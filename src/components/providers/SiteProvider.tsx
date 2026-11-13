'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Locale, Site } from '@/lib/api/types';
import { createTranslator, type Translate } from '@/lib/site/translate';

interface SiteContextValue {
  site: Site;
  locale: Locale;
  t: Translate;
}

const SiteContext = createContext<SiteContextValue | null>(null);

/** Fed by getSite(locale) in the locale layout. */
export function SiteProvider({ site, locale, children }: { site: Site; locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ site, locale, t: createTranslator(site.ui_strings) }), [site, locale]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** Site settings, nav, locale and `t(key, fallback?)` over ui_strings. */
export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite() must be used inside <SiteProvider>.');
  return ctx;
}
