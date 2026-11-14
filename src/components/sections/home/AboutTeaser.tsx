import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { buttonClasses } from '@/components/ui/Button';
import { CtaLink } from '@/components/ui/CtaLink';
import type { AboutSection } from '@/lib/api/types';

/** Two columns: copy + "Learn more" | image, or a brand pixel composition when there is none. */
export function AboutTeaser({ section }: { section: AboutSection }) {
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col items-start gap-8">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            id="about-title"
          />
          {section.cta && (
            <div data-reveal>
              <CtaLink cta={section.cta} className={buttonClasses('primary')}>
                {section.cta.label}
                {/* Descriptive link text for assistive tech / SEO ("Learn more: About…"). */}
                {section.title && <span className="sr-only">: {section.title}</span>}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </CtaLink>
            </div>
          )}
        </div>

        <div data-reveal className="relative aspect-[5/4] overflow-hidden rounded-card border border-border bg-surface">
          {section.image ? (
            <Image
              src={section.image.conversions?.lg ?? section.image.url}
              alt={section.image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PixelComposition seed={57} cols={7} rows={6} />
          )}
        </div>
      </div>
    </section>
  );
}
