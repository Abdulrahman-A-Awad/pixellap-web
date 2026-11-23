'use client';

import { useSyncExternalStore } from 'react';
import { useSite } from '@/components/providers/SiteProvider';
import type { BusinessHours } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { interpolate } from '@/lib/site/format';
import { formatClock, formatWeekDay, openStatus } from '@/lib/site/hours';

/** Current minute, re-read every 30 s (so the status flips within a minute of opening/closing). */
const subscribe = (notify: () => void) => {
  const timer = window.setInterval(notify, 30_000);
  return () => window.clearInterval(timer);
};
const getMinute = () => Math.floor(Date.now() / 60_000);
/** Server render + hydration: no time → nothing rendered (no hydration mismatch). */
const getServerMinute = () => null;

/**
 * Live "Open now · closes at 6:00 PM" (green) / "Closed · opens Monday at 9:00 AM" (grey) chip,
 * computed in the business timezone (Asia/Dubai) from `settings.business_hours`. Renders nothing on the
 * server and during hydration, then updates every minute. The parts are separated by a hairline, never a
 * "·" (missing from the brand font). Times/day names are localized (Latin digits in Arabic).
 */
export function OpenStatus({ hours }: { hours: BusinessHours }) {
  const { t, locale } = useSite();
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  if (minute === null) return null;

  const status = openStatus(hours, new Date(minute * 60_000));
  if (!status) return null;
  // Visitors in another timezone see that the times are UAE time.
  const elsewhere = Intl.DateTimeFormat().resolvedOptions().timeZone !== hours.timezone;

  const detail = status.open
    ? interpolate(t('contact.closes_at'), { time: formatClock(status.closes, locale) })
    : status.when === 'today'
      ? interpolate(t('contact.opens_today'), { time: formatClock(status.opens, locale) })
      : status.when === 'tomorrow'
        ? interpolate(t('contact.opens_tomorrow'), { time: formatClock(status.opens, locale) })
        : interpolate(t('contact.opens_at'), {
            day: formatWeekDay(status.when, locale),
            time: formatClock(status.opens, locale),
          });

  return (
    <div className="flex flex-col items-start gap-1.5">
      <p
        className={cn(
          // Wraps on narrow cards as a rounded block (each phrase stays whole; no divider on phones).
          'open-status inline-flex flex-wrap items-center gap-x-2.5 gap-y-0.5 rounded-[16px] px-3.5 py-1.5 text-meta',
          status.open ? 'bg-success/12 text-success' : 'bg-surface-2 text-muted',
        )}
      >
        <span
          aria-hidden="true"
          data-live={status.open ? '' : undefined}
          className={cn('status-dot size-2 shrink-0 rounded-full', status.open ? 'bg-success' : 'bg-muted')}
        />
        <span className="font-bold whitespace-nowrap">
          {status.open ? t('contact.open_now') : t('contact.closed_now')}
        </span>
        <span aria-hidden="true" className="hidden h-3.5 w-px shrink-0 bg-current opacity-30 sm:inline" />
        <span className="whitespace-nowrap">
          {detail}
          {!elsewhere && <span className="sr-only"> ({t('contact.uae_time')})</span>}
        </span>
      </p>
      {/* Visitors in another timezone: the times are UAE time. */}
      {elsewhere && <p className="ps-3.5 text-meta text-muted">{t('contact.uae_time')}</p>}
    </div>
  );
}
