/*
 * Structured Data & Safe JSON-LD Generation:
 * Provides strongly-typed, factual Schema.org generators for the homepage,
 * place/trail/story detail pages, and content hubs.
 * JSON-LD serialization escapes '<' and unicode separators to safely embed inside HTML scripts.
 */

import type { LocalizedEditorialMetadata } from './content-api';
import type { Localized, Place, Story, Trail } from './content';
import type { Locale } from './locales';
import { normalizeTrailingSlash } from './urls';

export const canonicalSiteOrigin = 'https://lafkos-guide.vercel.app';

/*
 * Builds an absolute canonical URL using the canonical site origin
 * and enforces the trailing slash URL format for routes, preserving
 * file extensions without trailing slashes for static assets.
 */
export function buildCanonicalUrl(pathname: string): string {
  const isAsset = /\.[a-z0-9]+$/i.test(pathname);
  if (isAsset) {
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${canonicalSiteOrigin}${cleanPath}`;
  }
  return `${canonicalSiteOrigin}${normalizeTrailingSlash(pathname)}`;
}

export const DEFAULT_SEO_DESCRIPTION_MAX_LENGTH = 160;

/*
 * SEO Snippet Formatting:
 * Normalizes whitespace and truncates long summary fallbacks at word boundaries
 * to produce clean, readable meta descriptions within standard search engine snippet limits
 * (capped at ~155-160 characters). Preserves un-truncated text when within budget,
 * avoids dangling punctuation or half-open delimiters, and safely handles unbroken tokens.
 */
export function formatSeoSnippet(
  text: string | null | undefined,
  maxLength: number = DEFAULT_SEO_DESCRIPTION_MAX_LENGTH,
  ellipsis: string = '…',
): string {
  if (!text || maxLength <= 0) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const budget = maxLength - ellipsis.length;
  if (budget <= 0) {
    return ellipsis.slice(0, maxLength);
  }

  const rawSlice = normalized.slice(0, budget);
  const lastSpaceIndex = rawSlice.lastIndexOf(' ');

  let truncated = lastSpaceIndex > 0 ? rawSlice.slice(0, lastSpaceIndex) : rawSlice;
  truncated = truncated.replace(/[\s,;:!?.—–\-/\\()[\]{}«»"“”'`]+$/, '');

  const openParenCount = (truncated.match(/\(/g) || []).length;
  const closeParenCount = (truncated.match(/\)/g) || []).length;
  if (openParenCount > closeParenCount) {
    const lastOpenParen = truncated.lastIndexOf('(');
    const beforeParen = truncated
      .slice(0, lastOpenParen)
      .replace(/[\s,;:!?.—–\-/\\()[\]{}«»"“”'`]+$/, '');
    if (beforeParen.length > 0) {
      truncated = beforeParen;
    }
  }

  const openBracketCount = (truncated.match(/\[/g) || []).length;
  const closeBracketCount = (truncated.match(/\]/g) || []).length;
  if (openBracketCount > closeBracketCount) {
    const lastOpenBracket = truncated.lastIndexOf('[');
    const beforeBracket = truncated
      .slice(0, lastOpenBracket)
      .replace(/[\s,;:!?.—–\-/\\()[\]{}«»"“”'`]+$/, '');
    if (beforeBracket.length > 0) {
      truncated = beforeBracket;
    }
  }

  truncated = truncated.replace(/[\s,;:!?.—–\-/\\()[\]{}«»"“”'`]+$/, '');

  if (truncated.length === 0) {
    truncated = rawSlice.trim();
  }

  return `${truncated}${ellipsis}`;
}

/*
 * Safely serializes an object into a JSON-LD script-compatible string.
 * Replaces '<' with unicode escape '\u003c' so hostile payload strings
 * cannot terminate the script block (e.g. </script>) or inject HTML comments (<!--).
 * Also escapes unicode line and paragraph separators \u2028 and \u2029 for JS safety.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SchemaBreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export function buildBreadcrumbList(crumbs: BreadcrumbItem[]): SchemaBreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export interface SchemaWebSite {
  '@type': 'WebSite';
  '@id': string;
  name: string;
  url: string;
  inLanguage: string[];
}

export interface SchemaOrganization {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo: string;
}

export interface SchemaHomeGraph {
  '@context': 'https://schema.org';
  '@graph': [SchemaWebSite, SchemaOrganization];
}

/*
 * Homepage Structured Data:
 * Generates stable site-wide WebSite and Organization entities emitted
 * identically across localized homepages (/el/ and /en/) with root @id and URL.
 * Excludes SearchAction since there is no public site-search endpoint contract.
 */
export function buildHomeJsonLd(): SchemaHomeGraph {
  const rootUrl = buildCanonicalUrl('/');
  const logoUrl = buildCanonicalUrl('/images/og-default.png');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${rootUrl}#website`,
        name: 'Lafkos Guide',
        url: rootUrl,
        inLanguage: ['el', 'en'],
      },
      {
        '@type': 'Organization',
        '@id': `${rootUrl}#organization`,
        name: 'Lafkos Guide',
        url: rootUrl,
        logo: logoUrl,
      },
    ],
  };
}

export interface SchemaGeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface SchemaTouristAttraction {
  '@type': 'TouristAttraction';
  name: string;
  description: string;
  url: string;
  inLanguage: Locale;
  geo: SchemaGeoCoordinates;
  image?: string[];
}

export interface SchemaPlaceGraph {
  '@context': 'https://schema.org';
  '@graph': [SchemaBreadcrumbList, SchemaTouristAttraction];
}

/*
 * Place Detail Structured Data:
 * Generates BreadcrumbList and Schema.org TouristAttraction.
 * Only includes factual coordinates (latitude, longitude) and verified images.
 */
export function buildPlaceJsonLd({
  place,
  locale,
  editorial,
  seoDescription,
  seoTitle,
}: {
  place: Place;
  locale: Locale;
  editorial?: LocalizedEditorialMetadata;
  seoDescription?: string;
  seoTitle?: string;
}): SchemaPlaceGraph {
  const homeLabel = locale === 'el' ? 'Αρχική' : 'Home';
  const placesLabel = locale === 'el' ? 'Μέρη' : 'Places';
  const placeTitle = seoTitle ?? editorial?.title ?? place.title[locale];
  const placeDescription =
    seoDescription ?? editorial?.description ?? formatSeoSnippet(place.summary[locale]);
  const placeUrl = buildCanonicalUrl(`/${locale}/places/${place.slug[locale]}/`);
  const images = place.images.map((img) => img.src);
  if (editorial?.socialImage?.src && !images.includes(editorial.socialImage.src)) {
    images.unshift(editorial.socialImage.src);
  }

  const breadcrumbs = buildBreadcrumbList([
    { name: homeLabel, url: buildCanonicalUrl(`/${locale}/`) },
    { name: placesLabel, url: buildCanonicalUrl(`/${locale}/places/`) },
    { name: placeTitle, url: placeUrl },
  ]);

  const attraction: SchemaTouristAttraction = {
    '@type': 'TouristAttraction',
    name: placeTitle,
    description: placeDescription,
    url: placeUrl,
    inLanguage: locale,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.mapAnchor[1],
      longitude: place.mapAnchor[0],
    },
    ...(images.length > 0 ? { image: images } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbs, attraction],
  };
}

export interface SchemaTouristTrip {
  '@type': 'TouristTrip';
  name: string;
  description: string;
  url: string;
  inLanguage: Locale;
  image?: string[];
}

export interface SchemaTrailGraph {
  '@context': 'https://schema.org';
  '@graph': [SchemaBreadcrumbList, SchemaTouristTrip];
}

/*
 * Trail Detail Structured Data:
 * Generates BreadcrumbList and Schema.org TouristTrip.
 */
export function buildTrailJsonLd({
  trail,
  locale,
  editorial,
  seoDescription,
  seoTitle,
}: {
  trail: Trail;
  locale: Locale;
  editorial?: LocalizedEditorialMetadata;
  seoDescription?: string;
  seoTitle?: string;
}): SchemaTrailGraph {
  const homeLabel = locale === 'el' ? 'Αρχική' : 'Home';
  const trailsLabel = locale === 'el' ? 'Διαδρομές' : 'Trails';
  const trailTitle = seoTitle ?? editorial?.title ?? trail.title[locale];
  const trailDescription =
    seoDescription ?? editorial?.description ?? formatSeoSnippet(trail.summary[locale]);
  const trailUrl = buildCanonicalUrl(`/${locale}/trails/${trail.slug[locale]}/`);

  const images: string[] = [];
  if (editorial?.socialImage?.src) {
    images.push(editorial.socialImage.src);
  }
  for (const wp of trail.waypoints) {
    if (wp.image?.src && !images.includes(wp.image.src)) {
      images.push(wp.image.src);
    }
  }

  const breadcrumbs = buildBreadcrumbList([
    { name: homeLabel, url: buildCanonicalUrl(`/${locale}/`) },
    { name: trailsLabel, url: buildCanonicalUrl(`/${locale}/trails/`) },
    { name: trailTitle, url: trailUrl },
  ]);

  const trip: SchemaTouristTrip = {
    '@type': 'TouristTrip',
    name: trailTitle,
    description: trailDescription,
    url: trailUrl,
    inLanguage: locale,
    ...(images.length > 0 ? { image: images } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbs, trip],
  };
}

export interface SchemaArticle {
  '@type': 'Article';
  headline: string;
  description: string;
  url: string;
  mainEntityOfPage: string;
  inLanguage: Locale;
  image: string[];
  publisher: {
    '@type': 'Organization';
    name: string;
    url: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  author?: {
    '@type': 'Person';
    name: string;
  };
  datePublished?: string;
  dateModified?: string;
}

export interface SchemaStoryGraph {
  '@context': 'https://schema.org';
  '@graph': [SchemaBreadcrumbList, SchemaArticle];
}

/*
 * Story Detail Structured Data:
 * Generates BreadcrumbList and Google-compatible Article.
 * Reuses localized editorial metadata overrides for author, dates, and images.
 */
export function buildStoryJsonLd({
  story,
  locale,
  editorial,
  seoDescription,
  seoTitle,
}: {
  story: Story;
  locale: Locale;
  editorial?: LocalizedEditorialMetadata;
  seoDescription?: string;
  seoTitle?: string;
}): SchemaStoryGraph {
  const homeLabel = locale === 'el' ? 'Αρχική' : 'Home';
  const storiesLabel = locale === 'el' ? 'Ιστορίες' : 'Stories';
  const storyTitle = seoTitle ?? editorial?.title ?? story.title[locale];
  const storyDescription =
    seoDescription ?? editorial?.description ?? formatSeoSnippet(story.summary[locale]);
  const storyUrl = buildCanonicalUrl(`/${locale}/stories/${story.slug[locale]}/`);
  const rootUrl = buildCanonicalUrl('/');
  const logoUrl = buildCanonicalUrl('/images/og-default.png');
  const imageSrc = editorial?.socialImage?.src ?? story.image.src;

  const breadcrumbs = buildBreadcrumbList([
    { name: homeLabel, url: buildCanonicalUrl(`/${locale}/`) },
    { name: storiesLabel, url: buildCanonicalUrl(`/${locale}/stories/`) },
    { name: storyTitle, url: storyUrl },
  ]);

  const article: SchemaArticle = {
    '@type': 'Article',
    headline: storyTitle,
    description: storyDescription,
    url: storyUrl,
    mainEntityOfPage: storyUrl,
    inLanguage: locale,
    image: [imageSrc],
    publisher: {
      '@type': 'Organization',
      name: 'Lafkos Guide',
      url: rootUrl,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
    ...(editorial?.author
      ? {
          author: {
            '@type': 'Person',
            name: editorial.author,
          },
        }
      : {}),
    ...(editorial?.publishedAt ? { datePublished: editorial.publishedAt } : {}),
    ...(editorial?.modifiedAt
      ? { dateModified: editorial.modifiedAt }
      : editorial?.publishedAt
        ? { dateModified: editorial.publishedAt }
        : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbs, article],
  };
}

export interface SchemaCollectionPage {
  '@type': 'CollectionPage';
  name: string;
  description: string;
  url: string;
  inLanguage: Locale;
  mainEntity: {
    '@type': 'ItemList';
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      url: string;
    }>;
  };
}

export interface SchemaHubGraph {
  '@context': 'https://schema.org';
  '@graph': [SchemaBreadcrumbList, SchemaCollectionPage];
}

/*
 * Content Hub Structured Data:
 * Generates BreadcrumbList and CollectionPage with an ItemList of entities.
 * Avoids carousel-specific markup while providing a crawlable list structure.
 */
export function buildHubJsonLd({
  kind,
  locale,
  title,
  description,
  items,
}: {
  kind: 'places' | 'trails' | 'stories';
  locale: Locale;
  title: string;
  description: string;
  items: Array<{ slug: Localized<string>; title: Localized<string> }>;
}): SchemaHubGraph {
  const homeLabel = locale === 'el' ? 'Αρχική' : 'Home';
  const hubUrl = buildCanonicalUrl(`/${locale}/${kind}/`);

  const breadcrumbs = buildBreadcrumbList([
    { name: homeLabel, url: buildCanonicalUrl(`/${locale}/`) },
    { name: title, url: hubUrl },
  ]);

  const collection: SchemaCollectionPage = {
    '@type': 'CollectionPage',
    name: title,
    description,
    url: hubUrl,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title[locale],
        url: buildCanonicalUrl(`/${locale}/${kind}/${item.slug[locale]}/`),
      })),
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbs, collection],
  };
}
