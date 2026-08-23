import { describe, expect, it } from 'vitest';
import {
  calculateBounds,
  formatDistance,
  getGeometryBounds,
  haversineDistanceMeters,
  lineDistanceMeters,
} from '../src/lib/geometry';

describe('geometry utilities', () => {
  it('returns zero for identical coordinates', () => {
    expect(haversineDistanceMeters([23, 39], [23, 39])).toBe(0);
  });

  it('calculates a useful line distance', () => {
    const distance = lineDistanceMeters([
      [23.24665, 39.17795],
      [23.24792, 39.18038],
    ]);
    expect(distance).toBeGreaterThan(250);
    expect(distance).toBeLessThan(350);
  });

  it('formats distances for the visitor locale', () => {
    expect(formatDistance(1450, 'en')).toContain('1.5');
    expect(formatDistance(1450, 'el')).toContain('1,5');
  });

  it('calculates bounding box for coordinate lists and geometries', () => {
    const coordinates: Array<[number, number]> = [
      [23.24, 39.17],
      [23.35, 39.25],
      [23.21, 39.12],
    ];
    const bounds = calculateBounds(coordinates);
    expect(bounds).toEqual([
      [23.21, 39.12],
      [23.35, 39.25],
    ]);

    expect(calculateBounds([])).toBeUndefined();

    const lineBounds = getGeometryBounds({
      type: 'LineString',
      coordinates: [
        [23.1, 39.1],
        [23.2, 39.3],
      ],
    });
    expect(lineBounds).toEqual([
      [23.1, 39.1],
      [23.2, 39.3],
    ]);

    const pointBounds = getGeometryBounds({
      type: 'Point',
      coordinates: [23.24, 39.17],
    });
    expect(pointBounds).toEqual([
      [23.24, 39.17],
      [23.24, 39.17],
    ]);
  });
});
