import { z } from 'zod';
import type { Translate } from '@/lib/site/translate';

// No eval-based validators: under the site's CSP (no 'unsafe-eval') Zod's `Function("")` probe
// would be blocked and reported as a violation on every page with the form.
z.config({ jitless: true });

/** Mirrors StoreContactRequest in pixellap-api (keep in sync with docs/API.md). */
export const CONTACT_LIMITS = {
  name: 120,
  email: 190,
  phone: 30,
  company: 120,
  messageMin: 10,
  messageMax: 5000,
} as const;

export const PHONE_PATTERN = /^[0-9\s+()-]+$/;

/** Service chip "Other": a form-only value, sent to the API as no service (null). */
export const OTHER_SERVICE = 'other';

/** Field values as the form holds them (empty string = not provided). */
export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  website: string; // honeypot — must stay empty
}

export const CONTACT_FIELDS = ['name', 'email', 'phone', 'company', 'service', 'message'] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

/** Schema with messages from ui_strings. */
export function makeContactSchema(t: Translate) {
  const required = t('form.required');
  const tooLong = t('form.too_long');

  return z.object({
    name: z.string().trim().min(1, required).max(CONTACT_LIMITS.name, tooLong),
    email: z
      .string()
      .trim()
      .min(1, required)
      .max(CONTACT_LIMITS.email, tooLong)
      .pipe(z.email(t('form.invalid_email'))),
    phone: z
      .string()
      .trim()
      .max(CONTACT_LIMITS.phone, tooLong)
      .refine((v) => v === '' || PHONE_PATTERN.test(v), t('form.invalid_phone')),
    company: z.string().trim().max(CONTACT_LIMITS.company, tooLong),
    service: z.string(),
    message: z
      .string()
      .trim()
      .min(1, required)
      .min(CONTACT_LIMITS.messageMin, t('form.message_too_short'))
      .max(CONTACT_LIMITS.messageMax, tooLong),
    website: z.string(),
  }) satisfies z.ZodType<ContactFormValues>;
}

export type ContactResult =
  | { status: 'success'; message: string }
  | { status: 'invalid'; errors: Partial<Record<ContactField, string>> }
  | { status: 'throttled' }
  | { status: 'error' };
