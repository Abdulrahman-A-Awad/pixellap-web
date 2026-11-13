'use server';

import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import type { ApiValidationError, ContactPayload, ContactResponse } from '@/lib/api/types';
import { CONTACT_FIELDS, type ContactField, type ContactFormValues, type ContactResult } from '@/lib/contact/schema';
import { serverEnv } from '@/lib/env';

/** Visitor IP for the API's per-visitor rate limit: first x-forwarded-for entry, else x-real-ip. */
async function visitorIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || h.get('x-real-ip')?.trim() || null;
}

const optional = (value: string): string | null => (value.trim() === '' ? null : value.trim());

/**
 * POST {API_URL}/contact from the server (site key + visitor IP never reach the browser).
 * The API validates; its 422 errors are mapped back onto form fields.
 */
export async function submitContact(values: ContactFormValues, locale: string): Promise<ContactResult> {
  const lang = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  const payload: ContactPayload = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: optional(values.phone),
    company: optional(values.company),
    service: optional(values.service),
    message: values.message.trim(),
    locale: lang,
    website: values.website ?? '',
  };

  const ip = await visitorIp();

  let res: Response;
  try {
    res = await fetch(`${serverEnv.apiUrl}/contact?locale=${lang}`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Site-Key': serverEnv.apiSiteKey,
        ...(ip ? { 'X-Client-IP': ip } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error('[contact] API unreachable', error);
    return { status: 'error' };
  }

  if (res.status === 201) {
    const body = (await res.json()) as ContactResponse;
    return { status: 'success', message: body.data.message };
  }

  if (res.status === 422) {
    const body = (await res.json()) as ApiValidationError;
    const errors: Partial<Record<ContactField, string>> = {};
    for (const field of CONTACT_FIELDS) {
      const first = body.errors?.[field]?.[0];
      if (first) errors[field] = first;
    }
    return { status: 'invalid', errors };
  }

  if (res.status === 429) return { status: 'throttled' };

  console.error('[contact] unexpected API status', res.status);
  return { status: 'error' };
}
