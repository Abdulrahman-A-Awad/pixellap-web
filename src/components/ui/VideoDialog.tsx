'use client';

import { X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useId, useRef } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import { useDialog } from '@/lib/a11y/useDialog';
import type { VideoSource } from '@/lib/video';

/**
 * The showreel dialog itself (Motion + focus trap). Loaded lazily by VideoModal on first open.
 * The player mounts only while open, so closing stops playback.
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
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop closes the modal. */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={close}
              className="absolute inset-0 cursor-default bg-bg/85 backdrop-blur-md"
            />

            <motion.div
              className="relative w-full max-w-6xl"
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 id={titleId} className="text-lg font-bold">
                  {t('actions.watch_reel')}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-11 items-center justify-center rounded-pill bg-surface-2 text-text transition-colors hover:bg-primary hover:text-on-primary"
                >
                  <X aria-hidden="true" className="size-5" />
                  <span className="sr-only">{t('misc.close')}</span>
                </button>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-card border border-border bg-ink shadow-2xl">
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
