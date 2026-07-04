import { useState } from 'react';
import { LayerControl } from './components/LayerControl';
import { MapPanel } from './components/MapPanel';
import { useGeolocation } from './hooks/useGeolocation';
import { useLocationHistory } from './hooks/useLocationHistory';
import type { MapLayerKind } from './lib/mapLayers';
import type { GeoCoordinates, ModelId } from './types/forecast';

// FR-12: fallback view when geolocation is denied or unavailable
const WARSAW: GeoCoordinates = { latitude: 52.2297, longitude: 21.0122 };

export function App() {
  const geolocation = useGeolocation();
  const { addVisitedLocation } = useLocationHistory();
  const [selectedLocation, setSelectedLocation] =
    useState<GeoCoordinates | null>(null);
  const [layerModel, setLayerModel] = useState<ModelId>('gfs');
  const [layerKind, setLayerKind] = useState<MapLayerKind>('temperature');

  const selectLocation = (coordinates: GeoCoordinates) => {
    setSelectedLocation(coordinates);
    addVisitedLocation(coordinates);
  };

  return (
    <div className="flex h-screen flex-col bg-page font-sans text-ink">
      <header className="flex h-[50px] shrink-0 items-center bg-navbar px-4">
        <span className="text-lg font-bold text-white">Meteogram</span>
      </header>
      <main className="flex min-h-0 grow">
        <section className="relative w-3/5">
          <MapPanel
            center={geolocation ?? WARSAW}
            selectedLocation={selectedLocation}
            layerModel={layerModel}
            layerKind={layerKind}
            onLocationSelected={selectLocation}
          />
          <LayerControl
            activeModel={layerModel}
            activeKind={layerKind}
            onModelChange={setLayerModel}
            onKindChange={setLayerKind}
          />
          {selectedLocation === null && (
            <div className="pointer-events-none absolute inset-x-0 top-4 z-10 mx-auto w-fit rounded border border-line bg-panel px-4 py-2 text-sm shadow">
              Kliknij punkt na mapie...
            </div>
          )}
        </section>
        <aside className="flex w-2/5 items-center justify-center border-l border-line bg-panel text-ink-muted">
          Panel wykresów (w przygotowaniu)
        </aside>
      </main>
    </div>
  );
}
