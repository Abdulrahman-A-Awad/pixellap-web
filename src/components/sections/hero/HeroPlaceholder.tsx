import Image from 'next/image';
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
 * What the hero shows before (or instead of) the 3D scene. Server-renderable, no layout shift.
 * - Dark theme: the CMS poster (first frame of the loop video) — on desktop it sits on the
 *   inline-end half like the 3D cluster, fading towards the copy.
 * - Light theme, or no poster: the brand mark from the logo grid (the poster is a dark frame).
 * `shimmer` adds a soft pixel pulse while the scene loads.
 */
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

  return (
    <div className={cn('absolute inset-0', className)}>
      <div className="hero-poster-mask absolute inset-0 lg:start-auto lg:w-[58%] light:hidden">
        <Image
          src={poster.conversions?.lg ?? poster.url}
          alt=""
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className={cn('object-cover', shimmer && 'motion-safe:animate-pulse')}
          // The poster is the LCP on phones (video tier): fetch it first (Next 16: not `priority`).
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <MarkSvg shimmer={shimmer} className="hidden light:flex" />
    </div>
  );
}
