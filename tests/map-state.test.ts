import { describe, expect, it } from 'vitest';
import { parseMapState, serializeMapState } from '../src/lib/map-state';

describe('map URL state', () => {
  it('parses valid filters and ignores invalid values', () => {
    const state = parseMapState('?categories=heritage,not-real,nature&place=lafkos-square&view=23.24,39.17,14');
    expect(state.categories).toEqual(['heritage', 'nature']);
    expect(state.place).toBe('lafkos-square');
    expect(state.view?.zoom).toBe(14);
  });

  it('rejects malformed views', () => {
    expect(parseMapState('?view=bad,39,14').view).toBeUndefined();
    expect(parseMapState('?view=23,39,99').view).toBeUndefined();
  });

  it('serializes a shareable state', () => {
    expect(serializeMapState({ categories: ['heritage'], place: 'lafkos-square' })).toBe(
      '?categories=heritage&place=lafkos-square',
    );
  });
});
