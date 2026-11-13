import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ApiError, apiGet } from './client';
import type {
  HomeResponse,
  Locale,
  PageKey,
  PageResponse,
  ServiceCategoriesResponse,
  ServiceCategoryResponse,
  SiteResponse,
  SitemapResponse,
} from './types';

type Result<T> = { ok: true; data: T } | { ok: false; status: 404 };

/**
 * Cached + tagged API read (Next 16 Cache Components: `use cache` + cacheTag).
 * The API's revalidate webhook calls revalidateTag() with the same tags.
 * A 404 is returned as a value (cached under the same tags); other errors throw and are never cached.
 */
async function cachedGet<T>(path: string, locale: Locale | undefined, tags: string[]): Promise<Result<T>> {
  'use cache';
  cacheTag(...tags);
  cacheLife('hours'); // revalidate at most every hour

  try {
    return { ok: true, data: await apiGet<T>(path, { locale, tags }) };
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return { ok: false, status: 404 };
    throw error;
  }
}

async function getOr404<T>(path: string, locale: Locale | undefined, tags: string[]): Promise<T> {
  const result = await cachedGet<T>(path, locale, tags);
  if (!result.ok) notFound();
  return result.data;
}

// React cache(): dedupe within one request on top of the persistent `use cache`.

export const getSite = cache((locale: Locale) => getOr404<SiteResponse>('/site', locale, ['site']));

export const getHome = cache((locale: Locale) => getOr404<HomeResponse>('/home', locale, ['home']));

export const getPage = cache((key: PageKey, locale: Locale) =>
  getOr404<PageResponse>(`/pages/${encodeURIComponent(key)}`, locale, [`page:${key}`]),
);

export const getCategories = cache((locale: Locale) =>
  getOr404<ServiceCategoriesResponse>('/service-categories', locale, ['categories']),
);

export const getCategory = cache((slug: string, locale: Locale) =>
  getOr404<ServiceCategoryResponse>(`/service-categories/${encodeURIComponent(slug)}`, locale, [`category:${slug}`]),
);

export const getSitemap = cache(() => getOr404<SitemapResponse>('/sitemap', undefined, ['sitemap']));
