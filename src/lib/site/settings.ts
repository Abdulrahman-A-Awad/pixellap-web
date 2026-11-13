import type { SiteSettings } from '@/lib/api/types';

/**
 * A setting that is empty or still a seed placeholder ("TODO: …") counts as not set,
 * so placeholder contact details never reach the public site.
 */
export function settingValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || /^TODO\b/i.test(trimmed)) return null;
  return trimmed;
}

/** Digits for https://wa.me/{digits}, or null when no real number is set. */
export function whatsappDigits(settings: Pick<SiteSettings, 'whatsapp'>): string | null {
  const value = settingValue(settings.whatsapp);
  const digits = value?.replace(/\D/g, '') ?? '';
  return digits.length >= 8 ? digits : null;
}

export function whatsappUrl(settings: Pick<SiteSettings, 'whatsapp'>): string | null {
  const digits = whatsappDigits(settings);
  return digits ? `https://wa.me/${digits}` : null;
}

/** Non-empty social links, in a stable order. */
export function socialLinks(settings: Pick<SiteSettings, 'socials'>): { network: string; url: string }[] {
  return Object.entries(settings.socials ?? {})
    .map(([network, url]) => ({ network, url: settingValue(url) }))
    .filter((s): s is { network: string; url: string } => s.url !== null);
}
