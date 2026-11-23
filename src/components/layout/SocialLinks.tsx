import { BRAND_ICONS, BrandIcon, isBrandIcon, type BrandIconName } from '@/components/brand/BrandIcons';
import type { SiteSettings } from '@/lib/api/types';
import { socialLinks } from '@/lib/site/settings';

/** Display order of the social icon buttons (only networks with a URL render). */
const SOCIAL_ORDER: BrandIconName[] = [
  'facebook',
  'instagram',
  'linkedin',
  'tiktok',
  'youtube',
  'x',
  'behance',
  'snapchat',
];

/** The site's social networks with a URL, known icon, in SOCIAL_ORDER (WhatsApp has its own UI). */
export function socialItems(settings: Pick<SiteSettings, 'socials'>) {
  return socialLinks(settings)
    .filter((s): s is { network: BrandIconName; url: string } => isBrandIcon(s.network) && s.network !== 'whatsapp')
    .sort((a, b) => SOCIAL_ORDER.indexOf(a.network) - SOCIAL_ORDER.indexOf(b.network));
}

/**
 * Social icon buttons (footer, contact page): round, bordered, per-network hover tint
 * (`.social-btn[data-network]`). Renders nothing when no network has a URL.
 */
export function SocialLinks({ settings, label }: { settings: Pick<SiteSettings, 'socials'>; label: string }) {
  const socials = socialItems(settings);
  if (socials.length === 0) return null;
  return (
    <div>
      <h2 className="sr-only">{label}</h2>
      <ul className="flex flex-wrap gap-2.5">
        {socials.map(({ network, url }) => (
          <li key={network}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={BRAND_ICONS[network].name}
              title={BRAND_ICONS[network].name}
              data-network={network}
              className="social-btn inline-flex size-11 items-center justify-center rounded-pill border border-border bg-bg text-muted"
            >
              <BrandIcon name={network} className="size-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
