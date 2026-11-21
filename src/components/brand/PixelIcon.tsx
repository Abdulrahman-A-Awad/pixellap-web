import { useId } from 'react';
import { cn } from '@/lib/cn';

/** Small pixel-art glyphs (rows top→bottom, 1 = filled), drawn on the brand's square grid. */
const GLYPHS = {
  /** Discover / brief */
  search: ['0111000', '1000100', '1000100', '1000100', '0111000', '0000110', '0000011'],
  /** Idea */
  idea: ['0011100', '0100010', '1000001', '1000001', '0100010', '0011100', '0000000', '0011100'],
  /** Production */
  clapper: ['1010101', '1111111', '0000000', '1111111', '1000001', '1000001', '1111111'],
  /** Launch */
  rocket: ['0001000', '0011100', '0011100', '0111110', '0110110', '1111111', '1001001', '0001000'],
  /** Growth / results (stats) */
  chart: ['0000011', '0000011', '0001111', '0001111', '0111111', '0111111', '1111111'],
  /** People / clients */
  people: ['0110110', '0110110', '0000000', '1111111', '1111111', '1111111', '0000000'],
  /** Time / experience */
  clock: ['0111110', '1000001', '1001001', '1001111', '1000001', '1000001', '0111110'],
  /** Quality / awards */
  star: ['0001000', '0001000', '1111111', '0111110', '0011100', '0110110', '1100011'],
} as const;

export type PixelIconName = keyof typeof GLYPHS;
export const PIXEL_ICONS = Object.keys(GLYPHS) as PixelIconName[];

/**
 * Decorative pixel icon. `gradient` fills the cells lavender → iris (brand); otherwise currentColor.
 */
export function PixelIcon({
  name,
  cell = 5,
  gradient = false,
  className,
}: {
  name: PixelIconName;
  cell?: number;
  gradient?: boolean;
  className?: string;
}) {
  const rows = GLYPHS[name];
  const cols = rows[0].length;
  const gap = Math.max(1, Math.round(cell * 0.18));
  const gradientId = `pixel-icon-${useId().replace(/:/g, '')}`;

  return (
    <svg
      viewBox={`0 0 ${cols * cell} ${rows.length * cell}`}
      width={cols * cell}
      height={rows.length * cell}
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      {gradient && (
        <defs>
          {/* One gradient across the whole glyph (not per cell). */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={cols * cell}
            y2={rows.length * cell}
          >
            <stop offset="0" style={{ stopColor: 'var(--brand-lavender)' }} />
            <stop offset="1" style={{ stopColor: 'var(--brand-iris)' }} />
          </linearGradient>
        </defs>
      )}
      <g fill={gradient ? `url(#${gradientId})` : 'currentColor'}>
        {rows.flatMap((row, r) =>
          [...row].map((bit, c) =>
            bit === '1' ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell + gap / 2}
                y={r * cell + gap / 2}
                width={cell - gap}
                height={cell - gap}
                rx={cell * 0.15}
              />
            ) : null,
          ),
        )}
      </g>
    </svg>
  );
}
