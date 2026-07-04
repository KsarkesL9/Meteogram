import type { ForecastParameter } from '../types/forecast';

export type ParameterGroupId =
  | 'temperature'
  | 'precipitation'
  | 'wind'
  | 'mslp'
  | 'cloudCover'
  | 'humidity'
  | 'convection'
  | 'freezingLevel';

export interface ParameterGroup {
  id: ParameterGroupId;
  label: string;
  parameters: ForecastParameter[];
}

// FR-15: one dashboard tab per thematic group; wind direction renders as an arrow
// row above the time axis, not as a chart line, so it belongs to no group here
export const PARAMETER_GROUPS: ParameterGroup[] = [
  {
    id: 'temperature',
    label: 'Temperatura',
    parameters: ['temperature', 'dewPoint'],
  },
  {
    id: 'precipitation',
    label: 'Opad',
    parameters: ['rain', 'showers', 'snowfall'],
  },
  { id: 'wind', label: 'Wiatr', parameters: ['windSpeed', 'windGusts'] },
  { id: 'mslp', label: 'MSLP', parameters: ['mslp'] },
  {
    id: 'cloudCover',
    label: 'Zachmurzenie',
    parameters: ['cloudCoverLow', 'cloudCoverMid', 'cloudCoverHigh'],
  },
  { id: 'humidity', label: 'Wilgotność', parameters: ['relativeHumidity'] },
  { id: 'convection', label: 'CAPE/CIN', parameters: ['cape', 'cin'] },
  {
    id: 'freezingLevel',
    label: 'Poziom zamarzania',
    parameters: ['freezingLevel'],
  },
];

export const PARAMETER_LABELS: Record<ForecastParameter, string> = {
  temperature: 'Temperatura',
  dewPoint: 'Punkt rosy',
  rain: 'Deszcz',
  showers: 'Deszcz konwekcyjny',
  snowfall: 'Śnieg',
  mslp: 'MSLP',
  windSpeed: 'Prędkość wiatru',
  windGusts: 'Porywy',
  windDirection: 'Kierunek wiatru',
  cloudCoverLow: 'Niskie',
  cloudCoverMid: 'Średnie',
  cloudCoverHigh: 'Wysokie',
  relativeHumidity: 'Wilgotność względna',
  cape: 'CAPE',
  cin: 'CIN',
  freezingLevel: 'Poziom zamarzania',
};
