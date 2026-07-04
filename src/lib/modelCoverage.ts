import { MODEL_IDS } from '../types/forecast';
import type { GeoCoordinates, ModelId } from '../types/forecast';

// FR-08: corners of the HRRR Lambert grid. The real domain edges are curved in lat/lon,
// so this rectangle is an approximation: points inside it but outside the domain degrade
// to the FR-21 partial-failure path, points in the northern bulge lose HRRR entirely.
export const HRRR_COVERAGE_BOUNDS = {
  latitudeMin: 21.1,
  latitudeMax: 52.6,
  longitudeMin: -134.1,
  longitudeMax: -60.9,
};

export function isLocationCovered(
  model: ModelId,
  coordinates: GeoCoordinates,
): boolean {
  if (model !== 'hrrr') {
    return true;
  }
  const { latitude, longitude } = coordinates;
  return (
    latitude >= HRRR_COVERAGE_BOUNDS.latitudeMin &&
    latitude <= HRRR_COVERAGE_BOUNDS.latitudeMax &&
    longitude >= HRRR_COVERAGE_BOUNDS.longitudeMin &&
    longitude <= HRRR_COVERAGE_BOUNDS.longitudeMax
  );
}

export function listCoveredModels(coordinates: GeoCoordinates): ModelId[] {
  return MODEL_IDS.filter((model) => isLocationCovered(model, coordinates));
}
