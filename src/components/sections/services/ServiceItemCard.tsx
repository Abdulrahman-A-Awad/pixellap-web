import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { Link } from '@/i18n/navigation';
import type { Service } from '@/lib/api/types';
import { CategoryIcon } from './CategoryIcon';

/** One sub-service: number, icon, title, description, features checklist, image, request link. */
export function ServiceItemCard({
  service,
  index,
  categorySlug,
  requestLabel,
}: {
  service: Service;
  index: number;
  categorySlug: string;
  requestLabel: string;
}) {
  // Stable anchor from the API (slugified English title): /services/{slug}#{anchor} deep links.
  const id = service.anchor;

  return (
    <article
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      data-reveal
      className="scroll-mt-32 rounded-card border border-border bg-surface p-6 outline-none focus-visible:border-primary md:p-10"
    >
      <div className="flex items-center justify-between gap-4">
        <PixelDigits value={String(index + 1).padStart(2, '0')} cell={4} className="text-link" />
        <CategoryIcon icon={service.icon} index={index + 2} size="sm" />
      </div>

      <h3 id={`${id}-title`} className="mt-6 text-2xl font-bold text-balance md:text-3xl">
        {service.title}
      </h3>
      <p className="mt-3 max-w-prose text-lg text-pretty text-muted">{service.description}</p>

      {service.features.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              {/* Pixel bullet: 2×2 brand squares. */}
              <span aria-hidden="true" className="mt-2 grid shrink-0 grid-cols-2 gap-px">
                <span className="size-1.5 rounded-[1px] bg-lavender" />
                <span className="size-1.5 rounded-[1px] bg-iris" />
                <span className="size-1.5 rounded-[1px] bg-iris" />
                <span className="size-1.5 rounded-[1px] bg-royal" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {service.image && (
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-xl border border-border">
          <Image
            src={service.image.conversions?.lg ?? service.image.url}
            alt={service.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <Link
        href={{ pathname: '/contact', query: { service: categorySlug, item: service.title } }}
        className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-link"
      >
        {requestLabel}
        <span className="sr-only">: {service.title}</span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
        />
      </Link>
    </article>
  );
}
