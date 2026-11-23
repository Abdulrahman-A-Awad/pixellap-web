/**
 * One SVG path for a set of pixel squares (rounded corners), instead of one <rect> per pixel: the
 * brand numerals and icons render as 1 node, not 20–40 (a services page had 550+ rects, which
 * doubled style/layout time on phones). `cells` are top-left corners; every square is `size` wide.
 */
export function pixelPath(cells: [number, number][], size: number, radius: number): string {
  const r = Math.min(radius, size / 2);
  const side = size - 2 * r;
  const n = (v: number) => Math.round(v * 100) / 100;
  return cells
    .map(
      ([x, y]) =>
        `M${n(x + r)} ${n(y)}h${n(side)}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(r)}v${n(side)}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(r)}` +
        `h${n(-side)}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(-r)}v${n(-side)}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(-r)}z`,
    )
    .join('');
}
