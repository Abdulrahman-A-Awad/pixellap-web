/**
 * The Pixellap brand mark: a 7×7 pixel grid (row 0 = top).
 * R = royal, I = iris, L = lavender, . = empty.
 * Data for the 3D scene; colors mirror the --brand-* CSS variables.
 */

export const BRAND_COLORS = {
  royal: '#3A119E',
  iris: '#612FE2',
  lavender: '#8152F8',
} as const;

export type BrandColorName = keyof typeof BRAND_COLORS;

export interface LogoCell {
  col: number;
  row: number;
  color: string;
  name: BrandColorName;
}

export const LOGO_GRID_SIZE = 7;

// prettier-ignore
const PATTERN = [
  'L......',
  '.IRL...',
  'L...R..',
  'RLI..L.',
  '....I..',
  'R.IR...',
  'LR.....',
] as const;

const CODES: Record<string, BrandColorName> = { R: 'royal', I: 'iris', L: 'lavender' };

export function parseLogoGrid(pattern: readonly string[] = PATTERN): LogoCell[] {
  const cells: LogoCell[] = [];
  pattern.forEach((line, row) => {
    [...line].forEach((char, col) => {
      const name = CODES[char];
      if (name) cells.push({ col, row, color: BRAND_COLORS[name], name });
    });
  });
  return cells;
}

/** Filled cells of the brand mark, top-left origin. */
export const LOGO_CELLS: readonly LogoCell[] = parseLogoGrid();

export interface CenteredLogoCell extends LogoCell {
  /** x grows to the right, y grows UP (three.js convention), centered on the grid's middle. */
  x: number;
  y: number;
}

/**
 * Cells centered around the origin, scaled by `spacing` (distance between cell centers).
 * The grid's center cell (3,3) lands on (0,0).
 */
export function centerLogoCells(
  cells: readonly LogoCell[] = LOGO_CELLS,
  spacing = 1,
  size = LOGO_GRID_SIZE,
): CenteredLogoCell[] {
  const half = (size - 1) / 2;
  return cells.map((cell) => ({
    ...cell,
    x: (cell.col - half) * spacing,
    y: (half - cell.row) * spacing,
  }));
}
