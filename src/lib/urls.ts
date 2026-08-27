import { defaultLocale, otherLocale, type Locale } from './locales';

/*
 * Centralize route normalization so canonical, alternate, sitemap, and
 * navigation URLs all resolve to the same final trailing-slash addresses.
 * Explicit alternate paths are supported for bilingual entries whose slugs
 * are translated rather than transliterated.
 */
export function normalizeTrailingSlash(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (path === '/') return '/';
  return `${path.replace(/\/+$/, '')}/`;
}

function replaceLocalePrefix(pathname: string, from: Locale, to: Locale): string {
  return pathname.replace(new RegExp(`^/${from}(?=/|$)`), `/${to}`);
}

export interface LocalizedUrlPaths {
  canonicalPath: string;
  alternatePath: string;
  xDefaultPath: string;
}

export function getLocalizedUrlPaths({
  locale,
  pathname,
  alternatePath: explicitAlternatePath,
}: {
  locale: Locale;
  pathname: string;
  alternatePath?: string;
}): LocalizedUrlPaths {
  const canonicalPath = normalizeTrailingSlash(pathname);
  const alternateLocale = otherLocale(locale);
  const alternatePath = normalizeTrailingSlash(
    explicitAlternatePath ?? replaceLocalePrefix(canonicalPath, locale, alternateLocale),
  );
  const xDefaultPath =
    locale === defaultLocale
      ? canonicalPath
      : explicitAlternatePath
        ? alternatePath
        : replaceLocalePrefix(canonicalPath, locale, defaultLocale);

  return { canonicalPath, alternatePath, xDefaultPath };
}
