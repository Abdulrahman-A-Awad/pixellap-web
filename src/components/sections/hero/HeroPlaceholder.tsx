import { preload } from 'react-dom';
import { LOGO_CELLS, LOGO_GRID_SIZE } from '@/lib/brand/logoGrid';
import { cn } from '@/lib/cn';
import { HeroFrame } from './HeroFrame';

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
 * What the hero shows before (or instead of) the 3D scene / loop video. Server-rendered, no layout shift.
 *
 * - Phones: always the inline-SVG brand mark. SVG shapes are not LCP candidates, so the
 *   headline stays the LCP; posters/videos only arrive after the first interaction (SceneGate).
 * - Desktop, dark theme: the wide poster (first frame of the loop video) in the hero frame —
 *   high-priority preload scoped to desktop widths.
 * - Desktop, light theme or no poster: the brand mark (the light stage card comes with the video tier).
 * `shimmer` adds a soft pixel pulse while the scene loads.
 */
export function HeroPlaceholder({
  poster,
  shimmer,
  className,
}: {
  /** Wide poster URL. */
  poster: string | null;
  shimmer: boolean;
  className?: string;
}) {
  if (!poster) return <MarkSvg shimmer={shimmer} className={cn('flex', className)} />;

  // Desktop only: same URL as the <img> / <video poster>, so it is fetched once.
  preload(poster, { as: 'image', fetchPriority: 'high', media: '(min-width: 1024px)' });

  return (
    <div className={cn('absolute inset-0', className)}>
      {/* display:none + loading="lazy" on phones and in light mode → never downloaded there. */}
      <HeroFrame
        poster={poster}
        orientation="wide"
        loading="lazy"
        className={cn('hidden lg:block light:hidden', shimmer && 'motion-safe:animate-pulse')}
      />
      <MarkSvg shimmer={shimmer} className="flex lg:hidden light:lg:flex" />
    </div>
  );
}
