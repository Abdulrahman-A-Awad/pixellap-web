/** Translator over the API's flat ui_strings map. Shared by client (useSite) and server (getT). */
export type Translate = (key: string, fallback?: string) => string;

export function createTranslator(strings: Record<string, string>): Translate {
  return (key, fallback) => {
    const value = strings[key];
    if (value) return value;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ui_strings] missing "${key}"`);
    }
    return fallback ?? key;
  };
}
