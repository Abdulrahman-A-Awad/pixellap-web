import 'server-only';
import { serverEnv } from '@/lib/env';
import type { ApiError as ApiErrorBody, Locale } from './types';

/** Thrown for any non-2xx API response. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export interface ApiGetOptions {
  locale?: Locale;
  /** Cache tags (see docs/API.md) — the API's webhook revalidates them. */
  tags?: string[];
}

/** Revalidation window for API data (seconds); the webhook usually clears it much sooner. */
export const API_REVALIDATE = 3600;

/**
 * GET {API_URL}{path}?locale=… with the site key. Server-only.
 * Prefer the endpoint helpers in ./endpoints (cached + tagged + deduped).
 */
export async function apiGet<T>(path: string, { locale, tags = [] }: ApiGetOptions = {}): Promise<T> {
  const url = new URL(serverEnv.apiUrl + path);
  if (locale) url.searchParams.set('locale', locale);

  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'X-Site-Key': serverEnv.apiSiteKey },
    next: { tags, revalidate: API_REVALIDATE },
  });

  if (!res.ok) {
    let message = res.statusText || `HTTP ${res.status}`;
    try {
      message = ((await res.json()) as ApiErrorBody).message ?? message;
    } catch {
      // Non-JSON error body.
    }
    throw new ApiError(res.status, message, path);
  }

  return (await res.json()) as T;
}
