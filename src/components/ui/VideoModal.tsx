'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import { settingValue } from '@/lib/site/settings';
import { parseVideoUrl } from '@/lib/video';

export const REEL_HASH = '#reel';

// The dialog (and Motion) loads on first open, never in the initial bundle.
const VideoDialog = dynamic(() => import('./VideoDialog'), { ssr: false });

/**
 * Showreel modal (mounted once in the layout). Opens from "Watch the reel" and from ANY link to
 * #reel. Renders nothing until first opened.
 */
export function VideoModal() {
  const { site } = useSite();
  const source = useMemo(() => parseVideoUrl(settingValue(site.settings.showreel_url)), [site.settings.showreel_url]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Intercept clicks on any link to #reel (capture phase, before Lenis/anchor scrolling).
  useEffect(() => {
    if (!source) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!link || !(link.getAttribute('href') ?? '').endsWith(REEL_HASH)) return;
      event.preventDefault();
      setLoaded(true);
      setOpen(true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [source]);

  if (!source || !loaded) return null;
  return <VideoDialog source={source} open={open} close={close} />;
}
