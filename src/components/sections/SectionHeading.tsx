import { cn } from '@/lib/cn';

/** Eyebrow + title + subtitle used by every content section (server component). */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  align = 'start',
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  id?: string;
  align?: 'start' | 'center';
  className?: string;
}) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <div
      data-reveal
      className={cn(
        'flex max-w-3xl flex-col gap-4',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="inline-flex items-center gap-2 text-sm font-bold text-link">
          <span aria-hidden="true" className="size-2 rounded-[2px] bg-primary" />
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 id={id} className="text-heading text-balance">
          {title}
        </h2>
      )}
      {subtitle && <p className="text-lg text-pretty text-muted">{subtitle}</p>}
    </div>
  );
}
