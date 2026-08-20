import { describe, expect, it } from 'vitest';
import { places, trails } from '../src/data/content';
import { lineStringSchema } from '../src/lib/content';

describe('Lafkos seed content', () => {
  it('contains a bilingual slug for every place and trail', () => {
    [...places, ...trails].forEach((entry) => {
      expect(entry.slug.el).toBeTruthy();
      expect(entry.slug.en).toBeTruthy();
    });
  });

  it('keeps every trail geometry valid and at least two coordinates long', () => {
    trails.forEach((trail) => {
      expect(lineStringSchema.parse(trail.geometry).coordinates.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('requires seed content to identify itself before publication', () => {
    expect(places.every((place) => place.isSeed)).toBe(true);
    expect(trails.every((trail) => trail.isSeed)).toBe(true);
  });
});
