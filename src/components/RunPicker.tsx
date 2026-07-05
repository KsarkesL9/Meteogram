import { useState } from 'react';
import { MODEL_LABELS } from './modelDisplay';
import type { ArchivedRunSelection } from '../hooks/useArchivedRun';
import { toLocationIso } from '../lib/localTime';
import { listRecentRunTimestamps } from '../lib/modelRuns';
import type { ModelId, UnixSeconds } from '../types/forecast';

// Runs are identified by their UTC initialization stamp, the meteorological convention
function formatRunLabel(runTimestamp: UnixSeconds): string {
  return `${toLocationIso(runTimestamp, 0).slice(0, 16).replace('T', ' ')} UTC`;
}

interface RunPickerProps {
  models: ModelId[];
  selection: ArchivedRunSelection | null;
  isLoading: boolean;
  hasFailed: boolean;
  onSelect: (selection: ArchivedRunSelection | null) => void;
}

export function RunPicker({
  models,
  selection,
  isLoading,
  hasFailed,
  onSelect,
}: RunPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickedModel, setPickedModel] = useState<ModelId | null>(null);
  const [runOptions, setRunOptions] = useState<UnixSeconds[]>([]);

  const openWithModel = (model: ModelId) => {
    setPickedModel(model);
    setRunOptions(
      listRecentRunTimestamps(model, Math.floor(Date.now() / 1000)),
    );
  };

  const buttonLabel =
    selection === null
      ? 'Run: najnowszy'
      : `Run: ${MODEL_LABELS[selection.model]} ${formatRunLabel(selection.runTimestamp)}`;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        className="rounded border border-line-strong bg-panel px-2 py-1 text-sm hover:bg-header-light"
        onClick={() => {
          if (!isOpen) {
            openWithModel(selection?.model ?? models[0]);
          }
          setIsOpen((open) => !open);
        }}
      >
        {buttonLabel} ▾
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div className="absolute right-0 z-30 mt-1 w-64 rounded border border-line-strong bg-panel p-3 text-sm shadow">
            <p className="mb-1 font-bold">Model</p>
            <div className="mb-2 flex flex-wrap gap-x-3">
              {models.map((model) => (
                <label key={model} className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="run-model"
                    checked={pickedModel === model}
                    onChange={() => {
                      openWithModel(model);
                    }}
                  />
                  {MODEL_LABELS[model]}
                </label>
              ))}
            </div>
            <p className="mb-1 font-bold">Run</p>
            <ul className="max-h-56 overflow-y-auto">
              <li>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1 text-left hover:bg-header-light"
                  onClick={() => {
                    onSelect(null);
                    setIsOpen(false);
                  }}
                >
                  najnowszy
                </button>
              </li>
              {pickedModel !== null &&
                runOptions.map((runTimestamp) => (
                  <li key={runTimestamp}>
                    <button
                      type="button"
                      className="w-full rounded px-2 py-1 text-left tabular-nums hover:bg-header-light"
                      onClick={() => {
                        onSelect({ model: pickedModel, runTimestamp });
                        setIsOpen(false);
                      }}
                    >
                      {formatRunLabel(runTimestamp)}
                    </button>
                  </li>
                ))}
            </ul>
            {isLoading && (
              <p className="mt-1 text-ink-muted">Ładowanie runu…</p>
            )}
            {hasFailed && (
              <p className="mt-1 text-[#a94442]">
                Nie udało się pobrać wybranego runu
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
