'use client';

import { useState } from 'react';
import type { MediaAsset } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { useIdleAfterLoad, useMediaQuery } from '@/lib/hooks/useExternal';
import { usePrefersReducedMotion } from '@/lib/motion/useReducedMotion';

/**
 * Category hero loop: desktop only, mounted after load + idle (never competes with the LCP),
 * muted/playsInline/loop, fades in over the cover once it actually plays. Reduced motion: none.
 */
export function CategoryVideo({ video, poster }: { video: MediaAsset; poster: string | null }) {
  const desktop = useMediaQuery('(min-width: 1024px)');
  const idle = useIdleAfterLoad();
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);

  if (!desktop || !idle || reduced) return null;

  return (
    <video
      className={cn(
        'absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700',
        playing && 'opacity-100',
      )}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      poster={poster ?? undefined}
      onPlaying={() => setPlaying(true)}
      aria-hidden="true"
    >
      <source src={video.url} type={video.mime} />
    </video>
  );
}
