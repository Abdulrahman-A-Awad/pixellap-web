import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/site-url';

export interface Crumb {
  label: string;
  /** Path without locale ("/services"); omit for the current page. */
  href?: string;
}

/** Visible breadcrumb trail + BreadcrumbList structured data. */
export function Breadcrumbs({ items, locale, label }: { items: Crumb[]; locale: string; label: string }) {
  const url = (href: string) => `${SITE_URL}/${locale}${href === '/' ? '' : href}`;

  return (
    <>
      <nav aria-label={label}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden="true" className="size-3.5 opacity-60 rtl:-scale-x-100" />}
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-text">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-text">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: url(item.href) } : {}),
          })),
        }}
      />
    </>
  );
}
