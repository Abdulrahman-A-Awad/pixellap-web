'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import type { PointerState } from '@/components/three/PixelCubes';
import type { HeroMedia } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { detectTier, type Tier } from '@/lib/device';
import { hasLoopVideo, pickVariant, VERTICAL_QUERY } from '@/lib/hero/media';
import {
  useDocumentHidden,
  useFirstInteraction,
  useHydrated,
  useIdleAfterLoad,
  useMediaQuery,
  useThemeColors,
} from '@/lib/hooks/useExternal';
import { FRAME_MEDIA_CLASS, HeroFrame } from './HeroFrame';
import { HeroPlaceholder } from './HeroPlaceholder';

// The 3D scene is never part of the initial route chunk and never server-rendered.
const loadScene = () => import('@/components/three/PixelScene');
const PixelScene = dynamic(loadScene, { ssr: false });

/**
 * Desktop with motion allowed: start downloading the scene chunk the moment this module is evaluated
 * (in parallel with hydration) so it is ready right after it. Acts as the modulepreload: Turbopack's
 * hashed chunk URLs are not known to the server HTML, so a <link rel=modulepreload> cannot be emitted.
 * Phones never prefetch here (they may get the video tier, and the LCP must stay the copy).
 */
const DESKTOP_SCENE_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
if (typeof window !== 'undefined' && window.matchMedia(DESKTOP_SCENE_QUERY).matches) void loadScene();

interface SceneGateProps {
  media: HeroMedia;
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
 * static (matching poster) | video (CMS loop, wide or vertical cut) | 3D scene (high / low).
 * The placeholder occupies the same box, so swapping causes no layout shift.
 */
export function SceneGate({ media, progress, pointer, className }: SceneGateProps) {
  const withVideo = hasLoopVideo(media);
  const detected = useSyncExternalStore(
    () => () => {},
    () => getTier(withVideo),
    () => null,
  );
  const [declined, setDeclined] = useState(false);
  const tier: Tier | null = detected === 'high' && declined ? 'low' : detected;

  const colors = useThemeColors();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const vertical = useMediaQuery(VERTICAL_QUERY);
  const hidden = useDocumentHidden();
  // Phones: mount the scene only after load + idle (creating the WebGL context blocks the main thread
  // and must never delay the LCP). Desktop: right after hydration — the poster covers the hero until
  // the first frame, and the chunk was already fetched during hydration (see loadScene above).
  const idle = useIdleAfterLoad();
  const hydrated = useHydrated();
  // Phones: posters / the loop video wait for the first interaction, so they never become a late LCP.
  const interacted = useFirstInteraction();

  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  // Which cut is actually playing (an orientation change mounts a new <video>).
  const [playingCut, setPlayingCut] = useState<string | null>(null);

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
  const isMedia = tier === 'video' || tier === 'static';
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const offsetX = desktop ? DESKTOP_OFFSET * (rtl ? -1 : 1) : 0;

  // Video / static tiers: the cut matching the screen (falls back to the other one).
  const picked = isMedia ? pickVariant(media, vertical ? 'vertical' : 'wide') : null;
  // Desktop: right away. Phones: after load + idle AND the first interaction (keeps the LCP on the copy).
  const mediaAllowed = desktop || (idle && interacted);
  const showFrame = Boolean(picked && mediaAllowed);
  const playVideo = showFrame && tier === 'video' && Boolean(picked?.variant.webm || picked?.variant.mp4);

  // Off-screen or background tab: pause the loop (saves battery and decoding).
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (inView && !hidden) void el.play().catch(() => {});
    else el.pause();
  }, [inView, hidden, playVideo]);

  return (
    <div
      ref={box}
      className={cn('relative overflow-hidden', className)}
      data-tier={tier ?? 'pending'}
      data-frameloop={inView && !hidden ? 'always' : 'never'}
      data-ready={ready ? '' : undefined}
    >
      {/* Poster / mark: placeholder until the scene or the media frame is there. */}
      <HeroPlaceholder
        poster={media.wide.poster}
        shimmer={tier === null || (isScene && !ready)}
        className={cn('transition-opacity duration-500', ((isScene && ready) || showFrame) && 'opacity-0')}
      />

      {showFrame && picked && (
        <HeroFrame
          key={picked.orientation}
          poster={picked.variant.poster}
          orientation={picked.orientation}
          className="hero-frame-in"
        >
          {playVideo && (
            <video
              ref={video}
              className={cn(
                'hero-frame-media absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700',
                FRAME_MEDIA_CLASS[picked.orientation],
                playingCut === picked.orientation && 'opacity-100',
              )}
              muted
              playsInline
              loop
              autoPlay
              preload="none"
              poster={picked.variant.poster ?? undefined}
              onPlaying={() => setPlayingCut(picked.orientation)}
              aria-hidden="true"
            >
              {picked.variant.webm && <source src={picked.variant.webm} type="video/webm" />}
              {picked.variant.mp4 && <source src={picked.variant.mp4} type="video/mp4" />}
            </video>
          )}
        </HeroFrame>
      )}

      {isScene && colors && (desktop ? hydrated : idle) && (
        <div className={cn('absolute inset-0 opacity-0 transition-opacity duration-500', ready && 'opacity-100')}>
          {/* Light theme: soft white → pearl backdrop with a lavender glow behind the cluster
              (the canvas is transparent there; globals.css .hero-light-backdrop). */}
          {colors.theme === 'light' && <div aria-hidden="true" className="hero-light-backdrop absolute inset-0" />}
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
