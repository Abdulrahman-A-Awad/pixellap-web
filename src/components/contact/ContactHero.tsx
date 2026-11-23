import type { CSSProperties } from 'react';
import { Eyebrow } from '@/components/sections/SectionHeading';

/**
 * Contact hero: centred and calm — eyebrow, title, subtitle (CMS page) over a soft radial brand
 * glow. Server HTML; the staggered rise is pure CSS (`.hero-rise`, starts at opacity 0.001, so the
 * title still counts as the LCP). Extra bottom padding: the quick-contact cards overlap it.
 */
export function ContactHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
}) {
  return (
    <section className="relative isolate overflow-clip pt-[calc(var(--header-h)+64px)] pb-28 md:pt-[calc(var(--header-h)+88px)] md:pb-36">
      <div aria-hidden="true" className="page-glow" />
      <div className="container-page flex flex-col items-center gap-4 text-center">
        <div className="hero-rise" style={{ '--rise-i': 0 } as CSSProperties}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1 className="hero-rise max-w-3xl text-page-title text-balance" style={{ '--rise-i': 1 } as CSSProperties}>
          {title}
        </h1>
        {subtitle && (
          <p
            className="hero-rise mt-1 measure text-lead text-pretty text-muted"
            style={{ '--rise-i': 2 } as CSSProperties}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
