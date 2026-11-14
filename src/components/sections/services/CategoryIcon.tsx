import type { MediaAsset } from '@/lib/api/types';
import { cn } from '@/lib/cn';

/** Category / service icon: the CMS SVG, or a tiny pixel cluster as a deterministic fallback. */
export function CategoryIcon({
  icon,
  index,
  size = 'md',
  className,
}: {
  icon: MediaAsset | null;
  index: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const box =
    size === 'lg' ? 'size-16 p-2.5 rounded-2xl' : size === 'sm' ? 'size-9 p-1.5 rounded-lg' : 'size-11 p-2 rounded-xl';

  if (icon) {
    return (
      <span className={cn('inline-flex shrink-0 items-center justify-center bg-surface-2', box, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG icons are not optimised by next/image */}
        <img src={icon.url} alt="" className="size-full object-contain" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 grid-cols-3 gap-0.5 bg-surface-2', box, className)}>
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'rounded-[2px]',
            (i * 7 + index * 3) % 4 === 0
              ? 'bg-transparent'
              : i % 3 === 0
                ? 'bg-royal'
                : i % 2
                  ? 'bg-iris'
                  : 'bg-lavender',
          )}
        />
      ))}
    </span>
  );
}
