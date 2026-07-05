import Plot from 'react-plotly.js';
import type { Annotations, Data, Layout } from 'plotly.js';
import { computeMultiModelAverage } from '../lib/average';
import { toLocationIso } from '../lib/localTime';
import { computeMeanWindDirection } from '../lib/windDirection';
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

// One arrow per six hourly steps keeps the row legible over the 16-day horizon
const WIND_ARROW_STEP = 6;

function windArrowAnnotations(
  forecast: LocationForecast,
  includedModels: ModelId[],
  localTimes: string[],
): Partial<Annotations>[] {
  const annotations: Partial<Annotations>[] = [];
  for (let index = 0; index < localTimes.length; index += WIND_ARROW_STEP) {
    const direction = computeMeanWindDirection(
      includedModels.map(
        (model) =>
          forecast.models[model]?.parameters.windDirection[index] ?? null,
      ),
    );
    if (direction === null) {
      continue;
    }
    annotations.push({
      x: localTimes[index],
      y: 1.02,
      yref: 'paper',
      yanchor: 'bottom',
      text: '↑',
      // Meteorological direction points where wind comes from; the arrow shows where it blows
      textangle: String((direction + 180) % 360),
      showarrow: false,
      font: { size: 13, color: '#666f7a' },
    });
  }
  return annotations;
}

interface ForecastChartProps {
  forecast: LocationForecast;
  group: ParameterGroup;
  excludedModels: ModelId[];
  unitPreferences: UnitPreferences;
  activeTimeIndex: number;
}

export function ForecastChart({
  forecast,
  group,
  excludedModels,
  unitPreferences,
  activeTimeIndex,
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

  // FR-15: the wind tab carries a direction-arrow row above the time axis
  const isWindGroup = group.id === 'wind';
  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: 55, r: 15, t: isWindGroup ? 30 : 10, b: 40 },
    annotations: isWindGroup
      ? windArrowAnnotations(forecast, includedModels, localTimes)
      : [],
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
    // FR-14: the cursor tracker follows the shared time slider
    shapes: [
      {
        type: 'line',
        x0: localTimes[activeTimeIndex],
        x1: localTimes[activeTimeIndex],
        yref: 'paper',
        y0: 0,
        y1: 1,
        line: { color: '#2c3e50', width: 1 },
      },
    ],
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
