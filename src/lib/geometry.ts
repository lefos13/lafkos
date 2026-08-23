/*
 * Geometry helpers keep map calculations deterministic and local. They avoid
 * sending visitor coordinates anywhere and can be reused by trail cards,
 * accessibility summaries, and the eventual CMS validation pipeline.
 */

import type { Coordinate } from './content';

const EARTH_RADIUS_METERS = 6_371_000;

export function haversineDistanceMeters(first: Coordinate, second: Coordinate): number {
  const [firstLng, firstLat] = first.map((value) => (value * Math.PI) / 180);
  const [secondLng, secondLat] = second.map((value) => (value * Math.PI) / 180);
  const latitudeDelta = secondLat - firstLat;
  const longitudeDelta = secondLng - firstLng;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

export function lineDistanceMeters(coordinates: Coordinate[]): number {
  return coordinates.slice(1).reduce((total, coordinate, index) => {
    return total + haversineDistanceMeters(coordinates[index], coordinate);
  }, 0);
}

export function formatDistance(meters: number, locale: 'el' | 'en'): string {
  const kilometers = meters / 1000;
  return (
    new Intl.NumberFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
      maximumFractionDigits: kilometers < 10 ? 1 : 0,
    }).format(kilometers) + ' km'
  );
}

export type BoundingBox = [[number, number], [number, number]];

export function calculateBounds(coordinates: Coordinate[]): BoundingBox | undefined {
  if (!coordinates || coordinates.length === 0) return undefined;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      !Number.isNaN(lng) &&
      !Number.isNaN(lat)
    ) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
  }

  if (minLng === Infinity || minLat === Infinity) return undefined;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function getGeometryBounds(
  geometry?:
    | { type: 'Point'; coordinates: Coordinate }
    | { type: 'LineString'; coordinates: Coordinate[] }
    | { type: 'Polygon'; coordinates: Coordinate[][] }
    | { type: string; coordinates: unknown }
    | null,
): BoundingBox | undefined {
  if (!geometry || !geometry.coordinates) return undefined;
  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates as Coordinate;
    return [
      [lng, lat],
      [lng, lat],
    ];
  }
  if (geometry.type === 'LineString') {
    return calculateBounds(geometry.coordinates as Coordinate[]);
  }
  if (geometry.type === 'Polygon') {
    const coords = (geometry.coordinates as Coordinate[][]).flat();
    return calculateBounds(coords);
  }
  return undefined;
}
