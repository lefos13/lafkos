/*
 * Map state is encoded in the URL so filters and selected features are
 * bookmarkable, shareable, and restorable without a global client store.
 * Invalid query values are ignored rather than allowed to corrupt the view.
 */

import type { CategoryId, Coordinate } from './content';
import { categoryIds } from './content';

export interface MapState {
  categories: CategoryId[];
  place?: string;
  trail?: string;
  view?: { center: Coordinate; zoom: number };
}

export function parseMapState(search: string): MapState {
  const params = new URLSearchParams(search);
  const categories = (params.get('categories') ?? '')
    .split(',')
    .filter((category): category is CategoryId => categoryIds.includes(category as CategoryId));
  const viewParts = params.get('view')?.split(',').map(Number);
  const view =
    viewParts?.length === 3 &&
    viewParts.every(Number.isFinite) &&
    viewParts[0] >= -180 &&
    viewParts[0] <= 180 &&
    viewParts[1] >= -90 &&
    viewParts[1] <= 90 &&
    viewParts[2] >= 0 &&
    viewParts[2] <= 22
      ? { center: [viewParts[0], viewParts[1]] as Coordinate, zoom: viewParts[2] }
      : undefined;

  return {
    categories,
    place: params.get('place') || undefined,
    trail: params.get('trail') || undefined,
    view,
  };
}

export function serializeMapState(state: MapState): string {
  const params = new URLSearchParams();
  if (state.categories.length > 0) params.set('categories', state.categories.join(','));
  if (state.place) params.set('place', state.place);
  if (state.trail) params.set('trail', state.trail);
  if (state.view) {
    const [longitude, latitude] = state.view.center;
    params.set('view', `${longitude.toFixed(5)},${latitude.toFixed(5)},${state.view.zoom.toFixed(2)}`);
  }
  const result = params.toString();
  return result ? `?${result}` : '';
}
