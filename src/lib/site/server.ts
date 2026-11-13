import 'server-only';
import { getSite } from '@/lib/api/endpoints';
import type { Locale } from '@/lib/api/types';
import { createTranslator, type Translate } from './translate';

/** Server-component equivalent of useSite().t — reads ui_strings from GET /site. */
export async function getT(locale: Locale): Promise<Translate> {
  const site = await getSite(locale);
  return createTranslator(site.data.ui_strings);
}
