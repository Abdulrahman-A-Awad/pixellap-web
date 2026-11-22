import type { ReactNode } from 'react';
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
 * alignment are identical everywhere. Eyebrow, title, subtitle and action reveal with a stagger
 * (Reveal). Start-aligned by default; `action` (e.g. a "View all" link) sits on the inline-end side
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
        <Reveal index={0}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      {title && (
        <Reveal index={1}>
          <h2 id={id} className="text-heading text-balance">
            {title}
          </h2>
        </Reveal>
      )}
      {subtitle && (
        <Reveal index={2}>
          <p className="mt-1 measure text-lead text-pretty text-muted">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );

  if (!action) {
    return <div className={className}>{text}</div>;
  }

  return (
    <div className={cn('flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between', className)}>
      {text}
      <Reveal index={3} className="shrink-0">
        {action}
      </Reveal>
    </div>
  );
}
