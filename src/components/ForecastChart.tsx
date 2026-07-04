import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { computeMultiModelAverage } from '../lib/average';
import { toLocationIso } from '../lib/localTime';
import { PARAMETER_LABELS } from '../lib/parameterGroups';
import type { ParameterGroup } from '../lib/parameterGroups';
import { convertForecastSeries, parameterUnitLabel } from '../lib/units';
import type { UnitPreferences } from '../lib/units';
import {
  MODEL_COLORS,
  MODEL_LABELS,
  MULTI_MODEL_AVERAGE_COLOR,
  MULTI_MODEL_AVERAGE_LABEL,
} from './modelDisplay';
import type { LocationForecast, ModelId } from '../types/forecast';

// Consecutive parameters of a combined tab (e.g. dew point) get distinct dashes
const PARAMETER_DASHES = ['solid', 'dot', 'dashdot'] as const;

interface ForecastChartProps {
  forecast: LocationForecast;
  group: ParameterGroup;
  excludedModels: ModelId[];
  unitPreferences: UnitPreferences;
}

export function ForecastChart({
  forecast,
  group,
  excludedModels,
  unitPreferences,
}: ForecastChartProps) {
  const localTimes = forecast.timestamps.map((timestamp) =>
    toLocationIso(timestamp, forecast.utcOffsetSeconds),
  );
  const presentModels = Object.keys(forecast.models) as ModelId[];
  const includedModels = presentModels.filter(
    (model) => !excludedModels.includes(model),
  );

  const traces: Data[] = [];
  group.parameters.forEach((parameter, parameterIndex) => {
    const dash = PARAMETER_DASHES[parameterIndex % PARAMETER_DASHES.length];
    const includedSeries = includedModels.map((model) =>
      convertForecastSeries(
        parameter,
        forecast.models[model]?.parameters[parameter] ?? [],
        unitPreferences,
      ),
    );
    includedModels.forEach((model, modelIndex) => {
      traces.push({
        x: localTimes,
        y: includedSeries[modelIndex],
        type: 'scatter',
        mode: 'lines',
        name: `${MODEL_LABELS[model]}: ${PARAMETER_LABELS[parameter]}`,
        line: { color: MODEL_COLORS[model], width: 1.5, dash },
      });
    });
    // FR-05/FR-06: the average follows the legend state and recomputes client-side
    traces.push({
      x: localTimes,
      y: computeMultiModelAverage(includedSeries),
      type: 'scatter',
      mode: 'lines',
      name: `${MULTI_MODEL_AVERAGE_LABEL}: ${PARAMETER_LABELS[parameter]}`,
      line: { color: MULTI_MODEL_AVERAGE_COLOR, width: 2.5, dash: 'dash' },
    });
  });

  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: 55, r: 15, t: 10, b: 40 },
    showlegend: false,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    font: {
      family: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      size: 12,
      color: '#333333',
    },
    xaxis: { type: 'date', gridcolor: '#dde2e7' },
    yaxis: {
      title: { text: parameterUnitLabel(group.parameters[0], unitPreferences) },
      gridcolor: '#dde2e7',
      zeroline: false,
    },
  };

  // FR-17: default Plotly toolbar (zoom, pan, PNG export) stays untouched
  return (
    <Plot
      data={traces}
      layout={layout}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
    />
  );
}
