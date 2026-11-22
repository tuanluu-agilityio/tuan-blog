import { defaultLocale, ui, type Locale, type UiKey } from './ui';

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}

/**
 * Builds an internal URL: base + (`en/` for non-default locales) + path, always with
 * a leading and trailing slash and no duplicate slashes. The default locale is never prefixed.
 */
export function localizedPath(
  locale: Locale,
  path: string,
  base: string = import.meta.env.BASE_URL,
): string {
  const segments = [
    ...base.split('/'),
    ...(locale === defaultLocale ? [] : [locale]),
    ...path.split('/'),
  ].filter((s) => s.length > 0);
  return segments.length === 0 ? '/' : `/${segments.join('/')}/`;
}

const dateLocales: Record<Locale, string> = { vi: 'vi-VN', en: 'en-US' };

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(dateLocales[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
