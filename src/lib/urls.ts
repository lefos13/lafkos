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

export const DEFAULT_SITE_ORIGIN = 'https://lafkos-guide.vercel.app';

/*
 * Generates the absolute canonical URL for any site path, guaranteeing the
 * production origin and enforced trailing slash contract.
 */
export function getAbsoluteCanonicalUrl(
  pathname: string,
  origin: string = DEFAULT_SITE_ORIGIN,
): string {
  const normalized = normalizeTrailingSlash(pathname);
  return new URL(normalized, origin).toString();
}

export interface ShareUrls {
  facebook: string;
  x: string;
  whatsapp: string;
}

/*
 * Pure, privacy-preserving share URL builder for social platforms without third-party
 * tracking SDKs, pixels, or query parameters.
 */
export function buildShareUrls({
  canonicalUrl,
  title,
}: {
  canonicalUrl: string;
  title: string;
}): ShareUrls {
  const encodedUrl = encodeURIComponent(canonicalUrl);

  // Facebook share dialog accepts canonical URL only
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  // X web intent with localized title and canonical URL
  const x = `https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(title)}`;

  // WhatsApp click-to-chat with localized title and canonical URL
  const whatsappText = `${title} — ${canonicalUrl}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return {
    facebook,
    x,
    whatsapp,
  };
}
