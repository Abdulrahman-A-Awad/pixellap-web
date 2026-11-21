import type { ReactNode } from 'react';
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
 * alignment are identical everywhere. Start-aligned by default; `action` (e.g. a "View all" link)
 * sits on the inline-end side from md up, under the text on phones.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  align = 'start',
  action,
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  id?: string;
  align?: 'start' | 'center';
  action?: ReactNode;
  className?: string;
}) {
  if (!eyebrow && !title && !subtitle) return null;

  const text = (
    <div className={cn('flex max-w-2xl flex-col gap-3', align === 'center' && 'mx-auto items-center text-center')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && (
        <h2 id={id} className="text-heading text-balance">
          {title}
        </h2>
      )}
      {subtitle && <p className="mt-1 measure text-lead text-pretty text-muted">{subtitle}</p>}
    </div>
  );

  if (!action) {
    return (
      <div data-reveal className={className}>
        {text}
      </div>
    );
  }

  return (
    <div
      data-reveal
      className={cn('flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between', className)}
    >
      {text}
      <div className="shrink-0">{action}</div>
    </div>
  );
}
