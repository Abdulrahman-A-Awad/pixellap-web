import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/PageHero';
import { resolveLocale } from '@/i18n/locale';
import { routing } from '@/i18n/routing';
import { getCategories, getCategory } from '@/lib/api/endpoints';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateStaticParams() {
  // Slugs are shared by both locales.
  const { data } = await getCategories(routing.defaultLocale);
  return data.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const { data: category } = await getCategory(slug, locale); // 404 → notFound()
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: category.seo.title ?? category.title,
    description: category.seo.description ?? category.excerpt,
    image: category.cover?.conversions?.lg ?? category.cover?.url,
  });
}

/** Placeholder: the real category page comes in the next prompts. */
export default async function CategoryPage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const { data: category } = await getCategory(slug, locale);

  return (
    <>
      <PageHero title={category.title} subtitle={category.excerpt} seed={slug.length} />
      <section className="container-page">
        <ul className="grid gap-3 sm:grid-cols-2">
          {category.services.map((service) => (
            <li key={service.id} className="rounded-card border border-border bg-surface p-5">
              <p className="font-medium">{service.title}</p>
              <p className="mt-1 text-sm text-muted">{service.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
