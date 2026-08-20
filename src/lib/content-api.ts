/*
 * Content API Adapter: Unifies access to content across the local seed dataset
 * and the Sanity Content Lake. Pages request structured content through these
 * boundary functions without coupling to CMS implementation details.
 */

import {
  categories as seedCategories,
  places as seedPlaces,
  stories as seedStories,
  trails as seedTrails,
} from '../data/content';
import type { Coordinate, MapData, MapFeature, Place, Story, Trail, Category } from './content';
import type { Locale } from './locales';
import { isSanityConfigured, getSanityClient } from './sanity-client';
import {
  CATEGORIES_QUERY,
  PLACES_QUERY,
  STORIES_QUERY,
  TRAILS_QUERY,
  transformSanityCategories,
  transformSanityPlaces,
  transformSanityStories,
  transformSanityTrails,
  type SanityCategoryDoc,
  type SanityPlaceDoc,
  type SanityStoryDoc,
  type SanityTrailDoc,
} from './sanity-transform';

export interface ContentDataset {
  places: Place[];
  trails: Trail[];
  stories: Story[];
  categories: Category[];
  source: 'sanity' | 'seed';
}

const defaultDataset: ContentDataset = {
  places: seedPlaces,
  trails: seedTrails,
  stories: seedStories,
  categories: seedCategories,
  source: 'seed',
};

let cachedDataset: ContentDataset | null = null;

export async function fetchSanityContent(): Promise<ContentDataset> {
  if (cachedDataset) {
    return cachedDataset;
  }

  if (!isSanityConfigured()) {
    cachedDataset = defaultDataset;
    return defaultDataset;
  }

  try {
    const client = getSanityClient();
    const [rawPlaces, rawTrails, rawStories, rawCategories] = await Promise.all([
      client.fetch<SanityPlaceDoc[]>(PLACES_QUERY),
      client.fetch<SanityTrailDoc[]>(TRAILS_QUERY),
      client.fetch<SanityStoryDoc[]>(STORIES_QUERY),
      client.fetch<SanityCategoryDoc[]>(CATEGORIES_QUERY),
    ]);

    const places = rawPlaces?.length ? transformSanityPlaces(rawPlaces) : seedPlaces;
    const trails = rawTrails?.length ? transformSanityTrails(rawTrails) : seedTrails;
    const stories = rawStories?.length ? transformSanityStories(rawStories) : seedStories;
    const categories = rawCategories?.length
      ? transformSanityCategories(rawCategories)
      : seedCategories;

    cachedDataset = {
      places,
      trails,
      stories,
      categories,
      source: rawPlaces?.length ? 'sanity' : 'seed',
    };
    return cachedDataset;
  } catch (error) {
    console.warn(
      'Failed to fetch content from Sanity Content Lake, falling back to seed dataset:',
      error,
    );
    cachedDataset = defaultDataset;
    return defaultDataset;
  }
}

export function findPlace(
  locale: Locale,
  slug: string,
  dataset: Place[] = defaultDataset.places,
): Place | undefined {
  return dataset.find((place) => place.slug[locale] === slug);
}

export function findTrail(
  locale: Locale,
  slug: string,
  dataset: Trail[] = defaultDataset.trails,
): Trail | undefined {
  return dataset.find((trail) => trail.slug[locale] === slug);
}

export function findStory(
  locale: Locale,
  slug: string,
  dataset: Story[] = defaultDataset.stories,
): Story | undefined {
  return dataset.find((story) => story.slug[locale] === slug);
}

export function publicMapData(
  locale: Locale,
  dataset: { places: Place[]; trails: Trail[] } = defaultDataset,
): MapData {
  const placeFeatures: MapFeature[] = dataset.places.map((place) => ({
    type: 'Feature',
    geometry: place.geometry,
    properties: {
      entityKey: place.entityKey,
      kind: 'place',
      category: place.category,
      slug: place.slug[locale],
      title: place.title[locale],
      summary: place.summary[locale],
      thumbnail: place.images[0]?.src,
    },
  }));
  const trailFeatures: MapFeature[] = dataset.trails.map((trail) => ({
    type: 'Feature',
    geometry: trail.geometry,
    properties: {
      entityKey: trail.entityKey,
      kind: 'trail',
      category: 'trail',
      slug: trail.slug[locale],
      title: trail.title[locale],
      summary: trail.summary[locale],
    },
  }));
  return {
    schemaVersion: 1,
    generatedAt: 'seed',
    places: placeFeatures,
    trails: trailFeatures,
    waypoints: waypointFeatures(locale, placeFeatures, dataset.trails),
  };
}

const waypointMergeMetres = 70;
const waypointOnPathMetres = 150;

function metresBetween([lonA, latA]: Coordinate, [lonB, latB]: Coordinate): number {
  const latScale = 110_574;
  const lonScale = 111_320 * Math.cos(((latA + latB) / 2) * (Math.PI / 180));
  return Math.hypot((lonA - lonB) * lonScale, (latA - latB) * latScale);
}

function waypointFeatures(
  locale: Locale,
  placeFeatures: MapFeature[],
  trailsList: Trail[] = defaultDataset.trails,
): MapFeature[] {
  const taken: Coordinate[] = placeFeatures.flatMap((feature) =>
    feature.geometry.type === 'Point' ? [feature.geometry.coordinates] : [],
  );
  const features: MapFeature[] = [];
  trailsList.forEach((trail) => {
    trail.waypoints.forEach((waypoint, index) => {
      const onPath = trail.geometry.coordinates.some(
        (vertex) => metresBetween(vertex, waypoint.coordinate) <= waypointOnPathMetres,
      );
      if (!onPath) return;
      if (
        taken.some((claimed) => metresBetween(claimed, waypoint.coordinate) <= waypointMergeMetres)
      )
        return;
      taken.push(waypoint.coordinate);
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: waypoint.coordinate },
        properties: {
          entityKey: `${trail.entityKey}-waypoint-${index}`,
          kind: 'waypoint',
          category: 'trail',
          slug: trail.slug[locale],
          title: waypoint.title[locale],
          summary: trail.title[locale],
          thumbnail: waypoint.image?.src,
          parentKey: trail.entityKey,
        },
      });
    });
  });
  return features;
}

export function featuredPlaces(dataset: Place[] = defaultDataset.places): Place[] {
  return dataset.filter((place) => place.featured);
}

export function featuredTrails(dataset: Trail[] = defaultDataset.trails): Trail[] {
  return dataset.filter((trail) => trail.featured);
}

export function featuredStories(dataset: Story[] = defaultDataset.stories): Story[] {
  return dataset.filter((story) => story.featured);
}

export const categories = seedCategories;
export const places = seedPlaces;
export const stories = seedStories;
export const trails = seedTrails;
