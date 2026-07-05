import { useEffect, useRef, useState } from 'react';
import { MAP_TILES_URL } from '../lib/mapLayers';
import type { OpenMeteoTileSchedule } from '../types/openMeteo';

export interface WeatherLayerSchedule {
  referenceTime: string;
  validTimes: string[];
}

// FR-14: the run metadata of the active tile source lets the map layer follow
// the time slider; a failed fetch falls back to the latest.json current-time layer
export function useWeatherLayerSchedule(
  tilePath: string,
): WeatherLayerSchedule | null {
  const [schedule, setSchedule] = useState<WeatherLayerSchedule | null>(null);
  const cacheRef = useRef(new Map<string, WeatherLayerSchedule>());

  useEffect(() => {
    const cached = cacheRef.current.get(tilePath);
    if (cached !== undefined) {
      setSchedule(cached);
      return;
    }
    setSchedule(null);
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(
          `${MAP_TILES_URL}/${tilePath}/latest.json`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as OpenMeteoTileSchedule;
        const fetched: WeatherLayerSchedule = {
          referenceTime: payload.reference_time,
          validTimes: payload.valid_times,
        };
        cacheRef.current.set(tilePath, fetched);
        setSchedule(fetched);
      } catch {
        // Silent by design: the map keeps the untimed layer, charts are unaffected
      }
    })();
    return () => {
      controller.abort();
    };
  }, [tilePath]);

  return schedule;
}
