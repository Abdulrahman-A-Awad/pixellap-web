'use client';

import { motion } from 'motion/react';

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

/** Animated pixel check mark (Motion; static under reduced motion via MotionConfig). */
export function PixelCheck({ size = 84 }: { size?: number }) {
  const cell = size / 7;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {CHECK.map(([row, col], i) => (
        <motion.rect
          key={`${row}-${col}`}
          x={col * cell + 1}
          y={row * cell + 1}
          width={cell - 2}
          height={cell - 2}
          rx={2}
          fill={COLORS[i % COLORS.length]}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />
      ))}
    </svg>
  );
}
