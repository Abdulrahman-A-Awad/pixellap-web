import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/PageHero';
import { resolveLocale } from '@/i18n/locale';
import { getPage } from '@/lib/api/endpoints';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: page } = await getPage('about', locale);
  return buildMetadata({
    locale,
    path: '/about',
    title: page.seo.title,
    description: page.seo.description,
    image: page.hero?.conversions?.lg ?? page.hero?.url,
  });
}

/** Placeholder: real blocks come in the next prompts. */
export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const locale = await resolveLocale(params);
  const { data: page } = await getPage('about', locale);

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} seed={3} />
      <section className="container-page">
        <ol className="grid gap-3 sm:grid-cols-2">
          {page.blocks.map((block) => (
            <li key={block.id} className="rounded-card border border-border bg-surface p-5">
              <p className="font-mono text-xs text-link">{block.type}</p>
              <p className="mt-1 font-medium">{block.title}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
