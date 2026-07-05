import { useEffect, useRef, useState } from 'react';
import type { GeoCoordinates } from '../types/forecast';

// FR-12: browser geolocation with user consent; the caller supplies the fallback
// view and may react once to the detected position (e.g. auto-select the point)
export function useGeolocation(
  onLocated?: (coordinates: GeoCoordinates) => void,
): GeoCoordinates | null {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const onLocatedRef = useRef(onLocated);

  useEffect(() => {
    onLocatedRef.current = onLocated;
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const located = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(located);
        onLocatedRef.current?.(located);
      },
      () => undefined,
    );
  }, []);

  return coordinates;
}
