'use client';

import { useEffect, useState } from 'react';

/** "Scroll" + a small falling pixel. Hidden for good after the first scroll. */
export function ScrollHint({ label }: { label: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 8) {
        setHidden(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-6 hidden flex-col items-center gap-2 text-xs tracking-[0.2em] text-muted uppercase transition-opacity duration-500 lg:flex ${hidden ? 'opacity-0' : 'opacity-100'}`}
    >
      <span>{label}</span>
      <span className="relative h-8 w-px bg-border">
        <span className="hero-scroll-pixel absolute start-1/2 top-0 size-1.5 rounded-[1px] bg-primary" />
      </span>
    </div>
  );
}
