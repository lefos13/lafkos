/*
 * Locale helpers are deliberately small and dependency-free so every route,
 * content query, and language switch shares the same safe fallback behavior.
 */

export const locales = ['el', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'el';

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'el' ? 'en' : 'el';
}

export function localized<T>(value: Record<Locale, T>, locale: Locale): T {
  return value[locale];
}
