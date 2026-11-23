import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { Reveal } from '@/components/motion/Reveal';
import { Link } from '@/i18n/navigation';
import type { Service } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { coverSizes, imageSource } from '@/lib/images';
import { CategoryIcon } from '../CategoryIcon';

type Kind = 'half' | 'wide' | 'featured';
interface Slot {
  service: Service;
  index: number;
  kind: Kind;
  /** Featured: media on the inline-end side (alternates). */
  flip: boolean;
  /** Position in its row (reveal stagger). */
  col: number;
}

/**
 * Lays the services out in DOM order (= reading order = the sticky nav order): cards WITH an image are
 * "featured" (full row, image + text side by side, alternating); the others pair up two per row. A
 * card that would be left alone in a row (before a featured card, or the last one) becomes "wide"
 * (full row, features in two columns) — so a row is never half empty, without reordering anything.
 */
export function layoutServices(services: Service[]): Slot[] {
  const slots: Slot[] = [];
  let pending: Slot | null = null;
  let featured = 0;
  const flushAlone = () => {
    if (pending) {
      pending.kind = 'wide';
      pending.col = 0;
      pending = null;
    }
  };
  services.forEach((service, index) => {
    if (service.image) {
      flushAlone();
      slots.push({ service, index, kind: 'featured', flip: featured++ % 2 === 1, col: 0 });
      return;
    }
    if (pending) {
      slots.push({ service, index, kind: 'half', flip: false, col: 1 });
      pending = null;
    } else {
      const slot: Slot = { service, index, kind: 'half', flip: false, col: 0 };
      slots.push(slot);
      pending = slot;
    }
  });
  flushAlone();
  return slots;
}

function Features({ features, wide }: { features: string[]; wide: boolean }) {
  if (features.length === 0) return null;
  return (
    <ul className={cn('grid gap-x-6 gap-y-2.5', wide && 'sm:grid-cols-2')}>
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <span aria-hidden="true" className="pixel-bullet mt-[0.55em] shrink-0" />
          <span className="text-pretty">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The category's services: 2 columns from md, 1 on phones; featured (image) cards span the row with
 * the image beside the text (stacked on phones), wide cards span the row. Card: pixel index, icon chip,
 * title, description, features with pixel bullets, "Request this service" (→ /contact?service=&item=).
 * Equal heights per row (grid stretch). Each card carries its stable API anchor as id (offset for both
 * sticky bars; `[data-pulse]` highlight when navigated to). Image frames always paint the `thumb`
 * conversion + surface colour first, so a lazy image is never an empty box while it loads.
 */
export function ServiceGrid({
  services,
  categorySlug,
  requestLabel,
}: {
  services: Service[];
  categorySlug: string;
  requestLabel: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
      {layoutServices(services).map(({ service, index, kind, flip, col }) => {
        const id = service.anchor;
        const image = service.image;
        const wideRow = kind !== 'half';
        const head = (
          <>
            <div className="flex items-center justify-between gap-4">
              <PixelDigits value={String(index + 1).padStart(2, '0')} cell={4} className="text-link" />
              <CategoryIcon icon={service.icon} index={index + 2} size="sm" />
            </div>
            <h3 id={`${id}-title`} className="text-title text-balance">
              {service.title}
            </h3>
            <p className={cn('text-pretty text-muted', wideRow && 'measure')}>{service.description}</p>
          </>
        );
        const request = (
          <Link
            href={{ pathname: '/contact', query: { service: categorySlug, item: service.title } }}
            className="group mt-auto inline-flex min-h-11 items-center gap-2 pt-2 text-meta font-bold text-link"
          >
            {requestLabel}
            <span className="sr-only">: {service.title}</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            />
          </Link>
        );

        return (
          <Reveal key={service.id} index={col} className={cn('min-w-0', wideRow && 'md:col-span-2')}>
            <article
              id={id}
              tabIndex={-1}
              aria-labelledby={`${id}-title`}
              className={cn(
                'svc-card surface-card glow-card h-full overflow-clip outline-none',
                kind === 'featured' && 'grid lg:grid-cols-2',
              )}
            >
              {kind === 'featured' && image && (
                <div
                  className={cn(
                    'svc-card-media relative aspect-[16/10] bg-surface-2 lg:aspect-auto lg:min-h-[22rem]',
                    flip && 'lg:order-last',
                  )}
                  style={
                    image.conversions?.thumb
                      ? ({ backgroundImage: `url(${image.conversions.thumb})` } as CSSProperties)
                      : undefined
                  }
                >
                  <Image
                    src={imageSource(image)}
                    alt={image.alt}
                    fill
                    sizes={coverSizes(image, [
                      // Half of the 1280px container on desktop (box ~ 600×tall), full width below.
                      { media: '(min-width: 1280px)', width: 616, unit: 'px', boxRatio: 1.25 },
                      { media: '(min-width: 1024px)', width: 47, unit: 'vw', boxRatio: 1.25 },
                      { media: null, width: 92, unit: 'vw', boxRatio: 1.6 },
                    ])}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex h-full flex-col gap-4 p-6 md:p-8">
                {head}
                <Features features={service.features} wide={kind === 'wide'} />
                {request}
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
