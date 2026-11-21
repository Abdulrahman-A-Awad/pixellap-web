import type { MediaAsset } from '@/lib/api/types';

/** One layout rule: at `media` (null = default), the box is `width` wide with aspect `boxRatio` (w / h). */
export interface CoverRule {
  media: string | null;
  width: number;
  unit: 'px' | 'vw';
  boxRatio: number;
}

/**
 * `sizes` for an `object-cover` image. A wide photo in a taller box is scaled to the box HEIGHT,
 * so it renders wider than the box: requesting the box width alone gets an upscaled, soft image
 * (the "pixelated About photo"). Each rule's width is multiplied by how much wider the image is
 * than the box. Unknown dimensions → the box width as is.
 */
export function coverSizes(asset: Pick<MediaAsset, 'width' | 'height'> | null, rules: CoverRule[]): string {
  const ratio = asset?.width && asset.height ? asset.width / asset.height : null;
  return rules
    .map(({ media, width, unit, boxRatio }) => {
      const factor = ratio ? Math.max(1, ratio / boxRatio) : 1;
      const size = `${Math.round(width * factor)}${unit}`;
      return media ? `${media} ${size}` : size;
    })
    .join(', ');
}

/**
 * Best source for the optimizer: the original (largest) raster file — next/image resizes it to the
 * width the browser asks for. Conversions are capped at 1920 px and never upscaled anyway.
 */
export function imageSource(asset: Pick<MediaAsset, 'url' | 'conversions'>): string {
  return asset.url || asset.conversions?.lg || '';
}
