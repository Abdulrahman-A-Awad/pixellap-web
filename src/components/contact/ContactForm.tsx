'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { useId, useMemo, useState, type ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { submitContact } from '@/app/[locale]/contact/actions';
import { useSite } from '@/components/providers/SiteProvider';
import { buttonClasses } from '@/components/ui/Button';
import type { ServiceCategory } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { interpolate } from '@/lib/site/format';
import { CONTACT_FIELDS, CONTACT_LIMITS, makeContactSchema, type ContactFormValues } from '@/lib/contact/schema';
import { PixelCheck } from './PixelCheck';

type Banner = { kind: 'throttled' | 'error'; text: string } | null;

const inputClass = cn(
  'w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-muted/70',
  'transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-primary',
  'aria-[invalid=true]:border-danger',
);

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  optionalLabel?: string;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode;
}

function Field({ id, label, error, optionalLabel, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-bold">
        {label}
        {optionalLabel && <span className="text-xs font-normal text-muted">{optionalLabel}</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ categories }: { categories: ServiceCategory[] }) {
  const { t, locale } = useSite();
  const uid = useId();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner>(null);

  // ?service={slug} preselects a (visible) category.
  const requested = searchParams.get('service') ?? '';
  const preselected = categories.some((c) => c.slug === requested) ? requested : '';
  // ?item= (from "Request this service") prefills a localized first line of the message.
  const item = (searchParams.get('item') ?? '').trim().slice(0, 200);
  const prefill = item
    ? `${interpolate(t('contact.interested_in'), { item })}

`
    : '';

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
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(schema), defaultValues, mode: 'onTouched' });

  const onSubmit = handleSubmit(async (values) => {
    setBanner(null);
    const result = await submitContact(values, locale);

    switch (result.status) {
      case 'success':
        setSuccess(result.message);
        reset(defaultValues);
        break;
      case 'invalid': {
        let first = true;
        for (const field of CONTACT_FIELDS) {
          const message = result.errors[field];
          if (message) {
            setError(field, { type: 'server', message }, { shouldFocus: first });
            first = false;
          }
        }
        break;
      }
      case 'throttled':
        setBanner({ kind: 'throttled', text: t('form.too_many_requests') });
        break;
      default:
        setBanner({ kind: 'error', text: t('form.error') });
    }
  });

  const id = (name: string) => `${uid}-${name}`;
  const field = (name: keyof ContactFormValues, extra?: Parameters<typeof register>[1]): UseFormRegisterReturn =>
    register(name, extra);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-start gap-5 py-6"
            role="status"
            aria-live="polite"
          >
            <PixelCheck />
            <h3 className="text-2xl font-bold">{t('form.success_title')}</h3>
            <p className="max-w-md text-muted">{success}</p>
            <button type="button" onClick={() => setSuccess(null)} className={buttonClasses('outline')}>
              {t('form.send_another')}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            noValidate
            className="relative flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={id('name')} label={t('form.name')} error={errors.name?.message}>
                {(a11y) => (
                  <input
                    {...a11y}
                    {...field('name')}
                    autoComplete="name"
                    maxLength={CONTACT_LIMITS.name}
                    className={inputClass}
                  />
                )}
              </Field>
              <Field id={id('email')} label={t('form.email')} error={errors.email?.message}>
                {(a11y) => (
                  <input
                    {...a11y}
                    {...field('email')}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    dir="ltr"
                    maxLength={CONTACT_LIMITS.email}
                    className={cn(inputClass, 'text-start rtl:text-end')}
                  />
                )}
              </Field>
              <Field
                id={id('phone')}
                label={t('form.phone')}
                optionalLabel={t('form.optional')}
                error={errors.phone?.message}
              >
                {(a11y) => (
                  <input
                    {...a11y}
                    {...field('phone')}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    dir="ltr"
                    maxLength={CONTACT_LIMITS.phone}
                    className={cn(inputClass, 'text-start rtl:text-end')}
                  />
                )}
              </Field>
              <Field
                id={id('company')}
                label={t('form.company')}
                optionalLabel={t('form.optional')}
                error={errors.company?.message}
              >
                {(a11y) => (
                  <input
                    {...a11y}
                    {...field('company')}
                    autoComplete="organization"
                    maxLength={CONTACT_LIMITS.company}
                    className={inputClass}
                  />
                )}
              </Field>
            </div>

            <Field
              id={id('service')}
              label={t('form.service')}
              optionalLabel={t('form.optional')}
              error={errors.service?.message}
            >
              {(a11y) => (
                <select {...a11y} {...field('service')} className={cn(inputClass, 'appearance-none')}>
                  <option value="">{t('form.select_service')}</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field id={id('message')} label={t('form.message')} error={errors.message?.message}>
              {(a11y) => (
                <textarea
                  {...a11y}
                  {...field('message')}
                  rows={6}
                  maxLength={CONTACT_LIMITS.messageMax}
                  className={cn(inputClass, 'resize-y')}
                />
              )}
            </Field>

            {/* Honeypot: off-screen, not focusable, never autofilled. Humans leave it empty. */}
            <div aria-hidden="true" className="absolute -start-[10000px] top-auto h-px w-px overflow-hidden">
              <label htmlFor={id('website')}>Website</label>
              <input {...field('website')} id={id('website')} type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {banner && (
              <p
                role="alert"
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm',
                  banner.kind === 'throttled'
                    ? 'border-warning/40 bg-warning/10 text-warning'
                    : 'border-danger/40 bg-danger/10 text-danger',
                )}
              >
                {banner.text}
              </p>
            )}

            <div>
              <button type="submit" disabled={isSubmitting} className={buttonClasses('primary', 'min-w-44')}>
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
          </motion.form>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
