import { describe, expect, it } from 'vitest';
import { places, stories, trails } from '../src/data/content';
import { lineStringSchema } from '../src/lib/content';

describe('Lafkos seed content', () => {
  it('contains a bilingual slug for every place, trail, and story', () => {
    [...places, ...trails, ...stories].forEach((entry) => {
      expect(entry.slug.el).toBeTruthy();
      expect(entry.slug.en).toBeTruthy();
    });
  });

  it('validates reading-lafkos story properties and sources', () => {
    const readingStory = stories.find((s) => s.entityKey === 'reading-lafkos');
    expect(readingStory).toBeDefined();
    expect(readingStory?.slug.el).toBe('reading-lafkos');
    expect(readingStory?.slug.en).toBe('reading-lafkos');
    expect(readingStory?.body.el.length).toBeGreaterThanOrEqual(7);
    expect(readingStory?.body.en.length).toBeGreaterThanOrEqual(7);
    expect(readingStory?.body.el.length).toBe(readingStory?.body.en.length);
    expect(readingStory?.image.src).toBeTruthy();
    expect(readingStory?.sources.length).toBeGreaterThanOrEqual(5);
    expect(readingStory?.relatedKeys.length).toBeGreaterThanOrEqual(5);
  });

  it('keeps every trail geometry valid and at least two coordinates long', () => {
    trails.forEach((trail) => {
      expect(lineStringSchema.parse(trail.geometry).coordinates.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('requires seed content to identify itself before publication', () => {
    expect(places.every((place) => place.isSeed)).toBe(true);
    expect(trails.every((trail) => trail.isSeed)).toBe(true);
    expect(stories.every((story) => story.isSeed)).toBe(true);
  });
});
