/*
 * This is the public content contract shared by the local seed adapter and the
 * future Sanity adapter. Keeping the contract independent of either provider
 * prevents CMS details from leaking into pages or map behavior.
 */

import { z } from 'zod';
import type { Locale } from './locales';
import { parseYouTubeVideoId } from './video';

export const categoryIds = [
  'heritage',
  'architecture',
  'sacred',
  'nature',
  'viewpoint',
  'community',
  'stay',
  'trail',
] as const;
export type CategoryId = (typeof categoryIds)[number];

export const categorySchema = z.enum(categoryIds);
export const routeTypeIds = ['hiking', 'drive', 'mixed'] as const;
export type RouteType = (typeof routeTypeIds)[number];
export const routeTypeSchema = z.enum(routeTypeIds);
export const coordinateSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);
export const pointSchema = z.object({ type: z.literal('Point'), coordinates: coordinateSchema });
export const lineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(coordinateSchema).min(2),
});
export const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinateSchema).min(4)).min(1),
});

export const imageSchema = z.object({
  src: z.url(),
  alt: z.string().min(1).max(240),
  credit: z.string().min(1),
  license: z.string().min(1),
});

export const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
});

/* Optional embedded-video URL for places and trails. Only YouTube is in
 * contract; the parser is shared with the embed component. NOTE: the same
 * validation regex lives duplicated in studio/schemaTypes.ts because Studio
 * cannot import from src/ — keep both in sync when the accepted forms change. */
export const youTubeUrlSchema = z.string().refine((url) => parseYouTubeVideoId(url) !== undefined, {
  message: 'Must be a https YouTube watch, youtu.be, shorts, or embed URL',
});

export const geometrySchema = z.union([pointSchema, lineStringSchema, polygonSchema]);
export type Coordinate = z.infer<typeof coordinateSchema>;
export type Geometry = z.infer<typeof geometrySchema>;
export type ImageAsset = z.infer<typeof imageSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Localized<T> = Record<Locale, T>;

export const storyEventSchema = z
  .object({
    month: z.number().int().min(1).max(12),
    dayStart: z.number().int().min(1).max(31).optional(),
    dayEnd: z.number().int().min(1).max(31).optional(),
    whenLabel: z.object({
      el: z.string().min(1),
      en: z.string().min(1),
    }),
  })
  .refine(
    ({ dayStart, dayEnd }) => dayStart === undefined || dayEnd === undefined || dayEnd >= dayStart,
    { message: 'dayEnd must be greater than or equal to dayStart' },
  );

export interface StoryEvent {
  month: number;
  dayStart?: number;
  dayEnd?: number;
  whenLabel: Localized<string>;
}

export interface Category {
  id: CategoryId;
  label: Localized<string>;
  description: Localized<string>;
  color: string;
  icon: string;
}

export interface Place {
  kind: 'place';
  entityKey: string;
  slug: Localized<string>;
  title: Localized<string>;
  eyebrow: Localized<string>;
  summary: Localized<string>;
  body: Localized<string[]>;
  category: Exclude<CategoryId, 'trail'>;
  geometry: z.infer<typeof pointSchema> | z.infer<typeof polygonSchema>;
  mapAnchor: Coordinate;
  images: ImageAsset[];
  /** Single optional, non-localized YouTube URL for an inline embed. */
  videoUrl?: string;
  practical: Localized<string[]>;
  sources: Source[];
  featured: boolean;
  isSeed: boolean;
}

export interface Trail {
  kind: 'trail';
  entityKey: string;
  slug: Localized<string>;
  title: Localized<string>;
  eyebrow: Localized<string>;
  summary: Localized<string>;
  body: Localized<string[]>;
  geometry: z.infer<typeof lineStringSchema>;
  /* Drive routes reuse the shared metrics, but difficulty, elevation, and
   * safety describe road/access character and driving hazards rather than fitness. */
  routeType?: RouteType;
  distanceMeters: number;
  durationMinutes: number;
  elevationGainMeters: number;
  difficulty: 'easy' | 'moderate' | 'demanding';
  surface: Localized<string>;
  safety: Localized<string[]>;
  waypoints: Array<{
    title: Localized<string>;
    coordinate: Coordinate;
    placeKey?: string;
    image?: ImageAsset;
  }>;
  /** Single optional, non-localized YouTube URL for an inline embed. */
  videoUrl?: string;
  sources: Source[];
  featured: boolean;
  isSeed: boolean;
}

export interface Story {
  kind: 'story';
  entityKey: string;
  slug: Localized<string>;
  title: Localized<string>;
  eyebrow: Localized<string>;
  summary: Localized<string>;
  body: Localized<string[]>;
  image: ImageAsset;
  event?: StoryEvent;
  relatedKeys: string[];
  sources: Source[];
  featured: boolean;
  isSeed: boolean;
}

export interface MapFeatureProperties {
  entityKey: string;
  kind: 'place' | 'trail' | 'waypoint';
  category: CategoryId;
  routeType?: RouteType;
  slug: string;
  title: string;
  summary: string;
  thumbnail?: string;
  /* Waypoints borrow the slug and entityKey of the trail they belong to so the
   * popover can link back to the trail page they were sampled from. */
  parentKey?: string;
}

export interface MapFeature {
  type: 'Feature';
  geometry: Geometry;
  properties: MapFeatureProperties;
}

export interface MapData {
  schemaVersion: 1;
  generatedAt: string;
  places: MapFeature[];
  trails: MapFeature[];
  /* Trail waypoints that no place marker already covers, so a drawn path never
   * runs off to an unmarked destination. */
  waypoints: MapFeature[];
}

export const contentConfig = {
  center: [23.24665, 39.17795] as Coordinate,
  bounds: [23.08, 39.04, 23.42, 39.32] as const,
  siteName: 'Lafkos Guide',
};
