// Tile-server run metadata (latest.json) — consumed by useWeatherLayerSchedule
export interface OpenMeteoTileSchedule {
  reference_time: string;
  valid_times: string[];
}

// Raw Open-Meteo Forecast API response shape — parsed exclusively in src/lib/openMeteo.ts
export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  utc_offset_seconds: number;
  hourly: Record<string, (number | null)[] | undefined>;
}
