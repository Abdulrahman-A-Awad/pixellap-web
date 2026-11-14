import { BRAND_COLORS, centerLogoCells, LOGO_CELLS } from '@/lib/brand/logoGrid';

/**
 * Precomputed, deterministic layouts for the hero cubes (computed once per tier).
 * Instance i: 0–15 = the 16 brand-mark cells, 16+ = satellites.
 * All positions are in "cube units" (a cube is 1×1×1).
 */

export const MARK_SPACING = 1.08;
export const BIG_SPACING = 1.04;

export type Vec3 = [number, number, number];

export interface CubeLayout {
  count: number;
  /** Intro start: a scattered cloud. */
  scatter: Vec3[];
  /** Rest pose: brand mark (0–15) + satellites on a shell. */
  rest: Vec3[];
  /** Mark cubes drifting apart (scroll 0–0.4); satellites keep their rest pose. */
  broken: Vec3[];
  /** Final assembly: 4×4×4 (high) or 4×4×2 (low). */
  big: Vec3[];
  /** Offset applied to a few cubes at the end (pulled out of the big cube). */
  pulled: Vec3[];
  /** Rest scale (satellites are smaller; everything is 1 in the big cube). */
  scale: number[];
  colors: string[];
  /** Per-instance timing / idle parameters, all in [0, 1). */
  introDelay: number[];
  breakDelay: number[];
  assembleDelay: number[];
  phase: number[];
  spinAxis: Vec3[];
}

/** mulberry32: tiny deterministic PRNG (same layout on every load). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const length = ([x, y, z]: Vec3) => Math.hypot(x, y, z);
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function gridCells(nx: number, ny: number, nz: number, spacing: number): Vec3[] {
  const cells: Vec3[] = [];
  for (let x = 0; x < nx; x++)
    for (let y = 0; y < ny; y++)
      for (let z = 0; z < nz; z++)
        cells.push([(x - (nx - 1) / 2) * spacing, (y - (ny - 1) / 2) * spacing, (z - (nz - 1) / 2) * spacing]);
  return cells;
}

/** Weighted brand colour for satellites. */
function satelliteColor(r: number): string {
  if (r < 0.42) return BRAND_COLORS.lavender;
  if (r < 0.77) return BRAND_COLORS.iris;
  return BRAND_COLORS.royal;
}

/**
 * @param copySide −1 when the hero copy is on the left (LTR), +1 when on the right (RTL),
 *   0 when the copy is not beside the scene (mobile: copy below).
 *   Only used to keep satellites away from the copy; the geometry itself never mirrors.
 */
export function buildLayout(count: 64 | 32, copySide: -1 | 0 | 1 = -1): CubeLayout {
  const random = seededRandom(0x91e1a7);
  const mark = centerLogoCells(LOGO_CELLS, MARK_SPACING);
  const satellites = count - mark.length;

  const rest: Vec3[] = mark.map((c) => [c.x, c.y, 0]);
  const colors: string[] = mark.map((c) => c.color);
  const scale: number[] = mark.map(() => 1);

  // Satellites: a flattened shell around the mark, kept out of the camera's way (z).
  for (let i = 0; i < satellites; i++) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = 5.4 + random() * 3.6;
    let x = radius * Math.sin(phi) * Math.cos(theta) * 1.2;
    const z = radius * Math.sin(phi) * Math.sin(theta) * 0.5 - 1.5;
    const s = 0.3 + random() * 0.35;
    // Keep the copy clear: satellites that would sit more than 1.5 units towards the copy
    // are reflected to the far side of the cluster (compressed a little).
    if (copySide !== 0 && x * copySide > 1.5) x = -x * (0.85 + random() * 0.2);
    rest.push([x, radius * Math.cos(phi) * 0.72, z]);
    colors.push(satelliteColor(random()));
    scale.push(s);
  }

  // Intro cloud: far, wide and behind.
  const scatter: Vec3[] = rest.map(() => {
    const theta = random() * Math.PI * 2;
    const r = 16 + random() * 14;
    return [Math.cos(theta) * r, (random() - 0.5) * 24, -12 - random() * 26];
  });

  // Break-apart: mark cubes move outward + in depth; satellites stay.
  const broken: Vec3[] = rest.map((p, i) => {
    if (i >= mark.length) return p;
    const len = Math.max(0.6, Math.hypot(p[0], p[1]));
    const push = 0.9 + random() * 1.8;
    return [p[0] + (p[0] / len) * push, p[1] + (p[1] / len) * push, (random() - 0.35) * 3.2];
  });

  // Big cube cells, assigned greedily to the nearest instance (short, readable flights).
  const cells = count === 64 ? gridCells(4, 4, 4, BIG_SPACING) : gridCells(4, 4, 2, BIG_SPACING);
  const pairs: { i: number; c: number; d: number }[] = [];
  rest.forEach((p, i) => cells.forEach((cell, c) => pairs.push({ i, c, d: dist(p, cell) })));
  pairs.sort((a, b) => a.d - b.d);
  const big: Vec3[] = new Array(count);
  const usedCell = new Set<number>();
  for (const { i, c } of pairs) {
    if (big[i] || usedCell.has(c)) continue;
    big[i] = cells[c];
    usedCell.add(c);
  }

  // A few outer cubes pulled out of place at the end (like the brand imagery).
  const half = (BIG_SPACING * 3) / 2;
  const outer = big
    .map((p, i) => ({ i, p }))
    .filter(({ p }) => p.some((v) => Math.abs(Math.abs(v) - half) < 0.01))
    .sort((a, b) => seededSort(a.i) - seededSort(b.i))
    .slice(0, count === 64 ? 6 : 5);
  const pulled: Vec3[] = big.map(() => [0, 0, 0] as Vec3);
  for (const { i, p } of outer) {
    // Outward along the cell's dominant axis.
    const axis = p.map(Math.abs).indexOf(Math.max(...p.map(Math.abs)));
    const offset: Vec3 = [0, 0, 0];
    offset[axis] = Math.sign(p[axis]) * (0.45 + seededSort(i + 99) * 0.35);
    pulled[i] = offset;
  }

  // Timing.
  const maxRest = Math.max(...rest.map(length));
  const introDelay = rest.map((_, i) => (i < mark.length ? 0.18 + random() * 0.22 : random() * 0.3));
  const breakDelay = rest.map((_, i) => (i < mark.length ? (i / mark.length) * 0.55 : 0));
  const assembleDelay = rest.map((p) => (length(p) / maxRest) * 0.45);
  const phase = rest.map(() => random());
  const spinAxis = rest.map(() => {
    const v: Vec3 = [random() - 0.5, random() - 0.5, random() - 0.5];
    const l = length(v) || 1;
    return [v[0] / l, v[1] / l, v[2] / l] as Vec3;
  });

  return {
    count,
    scatter,
    rest,
    broken,
    big,
    pulled,
    scale,
    colors,
    introDelay,
    breakDelay,
    assembleDelay,
    phase,
    spinAxis,
  };
}

/** Stable pseudo-random value per index (for sorting/choosing without consuming the main RNG). */
function seededSort(i: number): number {
  return seededRandom(1000 + i * 7919)();
}
