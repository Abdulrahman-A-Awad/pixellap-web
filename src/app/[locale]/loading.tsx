import { PixelLoader } from '@/components/brand/PixelLoader';

/**
 * Route-level loading UI. It fills the whole small viewport so the footer (rendered by the layout,
 * after <main>) always starts below the fold while a page streams in — when the content arrives the
 * footer moves only off-screen, which is not a layout shift (cold-cache CLS was ~0.30 with 70dvh).
 */
export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center pt-24">
      <PixelLoader />
    </div>
  );
}
