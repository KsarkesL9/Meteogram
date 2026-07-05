import type {
  PrecipitationUnit,
  TemperatureUnit,
  UnitPreferences,
  WindSpeedUnit,
} from '../lib/units';

const TEMPERATURE_OPTIONS: { unit: TemperatureUnit; label: string }[] = [
  { unit: 'celsius', label: '°C' },
  { unit: 'fahrenheit', label: '°F' },
];

const WIND_OPTIONS: { unit: WindSpeedUnit; label: string }[] = [
  { unit: 'ms', label: 'm/s' },
  { unit: 'kmh', label: 'km/h' },
  { unit: 'kn', label: 'kn' },
  { unit: 'mph', label: 'mph' },
];

const PRECIPITATION_OPTIONS: { unit: PrecipitationUnit; label: string }[] = [
  { unit: 'mm', label: 'mm' },
  { unit: 'inch', label: 'in' },
];

interface UnitsMenuProps {
  unitPreferences: UnitPreferences;
  onUpdate: (patch: Partial<UnitPreferences>) => void;
}

// FR-18: switchable units for temperature, wind and precipitation
export function UnitsMenu({ unitPreferences, onUpdate }: UnitsMenuProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="mb-1 font-bold">Temperatura</p>
        {TEMPERATURE_OPTIONS.map(({ unit, label }) => (
          <label key={unit} className="mr-3 inline-flex items-center gap-1">
            <input
              type="radio"
              name="unit-temperature"
              checked={unitPreferences.temperature === unit}
              onChange={() => {
                onUpdate({ temperature: unit });
              }}
            />
            {label}
          </label>
        ))}
      </div>
      <div>
        <p className="mb-1 font-bold">Wiatr</p>
        {WIND_OPTIONS.map(({ unit, label }) => (
          <label key={unit} className="mr-3 inline-flex items-center gap-1">
            <input
              type="radio"
              name="unit-wind"
              checked={unitPreferences.windSpeed === unit}
              onChange={() => {
                onUpdate({ windSpeed: unit });
              }}
            />
            {label}
          </label>
        ))}
      </div>
      <div>
        <p className="mb-1 font-bold">Opad</p>
        {PRECIPITATION_OPTIONS.map(({ unit, label }) => (
          <label key={unit} className="mr-3 inline-flex items-center gap-1">
            <input
              type="radio"
              name="unit-precipitation"
              checked={unitPreferences.precipitation === unit}
              onChange={() => {
                onUpdate({ precipitation: unit });
              }}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
