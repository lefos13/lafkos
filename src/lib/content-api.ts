/*
 * The local adapter mirrors the future Sanity query boundary. Pages ask for
 * already-shaped content and never know whether it came from seed data or a
 * published CMS document.
 */

import { categories, places, stories, trails } from '../data/content';
import type { Locale } from './locales';
import type { MapData, MapFeature, Place, Story, Trail } from './content';

export function findPlace(locale: Locale, slug: string): Place | undefined {
  return places.find((place) => place.slug[locale] === slug);
}

export function findTrail(locale: Locale, slug: string): Trail | undefined {
  return trails.find((trail) => trail.slug[locale] === slug);
}

export function findStory(locale: Locale, slug: string): Story | undefined {
  return stories.find((story) => story.slug[locale] === slug);
}

export function publicMapData(locale: Locale): MapData {
  const placeFeatures: MapFeature[] = places.map((place) => ({
    type: 'Feature', geometry: place.geometry, properties: {
      entityKey: place.entityKey, kind: 'place', category: place.category,
      slug: place.slug[locale], title: place.title[locale], summary: place.summary[locale],
      thumbnail: place.images[0]?.src,
    },
  }));
  const trailFeatures: MapFeature[] = trails.map((trail) => ({
    type: 'Feature', geometry: trail.geometry, properties: {
      entityKey: trail.entityKey, kind: 'trail', category: 'trail',
      slug: trail.slug[locale], title: trail.title[locale], summary: trail.summary[locale],
    },
  }));
  return { schemaVersion: 1, generatedAt: 'seed', places: placeFeatures, trails: trailFeatures };
}

export function featuredPlaces(): Place[] {
  return places.filter((place) => place.featured);
}

export function featuredTrails(): Trail[] {
  return trails.filter((trail) => trail.featured);
}

export function featuredStories(): Story[] {
  return stories.filter((story) => story.featured);
}

export { categories, places, stories, trails };
