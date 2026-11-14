import type { Metadata } from 'next';
import { Hero } from '@/components/sections/hero/Hero';
import { resolveLocale } from '@/i18n/locale';
import { getHome, getSite } from '@/lib/api/endpoints';
import type { HeroSection, StatsSection } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';
import { createTranslator } from '@/lib/site/translate';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: sections } = await getHome(locale);
  const hero = sections.find((s): s is HeroSection => s.key === 'hero');
  return buildMetadata({ locale, path: '/', image: hero?.image?.conversions?.lg ?? hero?.image?.url });
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await resolveLocale(params);
  const [{ data: sections }, { data: site }] = await Promise.all([getHome(locale), getSite(locale)]);
  const t = createTranslator(site.ui_strings);

  const hero = sections.find((s): s is HeroSection => s.key === 'hero');
  const stats = sections.find((s): s is StatsSection => s.key === 'stats')?.items ?? [];
  const rest = sections.filter((s) => s.key !== 'hero');

  return (
    <>
      {hero && <Hero hero={hero} stats={stats} settings={site.settings} t={t} />}

      {/* Placeholder: the remaining home sections come in the next prompts. */}
      <section className="container-page pt-24">
        <ol className="grid gap-3 sm:grid-cols-2">
          {rest.map((section) => (
            <li key={section.key} className="rounded-card border border-border bg-surface p-5">
              <p className="font-mono text-xs text-link">{section.key}</p>
              <p className="mt-1 font-medium">{section.title}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
