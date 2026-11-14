import type { CSSProperties, ElementType } from 'react';

/**
 * Word-by-word reveal in pure CSS. The text is complete in the server HTML and readable without JS
 * (it is the LCP). Splits by WORDS only, so Arabic letters stay joined. Each word gets `--i` for
 * the stagger; the animation starts at opacity 0.001 (never 0, so the paint counts for LCP) and
 * is disabled entirely under prefers-reduced-motion (see `.word-reveal` in globals.css).
 */
export function WordReveal({
  text,
  as: Tag = 'h1',
  id,
  className,
}: {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
}) {
  const words = text.trim().split(/\s+/);

  return (
    <Tag id={id} className={className}>
      {words.map((word, i) => (
        <span key={`${i}-${word}`}>
          <span className="word-reveal" style={{ '--i': i } as CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
