import { describe, expect, it } from 'vitest';
import type { CategoryId, MapData, MapFeature } from '../src/lib/content';
import {
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
  POINT_FOCUS_ZOOM,
  buildVisiblePointFeatures,
} from '../src/lib/map-points';

function createPointFeature(
  entityKey: string,
  kind: 'place' | 'waypoint',
  category: CategoryId,
  coordinates: [number, number] = [23.24, 39.17],
): MapFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: {
      entityKey,
      kind,
      category,
      slug: entityKey,
      title: `Title ${entityKey}`,
      summary: `Summary ${entityKey}`,
    },
  };
}

function createLineFeature(
  entityKey: string,
  category: CategoryId,
  coordinates: Array<[number, number]> = [
    [23.24, 39.17],
    [23.25, 39.18],
  ],
): MapFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: {
      entityKey,
      kind: 'place',
      category,
      slug: entityKey,
      title: `Line title ${entityKey}`,
      summary: `Line summary ${entityKey}`,
    },
  };
}

describe('map point clustering constants', () => {
  it('exports the expected clustering constants', () => {
    expect(CLUSTER_RADIUS).toBe(44);
    expect(CLUSTER_MAX_ZOOM).toBe(16);
    expect(POINT_FOCUS_ZOOM).toBe(17);
  });
});

describe('buildVisiblePointFeatures', () => {
  const placeHeritage = createPointFeature('place-heritage', 'place', 'heritage', [23.24, 39.17]);
  const placeNature = createPointFeature('place-nature', 'place', 'nature', [23.25, 39.18]);
  const placeTrail = createPointFeature('place-trail', 'place', 'trail', [23.26, 39.19]);
  const placeNonPoint = createLineFeature('place-line', 'heritage');

  const waypoint1 = createPointFeature('waypoint-1', 'waypoint', 'trail', [23.27, 39.2]);
  const waypoint2 = createPointFeature('waypoint-2', 'waypoint', 'trail', [23.28, 39.21]);

  const mockMapData: MapData = {
    schemaVersion: 1,
    generatedAt: '2026-08-29T10:00:00Z',
    places: [placeHeritage, placeNonPoint, placeNature, placeTrail],
    trails: [],
    waypoints: [waypoint1, waypoint2],
  };

  it('excludes non-Point geometries from places', () => {
    const result = buildVisiblePointFeatures(mockMapData, []);
    const keys = result.map((feature) => feature.properties.entityKey);

    expect(keys).not.toContain('place-line');
    expect(result.every((feature) => feature.geometry.type === 'Point')).toBe(true);
  });

  it('includes all eligible Point places and all waypoints when no categories are active', () => {
    const result = buildVisiblePointFeatures(mockMapData, []);
    const keys = result.map((feature) => feature.properties.entityKey);

    expect(keys).toEqual([
      'place-heritage',
      'place-nature',
      'place-trail',
      'waypoint-1',
      'waypoint-2',
    ]);
  });

  it('filters places by matching active categories', () => {
    const result = buildVisiblePointFeatures(mockMapData, ['heritage', 'nature']);
    const keys = result.map((feature) => feature.properties.entityKey);

    expect(keys).toEqual(['place-heritage', 'place-nature']);
  });

  it('excludes waypoints when active categories do not include trail', () => {
    const result = buildVisiblePointFeatures(mockMapData, ['heritage']);
    const keys = result.map((feature) => feature.properties.entityKey);

    expect(keys).toEqual(['place-heritage']);
  });

  it('includes waypoints when trail is among the active categories', () => {
    const result = buildVisiblePointFeatures(mockMapData, ['heritage', 'trail']);
    const keys = result.map((feature) => feature.properties.entityKey);

    expect(keys).toEqual(['place-heritage', 'place-trail', 'waypoint-1', 'waypoint-2']);
  });

  it('preserves input order: eligible places first, then waypoints', () => {
    const customMapData: MapData = {
      ...mockMapData,
      places: [placeTrail, placeHeritage, placeNature],
      waypoints: [waypoint2, waypoint1],
    };

    const result = buildVisiblePointFeatures(customMapData, []);
    const keys = result.map((feature) => feature.properties.entityKey);

    expect(keys).toEqual([
      'place-trail',
      'place-heritage',
      'place-nature',
      'waypoint-2',
      'waypoint-1',
    ]);
  });
});
