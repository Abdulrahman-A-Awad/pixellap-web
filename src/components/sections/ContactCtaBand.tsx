import { ArrowRight, Clock, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Closing call-to-action band (home, about, and `cta` page blocks).
 * Brand gradient royal → iris in both themes, with the white pixel mark bleeding off the end edge.
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

  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className={cn('py-16 md:py-24', className)}>
      <div className="container-page">
        <div
          data-reveal
          className="relative isolate overflow-hidden rounded-[28px] bg-linear-to-br from-royal to-iris px-6 py-14 text-on-primary shadow-[0_40px_120px_-40px_var(--brand-iris)] md:px-14 md:py-20"
        >
          {/* Large pixel mark, low opacity, bleeding off the inline-end edge. */}
          <Image
            src="/brand/pixellap-mark-white.svg"
            alt=""
            width={246}
            height={284}
            unoptimized
            aria-hidden="true"
            className="pointer-events-none absolute -end-16 -bottom-24 -z-10 h-[150%] w-auto opacity-[0.12] select-none md:-end-10 md:h-[170%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(60%_80%_at_85%_10%,color-mix(in_oklab,var(--brand-lavender)_55%,transparent),transparent)]"
          />

          <div className="flex max-w-2xl flex-col items-start gap-6">
            {title && (
              <h2 id={headingId} className="text-heading text-balance">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-lg text-pretty opacity-85 md:text-xl">{subtitle}</p>}
            {/* Skip the chip when the subtitle already says it. */}
            {responseTime && !subtitle?.includes(responseTime) && (
              <p className="inline-flex items-center gap-2 rounded-pill bg-on-primary/12 px-4 py-2 text-sm backdrop-blur">
                <Clock aria-hidden="true" className="size-4" />
                {responseTime}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className={buttonClasses('primary', 'bg-on-primary px-6 text-royal shadow-none hover:bg-pearl')}
              >
                {ctaLabel}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </Link>
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
        </div>
      </div>
    </section>
  );
}
