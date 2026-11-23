'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, Ellipsis, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useController, useForm, useWatch } from 'react-hook-form';
import { submitContact } from '@/app/[locale]/contact/actions';
import { BrandIcon } from '@/components/brand/BrandIcons';
import { CategoryIcon } from '@/components/sections/services/CategoryIcon';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import type { ServiceCategory } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  OTHER_SERVICE,
  makeContactSchema,
  type ContactField,
  type ContactFormValues,
} from '@/lib/contact/schema';
import { interpolate } from '@/lib/site/format';
import { PixelCheck } from './PixelCheck';
import { ServiceSelect, type SelectOption } from './ServiceSelect';

type Banner = { kind: 'throttled' | 'error'; text: string } | null;

/** Floating-label field shell: the control (with placeholder=" "), its label (+ "Optional" tag), the error. */
function FloatField({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="float-field">
        {children}
        <label htmlFor={id} className="float-label">
          <span className="truncate">{label}</span>
          {optional && <span className="optional-tag">{optional}</span>}
        </label>
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-meta text-danger">
      <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </p>
  );
}

/**
 * Contact form (glass card on /contact). Floating labels with an inline "Optional" tag; brand focus
 * ring; inline errors (ui strings) + a gentle shake on the invalid fields at each failed submit and
 * an error summary (role="alert", links to the fields) for screen readers. Service = custom select
 * (ServiceSelect: ARIA select-only combobox, glass popover / phone bottom sheet; "Other" sends no
 * category); ?service= preselects. Validation: nothing on first render; a field validates on blur, then
 * live while typing once touched (error clears as soon as it is valid); everything on submit. The message grows with its content (min 5 rows) and shows a character counter.
 * Submit → Server Action (actions.ts): 422 → field errors, 429 → friendly retry, success → the form
 * is replaced by an animated pixel check, the API message, "Send another message" and WhatsApp.
 * No animation library: CSS only (globals.css "Contact page").
 */
export function ContactForm({
  categories,
  whatsappHref,
}: {
  categories: ServiceCategory[];
  whatsappHref: string | null;
}) {
  const { t, locale } = useSite();
  const uid = useId();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner>(null);
  const [attempt, setAttempt] = useState(0);
  const successRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  // ?service={slug} preselects a (visible) category.
  const requested = searchParams.get('service') ?? '';
  const preselected = categories.some((c) => c.slug === requested) ? requested : '';
  // ?item= (from "Request this service") prefills a localized first line of the message.
  const item = (searchParams.get('item') ?? '').trim().slice(0, 200);
  const prefill = item ? `${interpolate(t('contact.interested_in'), { item })}\n\n` : '';

  const schema = useMemo(() => makeContactSchema(t), [t]);
  const defaultValues: ContactFormValues = {
    name: '',
    email: '',
    phone: '',
    company: '',
    service: preselected,
    message: prefill,
    website: '',
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    shouldFocusError: false, // see focusFirst
  });

  const { field: serviceField } = useController({ control, name: 'service' });

  const id = (name: string) => `${uid}-${name}`;
  const labels: Record<ContactField, string> = {
    name: t('form.name'),
    email: t('form.email'),
    phone: t('form.phone'),
    company: t('form.company'),
    service: t('form.service'),
    message: t('form.message'),
  };
  const a11y = (name: ContactField, extra?: string) => {
    const describedBy = [errors[name] ? `${id(name)}-error` : null, extra].filter(Boolean).join(' ');
    return { id: id(name), 'aria-invalid': Boolean(errors[name]), 'aria-describedby': describedBy || undefined };
  };

  // Message: grows with its content from 5 rows up to ~60% of the viewport, then scrolls.
  const messageValue = useWatch({ control, name: 'message' }) ?? '';
  const grow = () => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight + 2, window.innerHeight * 0.6)}px`;
  };
  useEffect(grow, [messageValue]);

  // Success: move focus to the heading so screen readers announce it.
  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  const failed = () => setAttempt((n) => n + 1);
  /** Focus the first invalid field in VISUAL order (react-hook-form would use registration order). */
  /** The service picker is a button (not registered as an input), so it is focused by id. */
  const focusField = (field: ContactField) => {
    if (field === 'service') document.getElementById(id('service'))?.focus();
    else setFocus(field);
  };
  const focusFirst = (invalid: Partial<Record<ContactField, unknown>>) => {
    const first = CONTACT_FIELDS.find((f) => invalid[f]);
    if (first) focusField(first);
  };

  const onSubmit = handleSubmit(
    async (values) => {
      setBanner(null);
      const result = await submitContact(values, locale);
      switch (result.status) {
        case 'success':
          setSuccess(result.message);
          reset(defaultValues);
          break;
        case 'invalid': {
          for (const field of CONTACT_FIELDS) {
            const message = result.errors[field];
            if (message) setError(field, { type: 'server', message });
          }
          focusFirst(result.errors);
          failed();
          break;
        }
        case 'throttled':
          setBanner({ kind: 'throttled', text: t('form.too_many_requests') });
          break;
        default:
          setBanner({ kind: 'error', text: t('form.error') });
      }
    },
    (invalid) => {
      focusFirst(invalid);
      failed();
    },
  );

  if (success) {
    return (
      <div role="status" aria-live="polite" className="form-swap flex flex-col items-start gap-5 py-4">
        <PixelCheck />
        <h3 ref={successRef} tabIndex={-1} className="text-heading outline-none">
          {t('form.success_title')}
        </h3>
        <p className="max-w-md text-lead text-muted">{success}</p>
        <div className="mt-2 flex w-full flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className={buttonClasses('outline', 'w-full sm:w-auto')}
          >
            {t('form.send_another')}
          </button>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses('primary', 'w-full bg-whatsapp text-on-whatsapp hover:bg-whatsapp/90 sm:w-auto')}
            >
              <BrandIcon name="whatsapp" className="size-4.5" />
              {t('contact.whatsapp')}
            </a>
          )}
        </div>
      </div>
    );
  }

  const invalidFields = CONTACT_FIELDS.filter((f) => errors[f]);
  const messageRegister = register('message');
  const serviceOptions: SelectOption[] = [
    ...categories.map((c, i) => ({
      value: c.slug,
      label: c.title,
      icon: <CategoryIcon icon={c.icon} index={i} size="sm" />,
    })),
    {
      value: OTHER_SERVICE,
      label: t('form.other'),
      icon: (
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-surface-2 text-link">
          <Ellipsis className="size-4.5" />
        </span>
      ),
    },
  ];

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      data-attempt={attempt === 0 ? undefined : attempt % 2 ? 'odd' : 'even'}
      className="form-swap relative flex flex-col gap-5"
    >
      {submitCount > 0 && invalidFields.length > 0 && (
        <div
          role="alert"
          className="rounded-[14px] border border-danger/40 bg-danger/10 px-4 py-3 text-meta text-danger"
        >
          <p className="font-bold">{t('form.error_summary')}</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {invalidFields.map((f) => (
              <li key={f}>
                <a
                  href={`#${id(f)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    focusField(f);
                  }}
                  className="underline underline-offset-2"
                >
                  {labels[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FloatField id={id('name')} label={labels.name} error={errors.name?.message}>
          <input
            {...a11y('name')}
            {...register('name')}
            placeholder=" "
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            className="float-input"
          />
        </FloatField>
        <FloatField id={id('email')} label={labels.email} error={errors.email?.message}>
          <input
            {...a11y('email')}
            {...register('email')}
            placeholder=" "
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            maxLength={CONTACT_LIMITS.email}
            className="float-input text-start rtl:text-end"
          />
        </FloatField>
        <FloatField id={id('phone')} label={labels.phone} optional={t('form.optional')} error={errors.phone?.message}>
          <input
            {...a11y('phone')}
            {...register('phone')}
            placeholder=" "
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            maxLength={CONTACT_LIMITS.phone}
            className="float-input text-start rtl:text-end"
          />
        </FloatField>
        <FloatField
          id={id('company')}
          label={labels.company}
          optional={t('form.optional')}
          error={errors.company?.message}
        >
          <input
            {...a11y('company')}
            {...register('company')}
            placeholder=" "
            autoComplete="organization"
            maxLength={CONTACT_LIMITS.company}
            className="float-input"
          />
        </FloatField>
        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <ServiceSelect
            id={id('service')}
            label={labels.service}
            optionalTag={t('form.optional')}
            sheetTitle={t('form.select_service')}
            options={serviceOptions}
            value={serviceField.value}
            onChange={serviceField.onChange}
            onBlur={serviceField.onBlur}
            invalid={Boolean(errors.service)}
            describedBy={errors.service ? `${id('service')}-error` : undefined}
          />
          {errors.service?.message && <FieldError id={`${id('service')}-error`}>{errors.service.message}</FieldError>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="float-field">
          <textarea
            {...a11y('message', `${id('message')}-count`)}
            {...messageRegister}
            ref={(el) => {
              messageRegister.ref(el);
              messageRef.current = el;
            }}
            placeholder=" "
            rows={5}
            maxLength={CONTACT_LIMITS.messageMax}
            className="float-input"
          />
          <label htmlFor={id('message')} className="float-label">
            <span className="truncate">{labels.message}</span>
          </label>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {errors.message?.message && <FieldError id={`${id('message')}-error`}>{errors.message.message}</FieldError>}
          </div>
          <p id={`${id('message')}-count`} className="shrink-0 text-meta text-muted">
            <bdi dir="ltr" aria-hidden="true">
              {messageValue.length} / {CONTACT_LIMITS.messageMax}
            </bdi>
            <span className="sr-only">
              {interpolate(t('form.char_count'), { count: messageValue.length, max: CONTACT_LIMITS.messageMax })}
            </span>
          </p>
        </div>
      </div>

      {/* Honeypot: off-screen, not focusable, never autofilled. Humans leave it empty. */}
      <div aria-hidden="true" className="absolute -start-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={id('website')}>Website</label>
        <input {...register('website')} id={id('website')} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {banner && (
        <p
          role="alert"
          className={cn(
            'rounded-[14px] border px-4 py-3 text-meta',
            banner.kind === 'throttled'
              ? 'border-warning/40 bg-warning/10 text-warning'
              : 'border-danger/40 bg-danger/10 text-danger',
          )}
        >
          {banner.text}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={buttonClasses('primary', 'w-full px-7 sm:w-auto sm:min-w-48')}
        >
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              {t('form.sending')}
            </>
          ) : (
            <>
              {t('actions.send_message')}
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
