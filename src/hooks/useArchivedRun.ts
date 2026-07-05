import { useEffect, useState } from 'react';
import { buildSingleRunUrl, parseForecastResponse } from '../lib/openMeteo';
import type {
  GeoCoordinates,
  LocationForecast,
  ModelId,
  UnixSeconds,
} from '../types/forecast';
import type { OpenMeteoForecastResponse } from '../types/openMeteo';

export interface ArchivedRunSelection {
  model: ModelId;
  runTimestamp: UnixSeconds;
}

interface ArchivedRunQuery {
  archivedRun: {
    selection: ArchivedRunSelection;
    forecast: LocationForecast;
  } | null;
  isLoading: boolean;
  hasFailed: boolean;
}

// FR-07: one archived run at a time, laid over the charts as a faded line.
// The result stays keyed by its selection, so clearing and loading states are
// derived by comparison instead of being reset synchronously in the effect.
export function useArchivedRun(
  location: GeoCoordinates | null,
  selection: ArchivedRunSelection | null,
): ArchivedRunQuery {
  const [result, setResult] = useState<{
    selection: ArchivedRunSelection;
    outcome: LocationForecast | 'failed';
  } | null>(null);

  useEffect(() => {
    if (location === null || selection === null) {
      return;
    }
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(
          buildSingleRunUrl(location, selection.model, selection.runTimestamp),
          { signal: controller.signal },
        );
        if (!response.ok) {
          setResult({ selection, outcome: 'failed' });
          return;
        }
        const payload = (await response.json()) as OpenMeteoForecastResponse;
        const forecast = parseForecastResponse(payload, [selection.model]);
        setResult({
          selection,
          outcome:
            forecast.models[selection.model] === undefined
              ? 'failed'
              : forecast,
        });
      } catch (fetchFailure) {
        // FR-23: an aborted request means a newer selection superseded this one
        if (
          fetchFailure instanceof DOMException &&
          fetchFailure.name === 'AbortError'
        ) {
          return;
        }
        setResult({ selection, outcome: 'failed' });
      }
    })();
    return () => {
      controller.abort();
    };
  }, [location, selection]);

  if (selection === null) {
    return { archivedRun: null, isLoading: false, hasFailed: false };
  }
  const isCurrent = result !== null && result.selection === selection;
  return {
    archivedRun:
      isCurrent && result.outcome !== 'failed'
        ? { selection, forecast: result.outcome }
        : null,
    isLoading: !isCurrent,
    hasFailed: isCurrent && result.outcome === 'failed',
  };
}
