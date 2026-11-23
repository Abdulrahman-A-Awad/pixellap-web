import type { CSSProperties } from 'react';

// 7×7 grid: a check mark drawn in pixels (row, col), in drawing order.
const CHECK: [number, number][] = [
  [3, 0],
  [4, 1],
  [5, 2],
  [4, 3],
  [3, 4],
  [2, 5],
  [1, 6],
];
const COLORS = ['var(--brand-lavender)', 'var(--brand-iris)', 'var(--brand-royal)'];

/** Animated pixel check mark: cells pop in one by one (CSS `.pixel-check`, static under reduced motion). */
export function PixelCheck({ size = 84 }: { size?: number }) {
  const cell = size / 7;
  return (
    <svg className="pixel-check" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {CHECK.map(([row, col], i) => (
        <rect
          key={`${row}-${col}`}
          x={col * cell + 1}
          y={row * cell + 1}
          width={cell - 2}
          height={cell - 2}
          rx={2}
          fill={COLORS[i % COLORS.length]}
          style={{ '--i': i } as CSSProperties}
        />
      ))}
    </svg>
  );
}
