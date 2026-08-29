/*
 * MapLibre owns the spatial clustering, while this boundary keeps the source
 * payload deterministic: only point places matching the active categories and
 * eligible trail waypoints are sent to the clustered source.
 */

import type { CategoryId, MapData, MapFeature } from './content';

export const CLUSTER_RADIUS = 44;
export const CLUSTER_MAX_ZOOM = 14;
export const POINT_FOCUS_ZOOM = 16;

export function buildVisiblePointFeatures(
  mapData: MapData,
  activeCategoryIds: readonly CategoryId[],
): MapFeature[] {
  const activeCategories = new Set(activeCategoryIds);
  const hasCategoryFilter = activeCategoryIds.length > 0;
  const includeWaypoints = !hasCategoryFilter || activeCategories.has('trail');

  const places = mapData.places.filter(
    (feature) =>
      feature.geometry.type === 'Point' &&
      (!hasCategoryFilter || activeCategories.has(feature.properties.category)),
  );

  if (!includeWaypoints) return places;

  return [...places, ...mapData.waypoints.filter((feature) => feature.geometry.type === 'Point')];
}
