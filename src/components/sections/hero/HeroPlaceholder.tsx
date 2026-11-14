import Image, { getImageProps } from 'next/image';
import { preload } from 'react-dom';
import type { MediaAsset } from '@/lib/api/types';
import { LOGO_CELLS, LOGO_GRID_SIZE } from '@/lib/brand/logoGrid';
import { cn } from '@/lib/cn';

/** The brand mark drawn from the logo grid (theme-independent brand colours). */
function MarkSvg({ shimmer, className }: { shimmer: boolean; className?: string }) {
  const cell = 100 / LOGO_GRID_SIZE;
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0 items-center justify-center lg:justify-end lg:pe-[8%] xl:pe-[12%]', className)}
    >
      <svg viewBox="0 0 100 100" className="aspect-square w-[min(58vw,22rem)] lg:w-[min(30vw,26rem)]">
        {LOGO_CELLS.map((c, i) => (
          <rect
            key={`${c.col}-${c.row}`}
            x={c.col * cell + 0.6}
            y={c.row * cell + 0.6}
            width={cell - 1.2}
            height={cell - 1.2}
            rx={1.4}
            fill={c.color}
            className={shimmer ? 'hero-pixel-shimmer' : undefined}
            style={shimmer ? { animationDelay: `${(i % 7) * 90}ms` } : undefined}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * What the hero shows before (or instead of) the 3D scene. Server-rendered, no layout shift.
 *
 * - Phones: always the inline-SVG brand mark. SVG shapes are not LCP candidates, so the
 *   headline stays the LCP; the poster/video only arrive after the first interaction (SceneGate).
 * - Desktop, dark theme: the CMS poster (first frame of the loop video) on the inline-end half,
 *   fading towards the copy — high-priority preload scoped to desktop widths.
 * - Desktop, light theme (the poster is a dark frame) or no poster: the brand mark.
 * `shimmer` adds a soft pixel pulse while the scene loads.
 */
const POSTER_SIZES = '(min-width: 1024px) 58vw, 100vw';

export function HeroPlaceholder({
  poster,
  shimmer,
  className,
}: {
  poster: MediaAsset | null;
  shimmer: boolean;
  className?: string;
}) {
  if (!poster) return <MarkSvg shimmer={shimmer} className={cn('flex', className)} />;

  const src = poster.conversions?.lg ?? poster.url;
  const sizes = POSTER_SIZES;

  // Desktop only: high-priority preload (media-scoped, same srcset → the <img> reuses it).
  const { props } = getImageProps({ src, alt: '', fill: true, sizes });
  preload(props.src, {
    as: 'image',
    fetchPriority: 'high',
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    media: '(min-width: 1024px)',
  });

  return (
    <div className={cn('absolute inset-0', className)}>
      {/* display:none + loading="lazy" on phones → never downloaded there. */}
      <div className="hero-poster-mask absolute inset-0 hidden lg:start-auto lg:block lg:w-[58%] light:hidden">
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          loading="lazy"
          fetchPriority="low"
          className={cn('object-cover', shimmer && 'motion-safe:animate-pulse')}
        />
      </div>
      <MarkSvg shimmer={shimmer} className="flex lg:hidden light:lg:flex" />
    </div>
  );
}
