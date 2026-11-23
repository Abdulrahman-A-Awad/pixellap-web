import type { Translate } from './translate';

/** Replace `{name}` placeholders in a ui string. */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/**
 * Plural-aware ui string: picks `{base}_{category}` by Intl.PluralRules (Arabic has
 * zero/one/two/few/many/other), falling back to `{base}_other`, then fills `{count}`.
 */
export function plural(t: Translate, locale: string, base: string, count: number): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template = t(`${base}_${category}`, '') || t(`${base}_other`, '{count}');
  return interpolate(template, { count: count.toLocaleString('en-US') });
}

/**
 * Phone number for humans: UAE numbers (+971) grouped as "+971 50 606 5873" / "+971 4 000 0000";
 * anything else is returned as entered. Always render it LTR-isolated (`<bdi dir="ltr">`).
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const local = digits.startsWith('971') ? digits.slice(3) : digits.startsWith('00971') ? digits.slice(5) : null;
  if (local === null) return raw.trim();
  const national = local.replace(/^0/, '');
  if (/^5\d{8}$/.test(national)) return `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
  if (/^[2-9]\d{7}$/.test(national)) return `+971 ${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
  return raw.trim();
}

/** tel: href (digits and a leading +). */
export function telHref(raw: string): string {
  return `tel:${raw.replace(/[^\d+]/g, '')}`;
}
