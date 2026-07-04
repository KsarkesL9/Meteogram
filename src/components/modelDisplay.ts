import type { ModelId } from '../types/forecast';

// FR-16: fixed per-model colors from the Flat UI palette of the UI spec
export const MODEL_COLORS: Record<ModelId, string> = {
  gfs: '#2980b9',
  ecmwf: '#c0392b',
  icon: '#e67e22',
  hrrr: '#27ae60',
};

export const MODEL_LABELS: Record<ModelId, string> = {
  gfs: 'GFS',
  ecmwf: 'ECMWF',
  icon: 'ICON',
  hrrr: 'HRRR',
};

export const MULTI_MODEL_AVERAGE_COLOR = '#2c3e50';
export const MULTI_MODEL_AVERAGE_LABEL = 'Średnia';
