'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import type { PointerState } from '@/components/three/PixelCubes';
import type { MediaAsset } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { detectTier, type Tier } from '@/lib/device';
import {
  useDocumentHidden,
  useFirstInteraction,
  useIdleAfterLoad,
  useMediaQuery,
  useThemeColors,
} from '@/lib/hooks/useExternal';
import { HeroPlaceholder } from './HeroPlaceholder';

// The 3D scene is never part of the initial route chunk and never server-rendered.
const PixelScene = dynamic(() => import('@/components/three/PixelScene'), { ssr: false });

interface SceneGateProps {
  poster: MediaAsset | null;
  video: MediaAsset | null;
  progress: RefObject<number>;
  pointer: RefObject<PointerState>;
  className?: string;
}

/** Cached per page load: detection creates a WebGL context, so run it once. */
const tierCache = new Map<boolean, Tier>();
function getTier(hasVideo: boolean): Tier {
  let tier = tierCache.get(hasVideo);
  if (!tier) {
    tier = detectTier({ hasVideo });
    tierCache.set(hasVideo, tier);
  }
  return tier;
}

/** Desktop: the cluster sits on the inline-end side, away from the copy. */
const DESKTOP_OFFSET = 5.8;

/**
 * Decides the hero tier on the client and renders the matching visual:
 * static (poster/mark) · video (CMS loop) · 3D scene (high / low).
 * The placeholder occupies the same box, so swapping causes no layout shift.
 */
export function SceneGate({ poster, video, progress, pointer, className }: SceneGateProps) {
  const hasVideo = Boolean(video);
  const detected = useSyncExternalStore(
    () => () => {},
    () => getTier(hasVideo),
    () => null,
  );
  const [declined, setDeclined] = useState(false);
  const tier: Tier | null = detected === 'high' && declined ? 'low' : detected;

  const colors = useThemeColors();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const hidden = useDocumentHidden();
  // Mount the scene only after load + idle: creating the WebGL context and compiling shaders
  // blocks the main thread, and must never delay the LCP (the server-rendered copy).
  const idle = useIdleAfterLoad();
  // Phones: the loop video waits for the first interaction, so it never becomes a late LCP.
  const interacted = useFirstInteraction();

  const box = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Pause rendering when the hero is off-screen.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '100px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onDecline = useCallback(() => setDeclined(true), []);

  const isScene = tier === 'high' || tier === 'low';
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const offsetX = desktop ? DESKTOP_OFFSET * (rtl ? -1 : 1) : 0;

  return (
    <div
      ref={box}
      className={cn('relative overflow-hidden', className)}
      data-tier={tier ?? 'pending'}
      data-frameloop={inView && !hidden ? 'always' : 'never'}
      data-ready={ready ? '' : undefined}
    >
      {/* Poster / mark: placeholder until the scene is ready, final visual for the static tier. */}
      <HeroPlaceholder
        poster={poster}
        shimmer={tier === null || (isScene && !ready)}
        className={cn('transition-opacity duration-700', isScene && ready && 'opacity-0')}
      />

      {/* Loaded after load + idle so it never competes with the LCP; the poster underneath
          (same frame) stays visible until the video actually plays — no second poster download. */}
      {tier === 'video' && video && idle && (desktop || interacted) && (
        <video
          className={cn(
            'absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700',
            videoPlaying && 'opacity-100',
          )}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          onPlaying={() => setVideoPlaying(true)}
          aria-hidden="true"
        >
          <source src={video.url} type={video.mime} />
        </video>
      )}

      {isScene && colors && idle && (
        <div className={cn('absolute inset-0 opacity-0 transition-opacity duration-1000', ready && 'opacity-100')}>
          <PixelScene
            tier={tier}
            theme={colors.theme}
            background={colors.bg}
            progress={progress}
            pointer={pointer}
            offsetX={offsetX}
            copySide={desktop ? (rtl ? 1 : -1) : 0}
            frameloop={inView && !hidden ? 'always' : 'never'}
            onReady={onReady}
            onDecline={onDecline}
          />
        </div>
      )}
    </div>
  );
}
