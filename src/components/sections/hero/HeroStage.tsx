'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { PointerState } from '@/components/three/PixelCubes';
import type { MediaAsset } from '@/lib/api/types';
import { useIdleAfterLoad } from '@/lib/hooks/useExternal';
import { HERO_TITLE_ID } from './ids';
import { SceneGate } from './SceneGate';

interface HeroStageProps {
  poster: MediaAsset | null;
  video: MediaAsset | null;
  children: ReactNode;
}

/**
 * Pinned hero (desktop, motion allowed): the section is 100svh + 150svh of scroll; the inner
 * stage is `position: sticky` (no pin-spacer, plays well with Lenis). One scrubbed ScrollTrigger
 * writes `progress` (0→1) for the scene and hands the copy over to the next section at 0.85–1.
 * Mobile: scene (60svh) above the copy, normal flow; progress still follows the scroll.
 */
export function HeroStage({ poster, video, children }: HeroStageProps) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = useRef<PointerState>({ x: 0, y: 0, lastMove: 0 });

  // GSAP is loaded after load + idle (it is not needed for the first paint; the scene itself
  // only mounts after idle). One scrubbed timeline drives `progress` and the copy hand-over.
  const idle = useIdleAfterLoad();
  useEffect(() => {
    const el = section.current;
    if (!idle || !el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const proxy = { p: 0 };
      const copy = el.querySelector('[data-hero-copy]');
      const mm = gsap.matchMedia();

      mm.add(
        {
          pinned: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          flow: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const pinned = Boolean(ctx.conditions?.pinned);
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: pinned ? 'bottom bottom' : 'bottom top',
              scrub: 0.6,
            },
          });
          tl.to(proxy, { p: 1, duration: 1, onUpdate: () => void (progress.current = proxy.p) }, 0);
          if (pinned && copy) {
            // Hand the copy over to the next section.
            tl.to(copy, { autoAlpha: 0, y: -48, duration: 0.15, ease: 'power1.in' }, 0.85);
          }
        },
      );
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [idle]);

  // Pointer over the hero → NDC for parallax / push (no React state).
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const stage = el.querySelector<HTMLElement>('[data-hero-stage]') ?? el;
      const rect = stage.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.current.lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section ref={section} aria-labelledby={HERO_TITLE_ID} className="relative lg:motion-safe:h-[250svh]">
      <div data-hero-stage className="relative isolate lg:sticky lg:top-0 lg:h-svh lg:min-h-[40rem] lg:overflow-hidden">
        <SceneGate
          poster={poster}
          video={video}
          progress={progress}
          pointer={pointer}
          // Mobile: decorative area capped at 42svh so the headline is the dominant (LCP) element.
          className="h-[42svh] min-h-64 lg:absolute lg:inset-0 lg:h-full"
        />
        {children}
      </div>
    </section>
  );
}
