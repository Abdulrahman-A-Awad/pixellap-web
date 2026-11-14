import { SectionHeading } from '@/components/sections/SectionHeading';
import type { ClientLogo, ClientsSection as ClientsData } from '@/lib/api/types';

function Logo({ client, duplicate }: { client: ClientLogo; duplicate?: boolean }) {
  const content = client.logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- logos are mostly SVG (not optimised by next/image)
    <img
      src={client.logo.url}
      alt={duplicate ? '' : client.name}
      width={client.logo.width ?? 160}
      height={client.logo.height ?? 64}
      loading="lazy"
      className="h-10 w-auto max-w-40 object-contain md:h-12"
    />
  ) : (
    <span className="text-lg font-bold whitespace-nowrap">{client.name}</span>
  );

  const className =
    'flex h-20 shrink-0 items-center justify-center px-8 opacity-60 grayscale transition-[filter,opacity] duration-300 hover:opacity-100 hover:grayscale-0 focus-visible:opacity-100 focus-visible:grayscale-0';

  return client.url && !duplicate ? (
    <a href={client.url} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <span className={className}>{content}</span>
  );
}

/**
 * Infinite logo marquee in pure CSS: the track holds the list twice and slides by 50%.
 * Pauses on hover/focus, follows the page direction, and becomes a static wrapped grid under
 * reduced motion (the duplicate is hidden). Rendered only when there are clients.
 */
export function ClientsSection({ section }: { section: ClientsData }) {
  if (section.items.length === 0) return null;

  return (
    <section id="clients" aria-labelledby="clients-title" className="py-20 md:py-24">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          id="clients-title"
          align="center"
        />
      </div>
      <div
        data-reveal
        className="marquee relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]"
      >
        <ul className="marquee-track flex w-max">
          {section.items.map((client) => (
            <li key={client.name}>
              <Logo client={client} />
            </li>
          ))}
          {section.items.map((client) => (
            <li key={`dup-${client.name}`} data-duplicate aria-hidden="true">
              <Logo client={client} duplicate />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
