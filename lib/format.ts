// ─────────────────────────────────────────────
// Locale-aware formatting helpers
//
// The demo ships with en-ZW and sn-ZW locales.
// We fall back to en-ZW for Shona number/date
// formatting because browser support for sn is
// inconsistent — this matches spec §4.2 ("shared
// utility that respects locale") while avoiding
// runtime errors.
// ─────────────────────────────────────────────

export type SupportedLocale = 'en' | 'sn';

const INTL_LOCALE: Record<SupportedLocale, string> = {
  en: 'en-ZW',
  sn: 'en-ZW', // Fallback; sn-ZW formatters are not universally available.
};

export function formatCurrency(
  value: number,
  currency: 'USD' | 'ZWG' = 'USD',
  locale: SupportedLocale = 'en',
): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact form: $12.3k, $4.5M. Keeps sparklines readable. */
export function formatCompact(
  value: number,
  currency: 'USD' | 'ZWG' = 'USD',
  locale: SupportedLocale = 'en',
): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    notation: 'compact',
    style: 'currency',
    currency,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(
  value: number,
  locale: SupportedLocale = 'en',
): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(value);
}

export function formatDate(
  value: string | Date,
  locale: SupportedLocale = 'en',
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' },
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], opts).format(date);
}

/** "2 hours ago", "in 3 days". Uses Intl.RelativeTimeFormat when available. */
export function formatRelative(
  value: string | Date,
  locale: SupportedLocale = 'en',
  now: Date = new Date(),
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ];

  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: 'auto' });
  let amount = diffSec;
  for (const d of divisions) {
    if (Math.abs(amount) < d.amount) return rtf.format(Math.round(amount), d.unit);
    amount /= d.amount;
  }
  return rtf.format(Math.round(amount), 'year');
}
