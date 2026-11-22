'use client';

import { X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useId, useRef } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import { useDialog } from '@/lib/a11y/useDialog';
import { ease, spring } from '@/lib/motion';
import type { VideoSource } from '@/lib/video';

/**
 * Showreel dialog (Motion + focus trap), loaded lazily by VideoModal on first open.
 * - Dark scrim (--scrim, rgba(0,0,0,.8)) + blur in BOTH themes.
 * - Player: 16:9, width = min(92vw, 88svh × 16/9) → never wider or taller than the viewport,
 *   centred, 20px corners; scales in with a soft spring.
 * - Close: large button at the top-end corner of the screen, Esc (useDialog), backdrop click.
 * - YouTube via youtube-nocookie with autoplay (lib/video). The player mounts only while open, so
 *   closing stops playback.
 */
export default function VideoDialog({
  source,
  open,
  close,
}: {
  source: VideoSource;
  open: boolean;
  close: () => void;
}) {
  const { t } = useSite();
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialog(dialog, open, close);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="reel"
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            className="fixed inset-0 z-[70] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: ease.out }}
          >
            <h2 id={titleId} className="sr-only">
              {t('actions.watch_reel')}
            </h2>

            {/* Backdrop: dark in both themes; click closes (not focusable: Esc / close button for keyboards). */}
            <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-(--scrim) backdrop-blur-md" />

            {/* Close: first in focus order, top-end of the screen, 48px hit area, above the player. */}
            <button
              type="button"
              onClick={close}
              className="btn-press absolute end-3 top-3 z-10 inline-flex size-12 items-center justify-center rounded-pill bg-on-primary/12 text-on-primary ring-1 ring-on-primary/15 backdrop-blur-md transition-colors hover:bg-on-primary/22 sm:end-5 sm:top-5"
            >
              <X aria-hidden="true" className="size-6" />
              <span className="sr-only">{t('misc.close')}</span>
            </button>

            <motion.div
              data-reel-player
              className="relative aspect-video w-[min(92vw,calc(88svh*16/9))] overflow-hidden rounded-[20px] bg-ink shadow-2xl ring-1 ring-on-primary/10"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0, transition: { duration: 0.2 } }}
              transition={spring.soft}
            >
              {source.kind === 'iframe' ? (
                <iframe
                  src={source.src}
                  title={t('actions.watch_reel')}
                  className="size-full"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <video className="size-full" controls autoPlay playsInline preload="auto">
                  <source src={source.src} type={source.type} />
                </video>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
