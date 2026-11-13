import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/PageHero';
import { resolveLocale } from '@/i18n/locale';
import { getHome, getSite } from '@/lib/api/endpoints';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return buildMetadata({ locale, path: '/' });
}

/** Placeholder: real home sections come in the next prompts. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await resolveLocale(params);
  const [{ data: sections }, { data: site }] = await Promise.all([getHome(locale), getSite(locale)]);

  return (
    <>
      <PageHero title={site.settings.tagline} subtitle={site.settings.seo_default_description} seed={1} />
      <section className="container-page">
        <ol className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
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
