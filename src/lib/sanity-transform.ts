import {
  storyEventSchema,
  type Category,
  type CategoryId,
  type Coordinate,
  type EditorialMetadata,
  type ImageAsset,
  type Place,
  type SeoMetadata,
  type Source,
  type Story,
  type Trail,
  type RouteType,
} from './content';
import { urlForImage } from './sanity-client';

export const PLACES_QUERY = `*[_type == "place" && !(_id in path("drafts.**"))] {
  _id,
  _type,
  entityKey,
  language,
  title,
  eyebrow,
  slug,
  summary,
  body,
  category,
  coordinate,
  mapAnchor,
  hero {
    ...,
    asset-> { _id, url }
  },
  gallery[] {
    ...,
    asset-> { _id, url }
  },
  practical,
  videoUrl,
  seoTitle,
  seoDescription,
  socialImage {
    ...,
    asset-> { _id, url }
  },
  publishedAt,
  modifiedAt,
  author,
  sources,
  featured,
  isSeed
}`;

export const TRAILS_QUERY = `*[_type == "trail" && !(_id in path("drafts.**"))] {
  _id,
  _type,
  entityKey,
  language,
  title,
  eyebrow,
  slug,
  summary,
  body,
  geometry,
  routeType,
  waypoints[] {
    title,
    coordinate,
    "placeKey": placeKey->entityKey,
    image {
      ...,
      asset-> { _id, url }
    }
  },
  distanceMeters,
  durationMinutes,
  elevationGainMeters,
  difficulty,
  surface,
  safety,
  videoUrl,
  seoTitle,
  seoDescription,
  socialImage {
    ...,
    asset-> { _id, url }
  },
  publishedAt,
  modifiedAt,
  author,
  sources,
  featured,
  isSeed
}`;

export const STORIES_QUERY = `*[_type == "story" && !(_id in path("drafts.**"))] {
  _id,
  _type,
  entityKey,
  language,
  title,
  eyebrow,
  slug,
  summary,
  body,
  hero {
    ...,
    asset-> { _id, url }
  },
  event {
    month,
    dayStart,
    dayEnd,
    whenLabel
  },
  relatedKeys,
  seoTitle,
  seoDescription,
  socialImage {
    ...,
    asset-> { _id, url }
  },
  publishedAt,
  modifiedAt,
  author,
  sources,
  featured,
  isSeed
}`;

export const CATEGORIES_QUERY = `*[_type == "category" && !(_id in path("drafts.**"))] {
  _id,
  _type,
  id,
  labelEl,
  labelEn,
  descriptionEl,
  descriptionEn,
  color,
  icon
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && _id == "siteSettings"][0] {
  _id,
  _type,
  siteTitleEl,
  siteTitleEn,
  descriptionEl,
  descriptionEn,
  introEl,
  introEn,
  introLongEl,
  introLongEn,
  seedNoticeEl,
  seedNoticeEn,
  emergencyNoticeEl,
  emergencyNoticeEn,
  footerEl,
  footerEn
}`;

export interface SanityImageRaw {
  _type?: string;
  externalUrl?: string;
  url?: string;
  src?: string;
  alt?: string;
  credit?: string;
  license?: string;
  asset?: { _id?: string; _ref?: string; url?: string };
}

export function transformSanityImage(raw?: SanityImageRaw): ImageAsset | undefined {
  if (!raw) return undefined;

  let srcUrl: string | undefined;

  if (raw.externalUrl && typeof raw.externalUrl === 'string') {
    srcUrl = raw.externalUrl;
  } else if (raw.src && typeof raw.src === 'string') {
    srcUrl = raw.src;
  } else if (raw.url && typeof raw.url === 'string') {
    srcUrl = raw.url;
  } else if (raw.asset?.url && typeof raw.asset.url === 'string') {
    srcUrl = raw.asset.url;
  } else if (raw.asset?._ref || raw.asset?._id) {
    const built = urlForImage(raw);
    srcUrl = built?.url() ?? undefined;
  }

  if (!srcUrl) {
    return undefined;
  }

  return {
    src: srcUrl,
    alt: raw.alt || 'Lafkos guide image',
    credit: raw.credit || 'Lafkos Guide Archive',
    license: raw.license || 'CC BY-SA 4.0',
  };
}

/*
 * Merges optional bilingual editorial and SEO fields from paired Sanity documents.
 * Returns an empty object when no metadata is present on either document.
 */
export function transformSanityEditorialMetadata(
  el?: {
    seoTitle?: string;
    seoDescription?: string;
    socialImage?: SanityImageRaw;
    publishedAt?: string;
    modifiedAt?: string;
    author?: string;
  },
  en?: {
    seoTitle?: string;
    seoDescription?: string;
    socialImage?: SanityImageRaw;
    publishedAt?: string;
    modifiedAt?: string;
    author?: string;
  },
): EditorialMetadata {
  const elSocialImage = transformSanityImage(el?.socialImage);
  const enSocialImage = transformSanityImage(en?.socialImage);

  const elSeo: SeoMetadata | undefined =
    el?.seoTitle || el?.seoDescription || elSocialImage
      ? {
          ...(el?.seoTitle ? { title: el.seoTitle } : {}),
          ...(el?.seoDescription ? { description: el.seoDescription } : {}),
          ...(elSocialImage ? { socialImage: elSocialImage } : {}),
        }
      : undefined;

  const enSeo: SeoMetadata | undefined =
    en?.seoTitle || en?.seoDescription || enSocialImage
      ? {
          ...(en?.seoTitle ? { title: en.seoTitle } : {}),
          ...(en?.seoDescription ? { description: en.seoDescription } : {}),
          ...(enSocialImage ? { socialImage: enSocialImage } : {}),
        }
      : undefined;

  const seo =
    elSeo || enSeo
      ? {
          el: elSeo ?? {},
          en: enSeo ?? {},
        }
      : undefined;

  const publishedAt = el?.publishedAt || en?.publishedAt || undefined;
  const modifiedAt = el?.modifiedAt || en?.modifiedAt || undefined;

  const author =
    el?.author || en?.author
      ? {
          el: el?.author || en?.author || '',
          en: en?.author || el?.author || '',
        }
      : undefined;

  return {
    ...(seo ? { seo } : {}),
    ...(publishedAt ? { publishedAt } : {}),
    ...(modifiedAt ? { modifiedAt } : {}),
    ...(author ? { author } : {}),
  };
}

export interface SanityPlaceDoc {
  _id: string;
  _type: 'place';
  entityKey: string;
  language: 'el' | 'en';
  title?: string;
  eyebrow?: string;
  slug?: { current?: string };
  summary?: string;
  body?: string[];
  category: Exclude<CategoryId, 'trail'>;
  coordinate: { lat: number; lng: number };
  mapAnchor?: { lat: number; lng: number };
  hero?: SanityImageRaw;
  gallery?: SanityImageRaw[];
  practical?: string[];
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: SanityImageRaw;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  sources?: Array<{ label: string; url: string }>;
  featured?: boolean;
  isSeed?: boolean;
}

export function transformSanityPlaces(docs: SanityPlaceDoc[]): Place[] {
  const byKey = new Map<string, { el?: SanityPlaceDoc; en?: SanityPlaceDoc }>();

  for (const doc of docs) {
    if (!doc.entityKey) continue;
    const current = byKey.get(doc.entityKey) ?? {};
    if (doc.language === 'el') current.el = doc;
    if (doc.language === 'en') current.en = doc;
    byKey.set(doc.entityKey, current);
  }

  const places: Place[] = [];

  for (const [entityKey, pair] of byKey.entries()) {
    const el = pair.el ?? pair.en;
    const en = pair.en ?? pair.el;
    if (!el || !en) continue;

    const coord: Coordinate = [
      el.coordinate?.lng ?? en.coordinate?.lng ?? 23.24665,
      el.coordinate?.lat ?? en.coordinate?.lat ?? 39.17795,
    ];

    const anchor: Coordinate = el.mapAnchor
      ? [el.mapAnchor.lng, el.mapAnchor.lat]
      : en.mapAnchor
        ? [en.mapAnchor.lng, en.mapAnchor.lat]
        : coord;

    const hero = transformSanityImage(el.hero) || transformSanityImage(en.hero);
    const galleryImages = (el.gallery || en.gallery || [])
      .map(transformSanityImage)
      .filter((img): img is ImageAsset => img !== undefined);

    const images = hero ? [hero, ...galleryImages] : galleryImages;

    const rawSources = el.sources || en.sources || [];
    const sources: Source[] = rawSources.map((s) => ({
      label: s.label || 'OpenStreetMap',
      url: s.url || 'https://www.openstreetmap.org/',
    }));

    places.push({
      kind: 'place',
      entityKey,
      ...transformSanityEditorialMetadata(el, en),
      slug: {
        el: el.slug?.current || entityKey,
        en: en.slug?.current || entityKey,
      },
      title: {
        el: el.title || entityKey,
        en: en.title || entityKey,
      },
      eyebrow: {
        el: el.eyebrow || '',
        en: en.eyebrow || '',
      },
      summary: {
        el: el.summary || '',
        en: en.summary || '',
      },
      body: {
        el: el.body || [],
        en: en.body || [],
      },
      category: el.category || 'heritage',
      geometry: {
        type: 'Point',
        coordinates: coord,
      },
      mapAnchor: anchor,
      images,
      /* GROQ projects absent fields as explicit null; normalize so the seed
       * archive omits the key entirely instead of emitting `videoUrl: null`. */
      videoUrl: el.videoUrl ?? en.videoUrl ?? undefined,
      practical: {
        el: el.practical || [],
        en: en.practical || [],
      },
      sources:
        sources.length > 0 ? sources : [{ label: 'Lafkos Guide', url: 'https://lafkos.guide' }],
      featured: Boolean(el.featured || en.featured),
      isSeed: Boolean(el.isSeed ?? en.isSeed ?? true),
    });
  }

  return places;
}

export interface SanityTrailDoc {
  _id: string;
  _type: 'trail';
  entityKey: string;
  language: 'el' | 'en';
  title?: string;
  eyebrow?: string;
  slug?: { current?: string };
  summary?: string;
  body?: string[];
  geometry?: Array<{ lng: number; lat: number }>;
  waypoints?: Array<{
    title?: string;
    coordinate: { lng: number; lat: number };
    placeKey?: string | { entityKey?: string; _ref?: string };
    image?: SanityImageRaw;
  }>;
  routeType?: RouteType;
  distanceMeters?: number;
  durationMinutes?: number;
  elevationGainMeters?: number;
  difficulty?: 'easy' | 'moderate' | 'demanding';
  surface?: string;
  safety?: string[];
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: SanityImageRaw;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  sources?: Array<{ label: string; url: string }>;
  featured?: boolean;
  isSeed?: boolean;
}

function resolveSanityPlaceKey(
  value?: string | { entityKey?: string; _ref?: string },
): string | undefined {
  if (typeof value === 'string') return value;
  if (value?.entityKey) return value.entityKey;
  const match = value?._ref?.match(/^place-(.+)-(?:el|en)$/);
  return match?.[1];
}

export function transformSanityTrails(docs: SanityTrailDoc[]): Trail[] {
  const byKey = new Map<string, { el?: SanityTrailDoc; en?: SanityTrailDoc }>();

  for (const doc of docs) {
    if (!doc.entityKey) continue;
    const current = byKey.get(doc.entityKey) ?? {};
    if (doc.language === 'el') current.el = doc;
    if (doc.language === 'en') current.en = doc;
    byKey.set(doc.entityKey, current);
  }

  const trails: Trail[] = [];

  for (const [entityKey, pair] of byKey.entries()) {
    const el = pair.el ?? pair.en;
    const en = pair.en ?? pair.el;
    if (!el || !en) continue;

    const rawCoords = el.geometry || en.geometry || [];
    const coordinates: Coordinate[] =
      rawCoords.length >= 2
        ? rawCoords.map((p) => [p.lng, p.lat] as Coordinate)
        : [
            [23.24665, 39.17795],
            [23.247, 39.178],
          ];

    const rawWaypointsEl = el.waypoints || [];
    const rawWaypointsEn = en.waypoints || [];
    const maxWp = Math.max(rawWaypointsEl.length, rawWaypointsEn.length);

    const waypoints: Trail['waypoints'] = [];
    for (let i = 0; i < maxWp; i++) {
      const wpEl = rawWaypointsEl[i] ?? rawWaypointsEn[i];
      const wpEn = rawWaypointsEn[i] ?? rawWaypointsEl[i];
      if (!wpEl || !wpEn) continue;

      const coord: Coordinate = [
        wpEl.coordinate?.lng ?? wpEn.coordinate?.lng ?? 23.24665,
        wpEl.coordinate?.lat ?? wpEn.coordinate?.lat ?? 39.17795,
      ];

      waypoints.push({
        title: {
          el: wpEl.title || `Σημείο ${i + 1}`,
          en: wpEn.title || `Waypoint ${i + 1}`,
        },
        coordinate: coord,
        placeKey: resolveSanityPlaceKey(wpEl.placeKey) || resolveSanityPlaceKey(wpEn.placeKey),
        image: transformSanityImage(wpEl.image) || transformSanityImage(wpEn.image),
      });
    }

    const rawSources = el.sources || en.sources || [];
    const sources: Source[] = rawSources.map((s) => ({
      label: s.label || 'Pelion Routes',
      url: s.url || 'https://pelionroutes.com/',
    }));

    trails.push({
      kind: 'trail',
      entityKey,
      ...transformSanityEditorialMetadata(el, en),
      slug: {
        el: el.slug?.current || entityKey,
        en: en.slug?.current || entityKey,
      },
      title: {
        el: el.title || entityKey,
        en: en.title || entityKey,
      },
      eyebrow: {
        el: el.eyebrow || '',
        en: en.eyebrow || '',
      },
      summary: {
        el: el.summary || '',
        en: en.summary || '',
      },
      body: {
        el: el.body || [],
        en: en.body || [],
      },
      geometry: {
        type: 'LineString',
        coordinates,
      },
      routeType: el.routeType ?? en.routeType ?? 'hiking',
      distanceMeters: el.distanceMeters ?? en.distanceMeters ?? 1000,
      durationMinutes: el.durationMinutes ?? en.durationMinutes ?? 30,
      elevationGainMeters: el.elevationGainMeters ?? en.elevationGainMeters ?? 50,
      difficulty: el.difficulty ?? en.difficulty ?? 'easy',
      surface: {
        el: el.surface || '',
        en: en.surface || '',
      },
      safety: {
        el: el.safety || [],
        en: en.safety || [],
      },
      videoUrl: el.videoUrl ?? en.videoUrl ?? undefined,
      waypoints,
      sources:
        sources.length > 0
          ? sources
          : [{ label: 'Pelion Routes', url: 'https://pelionroutes.com/' }],
      featured: Boolean(el.featured || en.featured),
      isSeed: Boolean(el.isSeed ?? en.isSeed ?? true),
    });
  }

  return trails;
}

export interface SanityStoryDoc {
  _id: string;
  _type: 'story';
  entityKey: string;
  language: 'el' | 'en';
  title?: string;
  eyebrow?: string;
  slug?: { current?: string };
  summary?: string;
  body?: string[];
  hero?: SanityImageRaw;
  event?: {
    month?: number;
    dayStart?: number;
    dayEnd?: number;
    whenLabel?: string;
  };
  relatedKeys?: string[];
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: SanityImageRaw;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  sources?: Array<{ label: string; url: string }>;
  featured?: boolean;
  isSeed?: boolean;
}

function transformSanityStoryEvent(
  elEvent: SanityStoryDoc['event'],
  enEvent: SanityStoryDoc['event'],
): Story['event'] {
  if (!elEvent && !enEvent) return undefined;

  const parsed = storyEventSchema.safeParse({
    month: elEvent?.month ?? enEvent?.month,
    ...(elEvent?.dayStart !== undefined || enEvent?.dayStart !== undefined
      ? { dayStart: elEvent?.dayStart ?? enEvent?.dayStart }
      : {}),
    ...(elEvent?.dayEnd !== undefined || enEvent?.dayEnd !== undefined
      ? { dayEnd: elEvent?.dayEnd ?? enEvent?.dayEnd }
      : {}),
    whenLabel: {
      el: elEvent?.whenLabel ?? enEvent?.whenLabel ?? '',
      en: enEvent?.whenLabel ?? elEvent?.whenLabel ?? '',
    },
  });

  return parsed.success ? parsed.data : undefined;
}

export function transformSanityStories(docs: SanityStoryDoc[]): Story[] {
  const byKey = new Map<string, { el?: SanityStoryDoc; en?: SanityStoryDoc }>();

  for (const doc of docs) {
    if (!doc.entityKey) continue;
    const current = byKey.get(doc.entityKey) ?? {};
    if (doc.language === 'el') current.el = doc;
    if (doc.language === 'en') current.en = doc;
    byKey.set(doc.entityKey, current);
  }

  const stories: Story[] = [];

  for (const [entityKey, pair] of byKey.entries()) {
    const el = pair.el ?? pair.en;
    const en = pair.en ?? pair.el;
    if (!el || !en) continue;

    const hero = transformSanityImage(el.hero) ||
      transformSanityImage(en.hero) || {
        src: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Platia_in_Lafkos%2C_Pilion.jpg',
        alt: 'Lafkos story',
        credit: 'Lafkos Guide Archive',
        license: 'CC BY-SA 4.0',
      };

    const rawSources = el.sources || en.sources || [];
    const sources: Source[] = rawSources.map((s) => ({
      label: s.label || 'Lafkos Archive',
      url: s.url || 'https://lafkos.gr/',
    }));

    const event = transformSanityStoryEvent(el.event, en.event);

    stories.push({
      kind: 'story',
      entityKey,
      ...transformSanityEditorialMetadata(el, en),
      slug: {
        el: el.slug?.current || entityKey,
        en: en.slug?.current || entityKey,
      },
      title: {
        el: el.title || entityKey,
        en: en.title || entityKey,
      },
      eyebrow: {
        el: el.eyebrow || '',
        en: en.eyebrow || '',
      },
      summary: {
        el: el.summary || '',
        en: en.summary || '',
      },
      body: {
        el: el.body || [],
        en: en.body || [],
      },
      image: hero,
      ...(event ? { event } : {}),
      relatedKeys: el.relatedKeys || en.relatedKeys || [],
      sources:
        sources.length > 0 ? sources : [{ label: 'Lafkos Archive', url: 'https://lafkos.gr/' }],
      featured: Boolean(el.featured || en.featured),
      isSeed: Boolean(el.isSeed ?? en.isSeed ?? true),
    });
  }

  return stories;
}

export interface SanityCategoryDoc {
  _id: string;
  _type: 'category';
  id: CategoryId;
  labelEl?: string;
  labelEn?: string;
  descriptionEl?: string;
  descriptionEn?: string;
  color?: string;
  icon?: string;
}

export function transformSanityCategories(docs: SanityCategoryDoc[]): Category[] {
  return docs.map((doc) => ({
    id: doc.id,
    label: {
      el: doc.labelEl || doc.id,
      en: doc.labelEn || doc.id,
    },
    description: {
      el: doc.descriptionEl || '',
      en: doc.descriptionEn || '',
    },
    color: doc.color || '#4f7868',
    icon: doc.icon || '✦',
  }));
}
