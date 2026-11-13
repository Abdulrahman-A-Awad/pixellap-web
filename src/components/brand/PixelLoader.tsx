const COLORS = ['var(--brand-lavender)', 'var(--brand-iris)', 'var(--brand-royal)'];

/** Minimal 3×3 pixel loader (static under reduced motion via the global media query). */
export function PixelLoader({ label }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4">
      <div aria-hidden="true" className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="size-3 rounded-[2px]"
            style={{
              background: COLORS[i % 3],
              animation: `pixel-pulse 1.2s ${((i % 3) + Math.floor(i / 3)) * 0.12}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
