import { ArrowRight, Clock, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Reveal } from '@/components/motion/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Closing call-to-action band (home, about, services, category pages and `cta` page blocks).
 * Brand gradient royal → iris in both themes, the large white pixel mark bleeding off the
 * inline-end edge at low opacity; H2 + one line + response-time chip, then two buttons.
 * No outer glow; tight spacing so it sits close to the footer. Motion: scale-in reveal, a very slow
 * drifting pixel pattern behind (CSS transform, `.cta-pixels`), magnetic + shine sweep on the primary
 * button.
 */
export function ContactCtaBand({
  title,
  subtitle,
  responseTime,
  whatsappUrl,
  ctaLabel,
  ctaHref = '/contact',
  whatsappLabel,
  id = 'contact',
  className,
}: {
  title: string | null;
  subtitle?: string | null;
  responseTime?: string | null;
  whatsappUrl?: string | null;
  ctaLabel: string;
  ctaHref?: string;
  whatsappLabel: string;
  id?: string;
  className?: string;
}) {
  const headingId = `${id}-title`;
  // The response time always shows as the chip; if the CMS line repeats it, it is taken out of the line.
  const chip = responseTime?.trim() || null;
  const line = (chip && subtitle ? subtitle.replace(chip, '') : (subtitle ?? '')).trim() || null;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn('py-[clamp(40px,5vw,72px)]', className)}
    >
      <div className="container-page">
        <Reveal
          variant="scale-in"
          className="relative isolate overflow-clip rounded-[28px] bg-linear-to-br from-royal to-iris px-6 py-12 text-on-primary md:px-12 md:py-16 lg:px-16"
        >
          <div aria-hidden="true" className="cta-pixels" />
          {/* Large pixel mark, low opacity, bleeding off the inline-end edge. */}
          <Image
            src="/brand/pixellap-mark-white.svg"
            alt=""
            width={246}
            height={284}
            unoptimized
            aria-hidden="true"
            className="pointer-events-none absolute -end-20 top-1/2 -z-10 h-[150%] w-auto -translate-y-1/2 opacity-[0.09] select-none md:-end-12 md:h-[170%] rtl:-scale-x-100"
          />

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
            <div className="flex max-w-2xl flex-col items-start gap-4">
              {title && (
                <h2 id={headingId} className="text-heading text-balance">
                  {title}
                </h2>
              )}
              {line && <p className="text-lead text-pretty opacity-85">{line}</p>}
              {chip && (
                <p className="mt-1 inline-flex items-center gap-2 rounded-pill bg-on-primary/12 px-4 py-1.5 text-meta">
                  <Clock aria-hidden="true" className="size-4" />
                  {chip}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <Link
                  href={ctaHref}
                  className={buttonClasses(
                    'primary',
                    'btn-shine bg-on-primary px-6 text-royal shadow-none hover:bg-pearl',
                  )}
                >
                  {ctaLabel}
                  <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                </Link>
              </Magnetic>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses(
                    'outline',
                    'border-on-primary/40 text-on-primary hover:border-on-primary hover:text-on-primary',
                  )}
                >
                  <MessageCircle aria-hidden="true" className="size-4" />
                  {whatsappLabel}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
