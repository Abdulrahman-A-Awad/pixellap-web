import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { seededRandom } from '@/lib/random';

const COLORS = ['var(--brand-royal)', 'var(--brand-iris)', 'var(--brand-lavender)'] as const;
const GRID = 5;

export type PixelCorner = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

interface PixelFieldProps {
  /** Same seed → same layout. */
  seed?: number;
  /** Section corner the squares sit in (logical: mirrors in RTL). */
  corner?: PixelCorner;
  /** Number of squares, clamped to 6–10. */
  count?: number;
  className?: string;
}

/**
 * Quiet decorative brand pixels for a section corner (CSS only, server-rendered).
 *
 * Rules (design review): 6–10 squares, only in the section's corner, faded out with a radial mask,
 * never behind text or controls. The box lives in the page gutter OUTSIDE the 1280px content column
 * (`.pixel-field` sizes it to that gutter) and only renders where the gutter is wide enough
 * (≥ 1400px), behind the content (-z-10), click-through. Opacity is capped by --pixel-opacity
 * (0.35 dark / 0.2 light). Place inside a `relative isolate` section; never in heroes or the header.
 */
export function PixelField({ seed = 7, corner = 'top-end', count = 8, className }: PixelFieldProps) {
  const random = seededRandom(seed);
  const target = Math.min(10, Math.max(6, count));
  const top = corner.startsWith('top');
  const end = corner.endsWith('end');

  // Candidate cells weighted towards the corner, picked without repeats.
  const cells: { col: number; row: number; color: string; opacity: number }[] = [];
  const taken = new Set<string>();
  let guard = 0;
  while (cells.length < target && guard++ < 400) {
    // Squaring the random number biases picks towards 0 = the corner.
    const dc = Math.floor(random() ** 2 * GRID);
    const dr = Math.floor(random() ** 2 * GRID);
    const key = `${dc}-${dr}`;
    if (taken.has(key)) continue;
    taken.add(key);
    cells.push({
      col: end ? GRID - 1 - dc : dc,
      row: top ? dr : GRID - 1 - dr,
      color: COLORS[Math.floor(random() * COLORS.length)],
      opacity: Math.round((0.55 + random() * 0.45) * 100) / 100,
    });
  }

  return (
    <div
      aria-hidden="true"
      data-corner={corner}
      className={cn('pixel-field pointer-events-none absolute -z-10 hidden select-none min-[1400px]:block', className)}
    >
      {cells.map(({ col, row, color, opacity }) => (
        <span
          key={`${col}-${row}`}
          className="absolute aspect-square rounded-[2px]"
          style={
            {
              insetInlineStart: `${(col / GRID) * 100}%`,
              top: `${(row / GRID) * 100}%`,
              width: `${100 / GRID - 2}%`,
              background: color,
              opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
