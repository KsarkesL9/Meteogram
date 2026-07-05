import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_UNIT_PREFERENCES } from '../lib/units';
import type { UnitPreferences } from '../lib/units';

const STORAGE_KEY = 'meteogram.unitPreferences';

function readStoredPreferences(): UnitPreferences {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return DEFAULT_UNIT_PREFERENCES;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return DEFAULT_UNIT_PREFERENCES;
    }
    return {
      temperature:
        'temperature' in parsed &&
        (parsed.temperature === 'celsius' ||
          parsed.temperature === 'fahrenheit')
          ? parsed.temperature
          : DEFAULT_UNIT_PREFERENCES.temperature,
      windSpeed:
        'windSpeed' in parsed &&
        (parsed.windSpeed === 'ms' ||
          parsed.windSpeed === 'kmh' ||
          parsed.windSpeed === 'kn' ||
          parsed.windSpeed === 'mph')
          ? parsed.windSpeed
          : DEFAULT_UNIT_PREFERENCES.windSpeed,
      precipitation:
        'precipitation' in parsed &&
        (parsed.precipitation === 'mm' || parsed.precipitation === 'inch')
          ? parsed.precipitation
          : DEFAULT_UNIT_PREFERENCES.precipitation,
    };
  } catch {
    // A corrupt storage entry falls back to defaults instead of breaking startup
    return DEFAULT_UNIT_PREFERENCES;
  }
}

// FR-18/FR-19: user-switchable units, persisted and restored on the next visit
export function useUnitPreferences() {
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>(
    readStoredPreferences,
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unitPreferences));
  }, [unitPreferences]);

  const updateUnitPreferences = useCallback(
    (patch: Partial<UnitPreferences>) => {
      setUnitPreferences((previous) => ({ ...previous, ...patch }));
    },
    [],
  );

  return { unitPreferences, updateUnitPreferences };
}
