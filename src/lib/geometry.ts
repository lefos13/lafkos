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
  return new Intl.NumberFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    maximumFractionDigits: kilometers < 10 ? 1 : 0,
  }).format(kilometers) + ' km';
}
