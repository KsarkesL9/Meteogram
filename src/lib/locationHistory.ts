import type { GeoCoordinates } from '../types/forecast';

export const MAX_LOCATION_HISTORY = 10;

// FR-11: newest first; revisiting coordinates moves them to the front (LRU)
export function pruneLocationHistory(
  history: readonly GeoCoordinates[],
  visited: GeoCoordinates,
): GeoCoordinates[] {
  const withoutVisited = history.filter(
    (entry) =>
      entry.latitude !== visited.latitude ||
      entry.longitude !== visited.longitude,
  );
  return [visited, ...withoutVisited].slice(0, MAX_LOCATION_HISTORY);
}
