import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PixelComposition } from '@/components/brand/PixelComposition';
import { PixelDigits } from '@/components/brand/PixelDigits';
import { ContactCtaBand } from '@/components/sections/ContactCtaBand';
import type { ImageTextBlock, PageBlock, PageBlockItem } from '@/lib/api/types';
import { cn } from '@/lib/cn';

/** Plain-text body → paragraphs (blank line = new paragraph). */
function Paragraphs({ text, className }: { text: string | null; className?: string }) {
  if (!text) return null;
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
    </div>
  );
}

function TextBlock({ title, body }: { title: string | null; body: string | null }) {
  return (
    <section className="py-12 md:py-16">
      <div className="container-page">
        <div data-reveal className="mx-auto flex max-w-[68ch] flex-col gap-6">
          {title && <h2 className="text-heading text-balance">{title}</h2>}
          <Paragraphs text={body} className="text-lead text-muted" />
        </div>
      </div>
    </section>
  );
}

/** Image and text side by side; every second block swaps sides (logical, so it follows dir). */
function ImageTextSection({ block, flip }: { block: ImageTextBlock; flip: boolean }) {
  return (
    <section className="py-12 md:py-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div data-reveal className={cn('flex flex-col gap-6', flip && 'lg:order-2')}>
          {block.title && <h2 className="text-heading text-balance">{block.title}</h2>}
          <Paragraphs text={block.body} className="text-lead text-muted" />
        </div>
        <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-card border border-border bg-surface">
          {block.image ? (
            <Image
              src={block.image.conversions?.lg ?? block.image.url}
              alt={block.image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PixelComposition seed={block.id * 13} />
          )}
        </div>
      </div>
    </section>
  );
}

function MissionVision({ title, items }: { title: string | null; items: PageBlockItem[] }) {
  return (
    <section className="py-12 md:py-16">
      <div className="container-page flex flex-col gap-10">
        {title && (
          <h2 data-reveal className="text-heading text-balance">
            {title}
          </h2>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <article
              key={i}
              data-reveal
              style={{ '--reveal-i': i } as CSSProperties}
              className={cn(
                'relative isolate flex flex-col gap-4 overflow-hidden rounded-card border p-8 md:p-10',
                i === 0
                  ? 'border-transparent bg-linear-to-br from-royal to-iris text-on-primary'
                  : 'border-border bg-surface',
              )}
            >
              <span aria-hidden="true" className="grid w-fit grid-cols-2 gap-1">
                {[0, 1, 2, 3].map((c) => (
                  <span
                    key={c}
                    className={cn(
                      'size-2.5 rounded-[2px]',
                      c === 3 ? 'opacity-30' : '',
                      i === 0 ? 'bg-on-primary' : 'bg-primary',
                    )}
                  />
                ))}
              </span>
              <h3 className="text-title">{item.title}</h3>
              <p className={cn(i === 0 ? 'opacity-85' : 'text-muted')}>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Values({ title, items }: { title: string | null; items: PageBlockItem[] }) {
  return (
    <section className="py-12 md:py-16">
      <div className="container-page flex flex-col gap-10">
        {title && (
          <h2 data-reveal className="text-heading text-balance">
            {title}
          </h2>
        )}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item, i) => (
            <li
              key={i}
              data-reveal
              style={{ '--reveal-i': i } as CSSProperties}
              className="flex flex-col gap-4 rounded-card border border-border bg-surface p-7 transition-colors hover:border-lavender/60"
            >
              <PixelDigits value={String(i + 1).padStart(2, '0')} cell={4} className="text-link" />
              <h3 className="text-title">{item.title}</h3>
              <p className="text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Renders page blocks in order, by type. */
export function PageBlocks({
  blocks,
  cta,
}: {
  blocks: PageBlock[];
  /** Labels/links for `cta` blocks (shared Contact CTA band style). */
  cta: { label: string; whatsappUrl: string | null; whatsappLabel: string; responseTime: string | null };
}) {
  let imageTextCount = 0;
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id} title={block.title} body={block.body} />;
          case 'image_text':
            return <ImageTextSection key={block.id} block={block} flip={imageTextCount++ % 2 === 1} />;
          case 'mission_vision':
            return <MissionVision key={block.id} title={block.title} items={block.items} />;
          case 'values':
            return <Values key={block.id} title={block.title} items={block.items} />;
          case 'cta':
            return (
              <ContactCtaBand
                key={block.id}
                id={`block-${block.id}`}
                title={block.title}
                subtitle={block.body}
                responseTime={cta.responseTime}
                whatsappUrl={cta.whatsappUrl}
                ctaLabel={cta.label}
                whatsappLabel={cta.whatsappLabel}
              />
            );
        }
      })}
    </>
  );
}
