import { useCallback, useEffect, useRef, useState } from 'react';
import { findClosestTimeIndex } from '../lib/localTime';
import { MAX_LOCATION_HISTORY } from '../lib/locationHistory';
import { listCoveredModels } from '../lib/modelCoverage';
import { buildForecastUrl, parseForecastResponse } from '../lib/openMeteo';
import type {
  GeoCoordinates,
  LocationForecast,
  ModelId,
} from '../types/forecast';
import type { OpenMeteoForecastResponse } from '../types/openMeteo';

// FR-22: offline = fetch failed outright, service = the API answered with an error
export type ForecastFetchError = 'offline' | 'service';

interface CachedForecast {
  forecast: LocationForecast;
  unavailableModels: ModelId[];
}

export interface ForecastQuery {
  forecast: LocationForecast | null;
  unavailableModels: ModelId[];
  // FR-14: the slider will own the time index; until then this is the nearest-to-now step
  currentTimeIndex: number;
  isLoading: boolean;
  error: ForecastFetchError | null;
  retry: () => void;
}

const INITIAL_QUERY = {
  forecast: null,
  unavailableModels: [] as ModelId[],
  currentTimeIndex: 0,
  isLoading: false,
  error: null,
};

function nearestToNowIndex(forecast: LocationForecast): number {
  return findClosestTimeIndex(
    forecast.timestamps,
    Math.floor(Date.now() / 1000),
  );
}

export function useForecast(location: GeoCoordinates | null): ForecastQuery {
  const [query, setQuery] =
    useState<Omit<ForecastQuery, 'retry'>>(INITIAL_QUERY);
  const cacheRef = useRef(new Map<string, CachedForecast>());
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((count) => count + 1);
  }, []);

  useEffect(() => {
    if (location === null) {
      return;
    }
    const cache = cacheRef.current;
    const cacheKey = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      cache.delete(cacheKey);
      cache.set(cacheKey, cached);
      setQuery({
        forecast: cached.forecast,
        unavailableModels: cached.unavailableModels,
        currentTimeIndex: nearestToNowIndex(cached.forecast),
        isLoading: false,
        error: null,
      });
      return;
    }

    const requestedModels = listCoveredModels(location);
    const controller = new AbortController();
    setQuery((previous) => ({ ...previous, isLoading: true, error: null }));

    void (async () => {
      try {
        const response = await fetch(
          buildForecastUrl(location, requestedModels),
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          setQuery((previous) => ({
            ...previous,
            isLoading: false,
            error: 'service',
          }));
          return;
        }
        const payload = (await response.json()) as OpenMeteoForecastResponse;
        const forecast = parseForecastResponse(payload, requestedModels);
        // FR-21: a requested model absent from the response is reported, not fatal
        const unavailableModels = requestedModels.filter(
          (model) => forecast.models[model] === undefined,
        );
        cache.set(cacheKey, { forecast, unavailableModels });
        // FR-10: the same LRU limit as the visible location history
        if (cache.size > MAX_LOCATION_HISTORY) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey !== undefined) {
            cache.delete(oldestKey);
          }
        }
        setQuery({
          forecast,
          unavailableModels,
          currentTimeIndex: nearestToNowIndex(forecast),
          isLoading: false,
          error: null,
        });
      } catch (fetchFailure) {
        // FR-23: an aborted request means a newer location superseded this one
        if (
          fetchFailure instanceof DOMException &&
          fetchFailure.name === 'AbortError'
        ) {
          return;
        }
        const error: ForecastFetchError =
          fetchFailure instanceof TypeError ? 'offline' : 'service';
        setQuery((previous) => ({ ...previous, isLoading: false, error }));
      }
    })();

    return () => {
      controller.abort();
    };
  }, [location, attempt]);

  return { ...query, retry };
}
