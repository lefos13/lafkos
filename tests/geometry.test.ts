import { describe, expect, it } from 'vitest';
import { formatDistance, haversineDistanceMeters, lineDistanceMeters } from '../src/lib/geometry';

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
});
