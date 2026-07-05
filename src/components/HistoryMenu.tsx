import type { GeoCoordinates } from '../types/forecast';

interface HistoryMenuProps {
  locationHistory: GeoCoordinates[];
  onSelect: (coordinates: GeoCoordinates) => void;
}

// FR-11: raw coordinates only — no place names, no reverse geocoding
export function HistoryMenu({ locationHistory, onSelect }: HistoryMenuProps) {
  if (locationHistory.length === 0) {
    return <p className="text-ink-muted">Brak odwiedzonych lokalizacji</p>;
  }
  return (
    <ul>
      {locationHistory.map((entry) => (
        <li key={`${String(entry.latitude)},${String(entry.longitude)}`}>
          <button
            type="button"
            className="w-full rounded px-2 py-1 text-left tabular-nums hover:bg-header-light"
            onClick={() => {
              onSelect(entry);
            }}
          >
            {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
          </button>
        </li>
      ))}
    </ul>
  );
}
