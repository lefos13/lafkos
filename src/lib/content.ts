/*
 * This is the public content contract shared by the local seed adapter and the
 * future Sanity adapter. Keeping the contract independent of either provider
 * prevents CMS details from leaking into pages or map behavior.
 */

import { z } from 'zod';
import type { Locale } from './locales';

export const categoryIds = [
  'heritage',
  'architecture',
  'sacred',
  'nature',
  'viewpoint',
  'community',
  'trail',
] as const;
export type CategoryId = (typeof categoryIds)[number];

export const categorySchema = z.enum(categoryIds);
export const coordinateSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
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

export const geometrySchema = z.union([pointSchema, lineStringSchema, polygonSchema]);
export type Coordinate = z.infer<typeof coordinateSchema>;
export type Geometry = z.infer<typeof geometrySchema>;
export type ImageAsset = z.infer<typeof imageSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Localized<T> = Record<Locale, T>;

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
  distanceMeters: number;
  durationMinutes: number;
  elevationGainMeters: number;
  difficulty: 'easy' | 'moderate' | 'demanding';
  surface: Localized<string>;
  safety: Localized<string[]>;
  waypoints: Array<{ title: Localized<string>; coordinate: Coordinate; image?: ImageAsset }>;
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
  relatedKeys: string[];
  sources: Source[];
  featured: boolean;
  isSeed: boolean;
}

export interface MapFeatureProperties {
  entityKey: string;
  kind: 'place' | 'trail';
  category: CategoryId;
  slug: string;
  title: string;
  summary: string;
  thumbnail?: string;
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
}

export const contentConfig = {
  center: [23.24665, 39.17795] as Coordinate,
  bounds: [23.08, 39.04, 23.42, 39.32] as const,
  siteName: 'Lafkos Guide',
};
