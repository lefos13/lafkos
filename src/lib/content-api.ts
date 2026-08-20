/*
 * The local adapter mirrors the future Sanity query boundary. Pages ask for
 * already-shaped content and never know whether it came from seed data or a
 * published CMS document.
 */

import { categories, places, stories, trails } from '../data/content';
import type { Locale } from './locales';
import type { Coordinate, MapData, MapFeature, Place, Story, Trail } from './content';

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
  const trailFeatures: MapFeature[] = trails.map((trail) => ({
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
    waypoints: waypointFeatures(locale, placeFeatures),
  };
}

/* A drawn trail that runs off to an unmarked destination reads as a bug on the
 * map, so every waypoint a path actually passes gets its own marker. Waypoints
 * a place marker already covers are skipped, and so are ones that describe a
 * broad area away from the drawn line — planting a marker in empty ground is
 * the same defect in reverse. */
const waypointMergeMetres = 70;
const waypointOnPathMetres = 150;

function metresBetween([lonA, latA]: Coordinate, [lonB, latB]: Coordinate): number {
  const latScale = 110_574;
  const lonScale = 111_320 * Math.cos(((latA + latB) / 2) * (Math.PI / 180));
  return Math.hypot((lonA - lonB) * lonScale, (latA - latB) * latScale);
}

function waypointFeatures(locale: Locale, placeFeatures: MapFeature[]): MapFeature[] {
  const taken: Coordinate[] = placeFeatures
    .filter((feature) => feature.geometry.type === 'Point')
    .map((feature) => (feature.geometry as { coordinates: Coordinate }).coordinates);
  const features: MapFeature[] = [];
  trails.forEach((trail) => {
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
