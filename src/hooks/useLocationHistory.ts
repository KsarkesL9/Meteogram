import { useCallback, useEffect, useState } from 'react';
import { pruneLocationHistory } from '../lib/locationHistory';
import type { GeoCoordinates } from '../types/forecast';

const STORAGE_KEY = 'meteogram.locationHistory';

function readStoredHistory(): GeoCoordinates[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry: unknown): entry is GeoCoordinates =>
        typeof entry === 'object' &&
        entry !== null &&
        'latitude' in entry &&
        'longitude' in entry &&
        typeof entry.latitude === 'number' &&
        typeof entry.longitude === 'number',
    );
  } catch {
    // A corrupt storage entry resets the history instead of breaking startup
    return [];
  }
}

export function useLocationHistory() {
  const [locationHistory, setLocationHistory] =
    useState<GeoCoordinates[]>(readStoredHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locationHistory));
  }, [locationHistory]);

  const addVisitedLocation = useCallback((visited: GeoCoordinates) => {
    setLocationHistory((history) => pruneLocationHistory(history, visited));
  }, []);

  return { locationHistory, addVisitedLocation };
}
