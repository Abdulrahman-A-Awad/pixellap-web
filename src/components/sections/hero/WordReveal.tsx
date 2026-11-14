import type { ElementType } from 'react';

/**
 * Word-by-word reveal in pure CSS (renders and is readable without JS — this is the LCP).
 * Splits by WORDS only, so Arabic letters stay joined. Words start partly visible
 * (never opacity 0), so the browser counts the paint immediately for LCP.
 * Reduced motion: the global media query neutralises the animation.
 */
export function WordReveal({
  text,
  as: Tag = 'h1',
  id,
  className,
  delayMs = 120,
}: {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  delayMs?: number;
}) {
  const words = text.trim().split(/\s+/);

  return (
    <Tag id={id} className={className}>
      {words.map((word, i) => (
        <span key={`${i}-${word}`}>
          <span className="word-reveal" style={{ animationDelay: `${delayMs + i * 70}ms` }}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
