import Image from 'next/image';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { PixelIcon, type PixelIconName } from '@/components/brand/PixelIcon';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Parallax } from '@/components/ui/Parallax';
import type { ImageTextBlock, PageBlock, PageBlockItem } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { coverSizes, imageSource } from '@/lib/images';

/** Plain-text body → paragraphs (blank line = new paragraph). */
function paragraphs(text: string | null): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** First sentence of a paragraph (ends with . ! ? or the Arabic ؟, followed by a space) + the rest. */
function splitLead(paragraph: string): [string, string] {
  const match = paragraph.match(/^(.+?[.!?؟])\s+([\s\S]+)$/);
  return match ? [match[1], match[2]] : [paragraph, ''];
}

function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {items.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

function TextBlock({ title, body }: { title: string | null; body: string | null }) {
  return (
    <section className="section-y">
      <div className="container-page flex max-w-[calc(68ch+2*var(--gutter))] flex-col gap-6">
        <SectionHeading title={title} />
        <Reveal index={2}>
          <Paragraphs items={paragraphs(body)} className="measure text-lead text-muted" />
        </Reveal>
      </div>
    </section>
  );
}

/**
 * "Who we are" (image + text): H2, the body's first sentence as a large lead, the rest in body size at
 * a comfortable measure; with 2+ paragraphs the last one is pulled out as a highlighted quote. The
 * image sits on the inline-end side (first on phones) in a 28px frame with scroll parallax; every
 * second image block swaps sides.
 */
function StorySection({ block, flip }: { block: ImageTextBlock; flip: boolean }) {
  const parts = paragraphs(block.body);
  const quote = parts.length >= 2 ? parts[parts.length - 1] : null;
  const rest = quote ? parts.slice(0, -1) : parts;
  const [lead, firstRest] = rest.length ? splitLead(rest[0]) : ['', ''];
  const body = [firstRest, ...rest.slice(1)].filter(Boolean);
  const headingId = `block-${block.id}-title`;
  const image = block.image;

  return (
    <section aria-labelledby={block.title ? headingId : undefined} className="section-y">
      <div className="container-page grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal
          variant="scale-in"
          className={cn(
            'group relative aspect-[4/3] overflow-clip rounded-[28px] border border-border bg-surface-2 lg:col-span-5 lg:aspect-[4/5]',
            flip ? 'lg:order-first' : 'lg:order-last',
          )}
        >
          <Parallax>
            <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]">
              {image ? (
                <Image
                  src={imageSource(image)}
                  alt={image.alt}
                  fill
                  sizes={coverSizes(image, [
                    // 5/12 of the 1280px container; 4:5 frame + 48px of parallax travel.
                    { media: '(min-width: 1280px)', width: 470, unit: 'px', boxRatio: 470 / 636 },
                    { media: '(min-width: 1024px)', width: 37, unit: 'vw', boxRatio: 0.74 },
                    { media: null, width: 92, unit: 'vw', boxRatio: 1.2 },
                  ])}
                  className="object-cover"
                />
              ) : (
                <PixelComposition seed={block.id * 13} cols={6} rows={7} />
              )}
            </div>
          </Parallax>
        </Reveal>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <SectionHeading title={block.title} id={headingId} />
          {lead && (
            <Reveal index={2}>
              <p className="measure text-title text-pretty text-text">{lead}</p>
            </Reveal>
          )}
          {body.length > 0 && (
            <Reveal index={3}>
              <Paragraphs items={body} className="measure text-muted" />
            </Reveal>
          )}
          {quote && (
            <Reveal as="blockquote" index={4} className="story-quote measure ps-5 md:ps-6">
              <p className="text-lead text-pretty text-text">{quote}</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/** Mission + vision icons; extra items cycle through the value icons. */
const MV_ICONS: PixelIconName[] = ['target', 'eye'];
/** Value icons (craft, clarity, partnership, curiosity, quality, growth), cycled. */
const VALUE_ICONS: PixelIconName[] = ['diamond', 'search', 'link', 'idea', 'star', 'rocket'];

/** Mission & vision: two EQUAL cards (same surface), each with a pixel icon chip, title and text. */
function MissionVision({ id, title, items }: { id: number; title: string | null; items: PageBlockItem[] }) {
  if (items.length === 0) return null;
  const headingId = `block-${id}-title`;
  return (
    <section aria-labelledby={title ? headingId : undefined} className="section-y">
      <div className="container-page flex flex-col gap-10 lg:gap-12">
        <SectionHeading title={title} id={headingId} />
        <div data-mission className={cn('grid gap-5 lg:gap-6', items.length > 1 && 'md:grid-cols-2')}>
          {items.map((item, i) => (
            <Reveal
              key={i}
              as="article"
              index={i}
              className="surface-card glow-card relative isolate flex flex-col gap-5 overflow-clip p-7 md:p-10"
            >
              <span aria-hidden="true" className="card-light" />
              <span
                aria-hidden="true"
                className="glow-chip inline-flex size-14 items-center justify-center rounded-[16px] text-link"
              >
                <PixelIcon name={i < MV_ICONS.length ? MV_ICONS[i] : VALUE_ICONS[i % VALUE_ICONS.length]} cell={4} />
              </span>
              <h3 className="text-title">{item.title}</h3>
              <p className="text-lead text-pretty text-muted">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Values: always a balanced grid (never a 3 + 1 orphan). 4 → 4 columns on desktop, 2×2 on tablets;
 * 3 → 3 columns; 6 → 3×2; 5 → 3 + 2 (wider second row); 2 → 2; phones 1 column. Card: pixel number,
 * icon chip, title, text; staggered reveal; hover lift.
 */
const VALUE_GRID: Record<number, string> = {
  1: 'mx-auto max-w-xl',
  2: 'sm:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-6 lg:[&>li:nth-child(-n+3)]:col-span-2 lg:[&>li:nth-child(n+4)]:col-span-3',
  6: 'sm:grid-cols-2 lg:grid-cols-3',
};

function Values({ id, title, items }: { id: number; title: string | null; items: PageBlockItem[] }) {
  const values = items.slice(0, 6);
  if (values.length === 0) return null;
  const headingId = `block-${id}-title`;
  return (
    <section aria-labelledby={title ? headingId : undefined} className="section-y">
      <div className="container-page flex flex-col gap-10 lg:gap-12">
        <SectionHeading title={title} id={headingId} />
        <ul data-values className={cn('grid gap-4 lg:gap-5', VALUE_GRID[values.length])}>
          {values.map((item, i) => (
            <Reveal key={i} as="li" index={i} className="surface-card glow-card flex flex-col gap-5 p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <span
                  aria-hidden="true"
                  className="glow-chip inline-flex size-11 items-center justify-center rounded-[13px] text-link"
                >
                  <PixelIcon name={VALUE_ICONS[i % VALUE_ICONS.length]} cell={3} />
                </span>
                <PixelDigits value={String(i + 1).padStart(2, '0')} cell={3} className="text-muted opacity-70" />
              </div>
              <h3 className="text-title">{item.title}</h3>
              <p className="text-pretty text-muted">{item.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Content blocks the about page renders in place (`cta` blocks are the page's closing band instead). */
export type ContentBlock = Exclude<PageBlock, { type: 'cta' }>;

/** Renders one content block by type; `flip` alternates image sides between image blocks. */
export function PageBlockView({ block, flip }: { block: ContentBlock; flip: boolean }) {
  switch (block.type) {
    case 'text':
      return <TextBlock title={block.title} body={block.body} />;
    case 'image_text':
      return <StorySection block={block} flip={flip} />;
    case 'mission_vision':
      return <MissionVision id={block.id} title={block.title} items={block.items} />;
    case 'values':
      return <Values id={block.id} title={block.title} items={block.items} />;
  }
}
