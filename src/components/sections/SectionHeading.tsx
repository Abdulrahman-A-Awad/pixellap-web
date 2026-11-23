import type { CSSProperties, ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

/** The small label above a section title (brand pixel + text). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-2 text-meta font-bold text-link', className)}>
      <span aria-hidden="true" className="size-2 rounded-[2px] bg-primary" />
      {children}
    </p>
  );
}

/**
 * THE section header block (eyebrow + H2 + subtitle), used by every content section so spacing and
 * alignment are identical everywhere. Eyebrow, title, subtitle and action reveal TOGETHER (one Reveal
 * group triggered by the header's top, staggered in CSS) — never an eyebrow without its title. Start-aligned by default; `action` (e.g. a "View all" link) sits on the inline-end side
 * from md up, under the text on phones. `wide` lifts the 42rem cap so a long title can stay on one
 * line on laptops (the subtitle keeps its reading measure).
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  align = 'start',
  action,
  wide = false,
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  id?: string;
  align?: 'start' | 'center';
  action?: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  if (!eyebrow && !title && !subtitle) return null;

  const text = (
    <div
      className={cn(
        'flex flex-col gap-3',
        wide ? 'max-w-full' : 'max-w-2xl',
        align === 'center' && 'mx-auto items-center text-center',
      )}
    >
      {eyebrow && (
        <div data-reveal-item style={{ '--reveal-index': 0 } as CSSProperties}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      {title && (
        <div data-reveal-item style={{ '--reveal-index': 1 } as CSSProperties}>
          <h2 id={id} className="text-heading text-balance">
            {title}
          </h2>
        </div>
      )}
      {subtitle && (
        <div data-reveal-item style={{ '--reveal-index': 2 } as CSSProperties}>
          <p className="mt-1 measure text-lead text-pretty text-muted">{subtitle}</p>
        </div>
      )}
    </div>
  );

  if (!action) {
    return (
      <Reveal group className={className}>
        {text}
      </Reveal>
    );
  }

  return (
    <Reveal
      group
      className={cn('flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between', className)}
    >
      {text}
      <div data-reveal-item className="shrink-0" style={{ '--reveal-index': 3 } as CSSProperties}>
        {action}
      </div>
    </Reveal>
  );
}
