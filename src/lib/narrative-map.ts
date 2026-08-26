/*
 * Narrative lenses are deliberately a small, local editorial layer over the
 * existing map entities. They make related places and walks discoverable
 * without introducing a second CMS taxonomy or any new coordinates.
 */

import type { MapFeature } from './content';
import { haversineDistanceMeters } from './geometry';
import type { MapScope, MapTheme } from './map-state';

export const narrativeThemeKeys: Record<MapTheme, string[]> = {
  'origins-water': [
    'lafkos-square',
    'square-fountain',
    'chatzi-spring',
    'palaiovrysi',
    'touloumba-spring',
    'springs-heritage-loop',
  ],
  'square-1887': [
    'lafkos-square',
    'theotokos-church',
    'forlidas-cafe',
    'oldest-cafe-forlidas',
    'old-school',
  ],
  'stone-craft': [
    'old-lanes',
    'drositis-bakery',
    'fampas-museum',
    'folklore-museum',
    'lafkos-milina-trail',
    'springs-heritage-loop',
  ],
  'sacred-ridge': [
    'theotokos-church',
    'monastery-athanasios',
    'monastery-athanasios-trail',
    'profitis-ilias-view',
    'profitis-ilias-trail',
    'agia-paraskevi-view',
  ],
};

const villageCenter: [number, number] = [23.24665, 39.17795];
const villageTrailKeys = new Set(['springs-heritage-loop']);

function coordinatesFor(feature: MapFeature): [number, number][] {
  if (feature.geometry.type === 'Point') return [feature.geometry.coordinates];
  if (feature.geometry.type === 'LineString') return feature.geometry.coordinates;
  return feature.geometry.coordinates.flat();
}

function isNearVillage(feature: MapFeature, radiusMeters: number): boolean {
  return coordinatesFor(feature).some(
    (coordinate) => haversineDistanceMeters(coordinate, villageCenter) <= radiusMeters,
  );
}

export function featureMatchesScope(feature: MapFeature, scope: MapScope): boolean {
  if (scope === 'south-pelion') return true;
  if (feature.properties.kind === 'trail') {
    /* The Village scope is intentionally point-led. Village walks adds only
     * nearby hiking routes; drive routes remain a deliberate regional choice. */
    if (scope === 'village') return villageTrailKeys.has(feature.properties.entityKey);
    return feature.properties.routeType === 'hiking' && isNearVillage(feature, 3_500);
  }
  return isNearVillage(feature, scope === 'village' ? 1_300 : 3_500);
}

export function featureMatchesTheme(feature: MapFeature, theme?: MapTheme): boolean {
  return !theme || narrativeThemeKeys[theme].includes(feature.properties.entityKey);
}
