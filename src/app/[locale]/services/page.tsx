import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/PageHero';
import { Link } from '@/i18n/navigation';
import { resolveLocale } from '@/i18n/locale';
import { getCategories, getPage } from '@/lib/api/endpoints';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { data: page } = await getPage('services', locale);
  return buildMetadata({
    locale,
    path: '/services',
    title: page.seo.title,
    description: page.seo.description,
    image: page.hero?.conversions?.lg ?? page.hero?.url,
  });
}

/** Placeholder: the real services index comes in the next prompts. */
export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const locale = await resolveLocale(params);
  const [{ data: page }, { data: categories }] = await Promise.all([
    getPage('services', locale),
    getCategories(locale),
  ]);

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} seed={5} />
      <section className="container-page">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/services/${category.slug}`}
                className="group flex h-full flex-col gap-2 rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary"
              >
                <span className="font-medium">{category.title}</span>
                <span className="text-sm text-muted">{category.excerpt}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm text-link">
                  {category.services_count}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
