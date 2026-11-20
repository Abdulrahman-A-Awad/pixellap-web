import type { ReactNode } from 'react';
import type { HeroOrientation } from '@/lib/hero/media';
import { cn } from '@/lib/cn';

/**
 * object-fit: cover, anchored on the cube, so whatever cover trims is empty black
 * (see `.hero-frame` in globals.css).
 */
export const FRAME_MEDIA_CLASS: Record<HeroOrientation, string> = {
  // Wide: cube on the right → mirrored in RTL (the clean cut has no text) so it stays on the
  // inline-end side, away from the copy.
  wide: 'object-[100%_50%] rtl:-scale-x-100',
  // Vertical: cube in the lower half.
  vertical: 'object-[50%_100%]',
};

/**
 * The box the hero poster / loop video lives in (no hooks, renders on the server too).
 * Dark: edge-masked so the video's own black melts into --bg. Light: a rounded dark "stage" card.
 * Sizing rules: `.hero-frame` in globals.css.
 */
export function HeroFrame({
  poster,
  orientation,
  loading = 'eager',
  className,
  children,
}: {
  poster: string | null;
  orientation: HeroOrientation;
  /** 'lazy' when the frame may be display:none (then it is never downloaded). */
  loading?: 'eager' | 'lazy';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn('hero-frame', `hero-frame-${orientation}`, className)}>
      {poster && (
        // Pre-sized WebP frame (≤ 1 MB, usually ~25 KB) served as uploaded: the <video poster>
        // uses the same URL, so it is downloaded once.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          loading={loading}
          decoding="async"
          className={cn('hero-frame-media absolute inset-0 size-full object-cover', FRAME_MEDIA_CLASS[orientation])}
        />
      )}
      {children}
    </div>
  );
}
