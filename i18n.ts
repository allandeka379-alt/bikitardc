// ─────────────────────────────────────────────
// next-intl configuration (cookie-based locale)
//
// We don't use a [locale] URL segment — the spec's
// "toggle persists per user" model is better served
// by a cookie-driven approach so the user keeps
// stable URLs and the toggle is a pure UI control.
//
// Supported locales:
//   • en — default, English
//   • sn — Shona (placeholders flagged [SN])
// ─────────────────────────────────────────────

import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export const LOCALES = ['en', 'sn'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'bikita-locale';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = (LOCALES as readonly string[]).includes(raw ?? '')
    ? (raw as Locale)
    : DEFAULT_LOCALE;

  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: 'Africa/Harare',
    now: new Date(),
  };
});
