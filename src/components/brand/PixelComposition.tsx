import { seededRandom } from '@/lib/random';
import { cn } from '@/lib/cn';

const COLORS = ['var(--brand-royal)', 'var(--brand-iris)', 'var(--brand-lavender)'];

/**
 * A deterministic composition of brand pixel squares (image fallback for cards / teasers).
 * Denser towards the bottom-end corner; mirrors with the page direction.
 */
export function PixelComposition({
  seed = 3,
  cols = 8,
  rows = 6,
  className,
}: {
  seed?: number;
  cols?: number;
  rows?: number;
  className?: string;
}) {
  const random = seededRandom(seed);
  const cells: { col: number; row: number; color: string; opacity: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const weight = 0.18 + (col / cols) * 0.45 + (row / rows) * 0.35;
      if (random() < weight) {
        cells.push({
          col,
          row,
          color: COLORS[Math.floor(random() * COLORS.length)],
          opacity: Math.round((0.45 + random() * 0.55) * 100) / 100,
        });
      }
    }
  }

  return (
    <div
      aria-hidden="true"
      className={cn('grid size-full gap-[6%] p-[6%]', className)}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {cells.map(({ col, row, color, opacity }) => (
        <span
          key={`${col}-${row}`}
          className="rounded-[3px]"
          style={{ gridColumn: col + 1, gridRow: row + 1, background: color, opacity }}
        />
      ))}
    </div>
  );
}
