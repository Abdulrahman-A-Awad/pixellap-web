import type { HeroLoopVideo, HeroMedia } from '@/lib/api/types';

export type HeroOrientation = keyof HeroMedia;

/** Phones and portrait screens get the vertical cut. */
export const VERTICAL_QUERY = '(max-width: 767px), (orientation: portrait)';

export function hasVideo(variant: HeroLoopVideo | null | undefined): boolean {
  return Boolean(variant && (variant.webm || variant.mp4));
}

export function hasLoopVideo(media: HeroMedia): boolean {
  return hasVideo(media.wide) || hasVideo(media.vertical);
}

/**
 * The variant for the current orientation; falls back to the other orientation when the preferred
 * one has no video (or, for posters only, no poster). Null when nothing usable was uploaded.
 */
export function pickVariant(
  media: HeroMedia,
  preferred: HeroOrientation,
): { orientation: HeroOrientation; variant: HeroLoopVideo } | null {
  const other: HeroOrientation = preferred === 'wide' ? 'vertical' : 'wide';
  for (const orientation of [preferred, other]) {
    if (hasVideo(media[orientation])) return { orientation, variant: media[orientation] };
  }
  for (const orientation of [preferred, other]) {
    if (media[orientation].poster) return { orientation, variant: media[orientation] };
  }
  return null;
}
