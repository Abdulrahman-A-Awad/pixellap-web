/** The Latin brand name as it appears inside CMS copy ("About Pixellap", "عن Pixellap"). */
export const BRAND_LATIN = 'Pixellap';

/**
 * Puts the localized site name (GET /site `settings.site_name`) where CMS copy names the brand in
 * Latin — e.g. the Arabic About eyebrow once the API serves an Arabic site name. While site_name is
 * still the Latin name, the text is returned unchanged.
 */
export function withSiteName<T extends string | null>(text: T, siteName: string | null | undefined): T {
  if (!text || !siteName || siteName === BRAND_LATIN) return text;
  return text.replaceAll(BRAND_LATIN, siteName) as T;
}
