import { cn } from '@/lib/cn';

/** Small deterministic PRNG so the field is identical on server and client. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS = ['var(--brand-royal)', 'var(--brand-iris)', 'var(--brand-lavender)'] as const;

interface PixelFieldProps {
  /** Same seed → same layout. */
  seed?: number;
  /** Grid columns × rows the squares snap to. */
  cols?: number;
  rows?: number;
  /** Share of cells filled (0–1). */
  density?: number;
  className?: string;
}

/**
 * Decorative brand pixel field: semi-transparent squares on a grid, CSS only.
 * Place inside a `relative` section; it fills it and sits behind the content.
 * Uses logical insets so it mirrors in RTL; lighter in light mode (--pixel-opacity).
 */
export function PixelField({ seed = 7, cols = 24, rows = 12, density = 0.09, className }: PixelFieldProps) {
  const random = mulberry32(seed);
  const cells: { col: number; row: number; color: string; opacity: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Denser towards the inline-end edge, like the brand backgrounds.
      const bias = 0.35 + (col / cols) * 1.3;
      if (random() < density * bias) {
        cells.push({
          col,
          row,
          color: COLORS[Math.floor(random() * COLORS.length)],
          opacity: Math.round((0.12 + random() * 0.5) * 100) / 100,
        });
      }
    }
  }

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none', className)}
      style={{ opacity: 'var(--pixel-opacity)' }}
    >
      {cells.map(({ col, row, color, opacity }) => (
        <span
          key={`${col}-${row}`}
          className="absolute aspect-square"
          style={{
            insetInlineStart: `${(col / cols) * 100}%`,
            top: `${(row / rows) * 100}%`,
            width: `${100 / cols}%`,
            maxWidth: '72px',
            background: color,
            opacity,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
}
