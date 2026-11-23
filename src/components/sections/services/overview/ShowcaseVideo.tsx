'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { useIdleAfterLoad } from '@/lib/hooks/useExternal';
import { useInView } from '@/lib/hooks/useInView';
import { usePrefersReducedMotion } from '@/lib/motion/useReducedMotion';

/**
 * A discipline's hero loop over its cover: mounted after load + idle and only once the frame is near
 * the viewport (never competes with the LCP, no download for sections never reached), muted /
 * playsInline / loop, playing ONLY while in view (paused otherwise), fading in once it actually plays.
 * Reduced motion: none (the cover stays).
 */
export function ShowcaseVideo({ video, poster }: { video: MediaAsset; poster: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idle = useIdleAfterLoad();
  const reduced = usePrefersReducedMotion();
  const near = useInView(ref, { rootMargin: '200px 0px' });
  const visible = useInView(ref, { once: false, threshold: 0.25 });
  const [playing, setPlaying] = useState(false);
  const mount = idle && near && !reduced;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (visible) void el.play().catch(() => {});
    else el.pause();
  }, [visible, mount]);

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0">
      {mount && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700',
            playing && 'opacity-100',
          )}
          muted
          playsInline
          loop
          preload="metadata"
          poster={poster ?? undefined}
          onPlaying={() => setPlaying(true)}
        >
          <source src={video.url} type={video.mime} />
        </video>
      )}
    </div>
  );
}
