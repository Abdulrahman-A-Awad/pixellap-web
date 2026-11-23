import { cn } from '@/lib/cn';
import { pixelPath } from './pixelPath';

/** 3×5 bitmap per digit (rows top→bottom, 1 = filled). */
const GLYPHS: Record<string, string[]> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};

/**
 * Numbers drawn as brand pixels (decorative; the real value is in the accessible label).
 * Always LTR so "01" never reads "10" in Arabic.
 */
export function PixelDigits({
  value,
  cell = 6,
  className,
  label,
}: {
  value: string;
  /** Size of one pixel in px. */
  cell?: number;
  className?: string;
  label?: string;
}) {
  const chars = [...value].filter((c) => GLYPHS[c]);
  const gap = Math.max(1, Math.round(cell * 0.18));
  const width = chars.length * 3 * cell + (chars.length - 1) * cell;
  const height = 5 * cell;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('shrink-0', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      direction="ltr"
    >
      <path
        fill="currentColor"
        d={pixelPath(
          chars.flatMap((char, ci) =>
            GLYPHS[char].flatMap((row, r) =>
              [...row].flatMap((bit, c): [number, number][] =>
                bit === '1' ? [[ci * 4 * cell + c * cell + gap / 2, r * cell + gap / 2]] : [],
              ),
            ),
          ),
          cell - gap,
          cell * 0.15,
        )}
      />
    </svg>
  );
}
