import { describe, expect, it } from 'vitest';
import type { MapFeature } from '../src/lib/content';
import { featureMatchesScope, featureMatchesTheme } from '../src/lib/narrative-map';

/* These fixtures pin the editorial map contract without relying on the full
 * seed dataset or on MapLibre runtime state. */
const place = (entityKey: string): MapFeature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [23.24665, 39.17795] },
  properties: {
    entityKey,
    kind: 'place',
    category: 'heritage',
    slug: entityKey,
    title: entityKey,
    summary: entityKey,
  },
});

const trail = (routeType: 'hiking' | 'drive'): MapFeature => ({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [23.24665, 39.17795],
      [23.25, 39.18],
    ],
  },
  properties: {
    entityKey: `near-${routeType}`,
    kind: 'trail',
    category: 'trail',
    routeType,
    slug: `near-${routeType}`,
    title: routeType,
    summary: routeType,
  },
});

describe('narrative map scopes', () => {
  it('keeps Village point-led and reserves nearby routes for Village walks', () => {
    expect(featureMatchesScope(trail('drive'), 'village')).toBe(false);
    expect(featureMatchesScope(trail('drive'), 'walks')).toBe(false);
    expect(featureMatchesScope(trail('hiking'), 'village')).toBe(false);
    expect(featureMatchesScope(trail('hiking'), 'walks')).toBe(true);
    expect(featureMatchesScope(trail('drive'), 'south-pelion')).toBe(true);
  });

  it('keeps the curated village heritage loop in the default scope', () => {
    const base = trail('hiking');
    const loop = {
      ...base,
      properties: { ...base.properties, entityKey: 'springs-heritage-loop' },
    };
    expect(featureMatchesScope(loop, 'village')).toBe(true);
  });

  it('keeps Theotokos church in the 1887 Square lens', () => {
    expect(featureMatchesTheme(place('theotokos-church'), 'square-1887')).toBe(true);
  });
});
