import { useEffect, useState } from 'react';
import type { GeoCoordinates } from '../types/forecast';

// FR-12: browser geolocation with user consent; the caller supplies the fallback view
export function useGeolocation(): GeoCoordinates | null {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => undefined,
    );
  }, []);

  return coordinates;
}
