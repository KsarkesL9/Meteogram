interface TimeBarProps {
  stepCount: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeLabel: string;
}

export function TimeBar({
  stepCount,
  activeIndex,
  onIndexChange,
  isPlaying,
  onTogglePlay,
  timeLabel,
}: TimeBarProps) {
  const isDisabled = stepCount === 0;
  const lastIndex = Math.max(0, stepCount - 1);
  const stepButton =
    'rounded border border-line-strong bg-panel px-2 py-0.5 disabled:opacity-40';

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-line bg-header-light px-3 py-2 text-sm">
      <button
        type="button"
        className={stepButton}
        disabled={isDisabled || activeIndex === 0}
        onClick={() => {
          onIndexChange(activeIndex - 1);
        }}
      >
        ◀
      </button>
      <button
        type="button"
        className={stepButton}
        disabled={isDisabled}
        onClick={onTogglePlay}
        title="Odtwarzanie prognozy w pętli"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button
        type="button"
        className={stepButton}
        disabled={isDisabled || activeIndex === lastIndex}
        onClick={() => {
          onIndexChange(activeIndex + 1);
        }}
      >
        ▶▶
      </button>
      <input
        type="range"
        className="min-w-0 grow"
        min={0}
        max={lastIndex}
        step={1}
        value={activeIndex}
        disabled={isDisabled}
        onChange={(event) => {
          onIndexChange(Number(event.target.value));
        }}
      />
      <span className="w-36 shrink-0 text-right text-ink-secondary">
        {timeLabel}
      </span>
    </div>
  );
}
