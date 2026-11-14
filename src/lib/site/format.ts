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
