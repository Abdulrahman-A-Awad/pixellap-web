import Image from 'next/image';
import { cn } from '@/lib/cn';

// Intrinsic sizes from the SVG viewBoxes.
const SIZES = {
  /** Stacked lockup (mark above the wordmark). */
  logo: { width: 830, height: 580, file: 'pixellap-logo' },
  /** Horizontal lockup (mark | wordmark), built from the same vector paths. */
  horizontal: { width: 1095, height: 272, file: 'pixellap-logo-h' },
  mark: { width: 246, height: 284, file: 'pixellap-mark' },
} as const;

interface LogoProps {
  /** Rendered height in px; width follows the aspect ratio. */
  height?: number;
  variant?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
  alt: string;
}

/**
 * Brand logo that follows the theme without JS: the white file shows in dark mode,
 * the colored one in light mode (both are tiny SVGs).
 */
export function Logo({ height = 40, variant = 'logo', className, priority, alt }: LogoProps) {
  const size = SIZES[variant];
  const width = Math.round((size.width / size.height) * height);
  const base = `/brand/${size.file}`;

  return (
    <span className={cn('relative inline-flex shrink-0', className)} style={{ width, height }}>
      <Image
        src={`${base}-white.svg`}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className="light:hidden"
      />
      <Image
        src={`${base}.svg`}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className="hidden light:block"
      />
    </span>
  );
}
