import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { Suspense } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { HeaderFallback } from '@/components/layout/HeaderFallback';
import { MAIN_ID, SkipLink } from '@/components/layout/SkipLink';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { SiteProvider } from '@/components/providers/SiteProvider';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { resolveLocale } from '@/i18n/locale';
import { isRtl, routing } from '@/i18n/routing';
import { getSite } from '@/lib/api/endpoints';
import { buildMetadata } from '@/lib/seo/metadata';
import { createTranslator } from '@/lib/site/translate';
import { fontSans } from '@/styles/fonts';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return buildMetadata({ locale, path: '/' });
}

export const viewport: Viewport = {
  themeColor: [{ color: '#06030F' }],
  colorScheme: 'dark light',
};

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const locale = await resolveLocale(params);
  const { data: site } = await getSite(locale);
  const t = createTranslator(site.ui_strings);

  return (
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'} className={fontSans.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={{}}>
            <SiteProvider site={site} locale={locale}>
              <SmoothScroll />
              <SkipLink label={t('misc.skip_to_content')} />
              {/* Header reads usePathname(): request-time on routes with unknown params. */}
              <Suspense fallback={<HeaderFallback siteName={site.settings.site_name} />}>
                <Header />
              </Suspense>
              <main id={MAIN_ID} tabIndex={-1} className="outline-none">
                {children}
              </main>
              <Footer site={site} t={t} />
              <WhatsAppButton />
            </SiteProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
