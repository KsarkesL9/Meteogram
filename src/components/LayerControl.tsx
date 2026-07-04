import { MODEL_IDS } from '../types/forecast';
import type { ModelId } from '../types/forecast';
import type { MapLayerKind } from '../lib/mapLayers';

const MODEL_LABELS: Record<ModelId, string> = {
  gfs: 'GFS',
  ecmwf: 'ECMWF',
  icon: 'ICON',
  hrrr: 'HRRR',
};

const LAYER_KINDS: MapLayerKind[] = ['temperature', 'pressure', 'wind'];

const LAYER_KIND_LABELS: Record<MapLayerKind, string> = {
  temperature: 'Temperatura',
  pressure: 'Ciśnienie (izobary)',
  wind: 'Wiatr',
};

interface LayerControlProps {
  activeModel: ModelId;
  activeKind: MapLayerKind;
  onModelChange: (model: ModelId) => void;
  onKindChange: (kind: MapLayerKind) => void;
}

export function LayerControl({
  activeModel,
  activeKind,
  onModelChange,
  onKindChange,
}: LayerControlProps) {
  return (
    <div className="absolute top-2.5 right-2.5 z-10 w-44 rounded border border-line-strong bg-panel p-3 text-sm shadow">
      <p className="mb-1 font-bold text-ink">Warstwa</p>
      {LAYER_KINDS.map((kind) => (
        <label key={kind} className="flex items-center gap-2 py-0.5 text-ink">
          <input
            type="radio"
            name="layer-kind"
            checked={activeKind === kind}
            onChange={() => {
              onKindChange(kind);
            }}
          />
          {LAYER_KIND_LABELS[kind]}
        </label>
      ))}
      <p className="mt-2 mb-1 font-bold text-ink">Model</p>
      {MODEL_IDS.map((model) => (
        <label key={model} className="flex items-center gap-2 py-0.5 text-ink">
          <input
            type="radio"
            name="layer-model"
            checked={activeModel === model}
            onChange={() => {
              onModelChange(model);
            }}
          />
          {MODEL_LABELS[model]}
        </label>
      ))}
    </div>
  );
}
