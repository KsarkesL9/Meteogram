import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { HelpModal } from './components/HelpModal';
import { HistoryMenu } from './components/HistoryMenu';
import { LayerControl } from './components/LayerControl';
import { MapPanel } from './components/MapPanel';
import { NavDropdown } from './components/NavDropdown';
import { TimeBar } from './components/TimeBar';
import { UnitsMenu } from './components/UnitsMenu';
import { useForecast } from './hooks/useForecast';
import { useGeolocation } from './hooks/useGeolocation';
import { useLocationHistory } from './hooks/useLocationHistory';
import { useUnitPreferences } from './hooks/useUnitPreferences';
import { displayOffsetSeconds, toLocationIso } from './lib/localTime';
import type { TimeDisplay } from './lib/localTime';
import type { MapLayerKind } from './lib/mapLayers';
import type {
  GeoCoordinates,
  LocationForecast,
  ModelId,
} from './types/forecast';

// FR-12: fallback view when geolocation is denied or unavailable
const WARSAW: GeoCoordinates = { latitude: 52.2297, longitude: 21.0122 };

// FR-26: loop interval inside the 500-1000 ms window required by the FSD
const PLAYBACK_INTERVAL_MS = 750;

export function App() {
  const geolocation = useGeolocation();
  const { locationHistory, addVisitedLocation } = useLocationHistory();
  // Selecting a history entry recenters the map, unlike a plain map click
  const [mapFocus, setMapFocus] = useState<GeoCoordinates | null>(null);
  const { unitPreferences, updateUnitPreferences } = useUnitPreferences();
  const [timeDisplay, setTimeDisplay] = useState<TimeDisplay>('local');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<GeoCoordinates | null>(null);
  const [layerModel, setLayerModel] = useState<ModelId>('gfs');
  const [layerKind, setLayerKind] = useState<MapLayerKind>('temperature');
  const forecastQuery = useForecast(selectedLocation);
  const { forecast, currentTimeIndex } = forecastQuery;

  // FR-14: one time index shared by the map layer, the chart cursor and the readout;
  // an override bound to a stale forecast falls back to the nearest-to-now step
  const [timeOverride, setTimeOverride] = useState<{
    forecast: LocationForecast;
    index: number;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeTimeIndex =
    timeOverride !== null && timeOverride.forecast === forecast
      ? timeOverride.index
      : currentTimeIndex;

  useEffect(() => {
    if (!isPlaying || forecast === null) {
      return;
    }
    // FR-26: playback reuses in-memory data and browser-cached tiles, no API traffic
    const intervalId = setInterval(() => {
      setTimeOverride((previous) => {
        const baseIndex =
          previous !== null && previous.forecast === forecast
            ? previous.index
            : currentTimeIndex;
        return {
          forecast,
          index: (baseIndex + 1) % forecast.timestamps.length,
        };
      });
    }, PLAYBACK_INTERVAL_MS);
    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying, forecast, currentTimeIndex]);

  const selectLocation = (coordinates: GeoCoordinates) => {
    setSelectedLocation(coordinates);
    addVisitedLocation(coordinates);
  };

  const activeTime =
    forecast === null ? null : forecast.timestamps[activeTimeIndex];
  const timeLabel =
    forecast === null || activeTime === null
      ? '—'
      : toLocationIso(
          activeTime,
          displayOffsetSeconds(forecast.utcOffsetSeconds, timeDisplay),
        )
          .slice(0, 16)
          .replace('T', ' ') + (timeDisplay === 'utc' ? ' UTC' : '');

  return (
    <div className="flex h-screen flex-col bg-page font-sans text-ink">
      <header className="flex h-[50px] shrink-0 items-center bg-navbar px-4">
        <span className="text-lg font-bold text-white">Meteogram</span>
        <nav className="ml-auto flex items-center gap-1">
          <NavDropdown label="Historia">
            {(close) => (
              <HistoryMenu
                locationHistory={locationHistory}
                onSelect={(coordinates) => {
                  selectLocation(coordinates);
                  setMapFocus(coordinates);
                  close();
                }}
              />
            )}
          </NavDropdown>
          <NavDropdown label="Jednostki">
            {() => (
              <UnitsMenu
                unitPreferences={unitPreferences}
                onUpdate={updateUnitPreferences}
              />
            )}
          </NavDropdown>
          <button
            type="button"
            className="rounded px-3 py-1.5 text-sm text-white hover:bg-white/10"
            onClick={() => {
              // FR-20: toggle between the location's local clock and UTC
              setTimeDisplay((display) =>
                display === 'local' ? 'utc' : 'local',
              );
            }}
          >
            Czas: {timeDisplay === 'local' ? 'lokalny' : 'UTC'}
          </button>
          <button
            type="button"
            className="rounded px-3 py-1.5 text-sm text-white hover:bg-white/10"
            onClick={() => {
              setIsHelpOpen(true);
            }}
          >
            Pomoc
          </button>
        </nav>
      </header>
      {isHelpOpen && (
        <HelpModal
          onClose={() => {
            setIsHelpOpen(false);
          }}
        />
      )}
      <main className="flex min-h-0 grow">
        <section className="flex w-3/5 flex-col">
          <div className="relative min-h-0 grow">
            <MapPanel
              center={mapFocus ?? geolocation ?? WARSAW}
              selectedLocation={selectedLocation}
              layerModel={layerModel}
              layerKind={layerKind}
              activeTime={activeTime}
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
          </div>
          <TimeBar
            stepCount={forecast?.timestamps.length ?? 0}
            activeIndex={forecast === null ? 0 : activeTimeIndex}
            onIndexChange={(index) => {
              if (forecast !== null) {
                setTimeOverride({ forecast, index });
              }
            }}
            isPlaying={isPlaying}
            onTogglePlay={() => {
              setIsPlaying((playing) => !playing);
            }}
            timeLabel={timeLabel}
          />
        </section>
        <aside className="w-2/5 border-l border-line bg-panel">
          <Dashboard
            location={selectedLocation}
            query={forecastQuery}
            activeTimeIndex={activeTimeIndex}
            unitPreferences={unitPreferences}
            timeDisplay={timeDisplay}
          />
        </aside>
      </main>
      {/* FR-24 */}
      <footer className="flex h-6 shrink-0 items-center justify-center gap-1 border-t border-line bg-header-light text-xs text-ink-muted">
        <span>Dane pogodowe:</span>
        <a
          className="text-link hover:underline"
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo
        </a>
        <span>(CC BY 4.0) · Mapa:</span>
        <a
          className="text-link hover:underline"
          href="https://openfreemap.org/"
          target="_blank"
          rel="noreferrer"
        >
          OpenFreeMap
        </a>
        <span>©</span>
        <a
          className="text-link hover:underline"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>
        <span>contributors</span>
      </footer>
    </div>
  );
}
