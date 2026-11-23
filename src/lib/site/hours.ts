import type { BusinessHours, WeekDay } from '@/lib/api/types';

const WEEK: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export type OpenStatus =
  { open: true; closes: string } | { open: false; opens: string; when: 'today' | 'tomorrow' | WeekDay };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Week day + minutes since midnight of `now` in the business timezone. */
function zonedNow(now: Date, timeZone: string): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = WEEK.indexOf(get('weekday').slice(0, 3).toLowerCase() as WeekDay);
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/**
 * Open / closed at `now` in the business timezone, and when it next opens (today, tomorrow or a
 * week day). Null when there are no working days.
 */
export function openStatus(hours: BusinessHours, now: Date): OpenStatus | null {
  if (hours.days.length === 0) return null;
  const { day, minutes } = zonedNow(now, hours.timezone);
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const works = (d: number) => hours.days.includes(WEEK[((d % 7) + 7) % 7]);

  if (works(day) && minutes >= open && minutes < close) return { open: true, closes: hours.close };
  if (works(day) && minutes < open) return { open: false, opens: hours.open, when: 'today' };
  for (let ahead = 1; ahead <= 7; ahead++) {
    if (works(day + ahead)) {
      return { open: false, opens: hours.open, when: ahead === 1 ? 'tomorrow' : WEEK[(day + ahead) % 7] };
    }
  }
  return null;
}

/** "6:00 PM" / "6:00 م" (Latin digits in Arabic, like the rest of the site). */
export function formatClock(hhmm: string, locale: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE-u-nu-latn' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, 0, 6, h, m)));
}

/** Localized week day name ("Monday" / "الاثنين"). 6 Jan 2020 was a Monday. */
export function formatWeekDay(day: WeekDay, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-US', { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2020, 0, 6 + WEEK.indexOf(day))),
  );
}
