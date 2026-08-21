import type { ExplorationPreset } from "@/features/showroom/config/explorationPresets";

type ExplorationPanelProps = {
  preset: ExplorationPreset;
  pointCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
};

export function ExplorationPanel({
  preset,
  pointCount,
  onPrevious,
  onNext,
  onBack,
}: ExplorationPanelProps) {
  return (
    <div
      id="exploration-panel"
      className="exploration-panel"
      tabIndex={-1}
      aria-live="polite"
    >
      <p className="exploration-kicker">
        {preset.index} / {String(pointCount).padStart(2, "0")}
      </p>
      <p className="exploration-label">{preset.label}</p>
      <h2 className="exploration-title">{preset.title}</h2>
      <p className="exploration-copy">{preset.description}</p>

      <div className="exploration-actions">
        <button type="button" className="exploration-ghost" onClick={onPrevious}>
          Previous
        </button>
        <button type="button" className="exploration-ghost" onClick={onNext}>
          Next
        </button>
      </div>

      <button type="button" className="exploration-back" onClick={onBack}>
        Back to showroom
      </button>
    </div>
  );
}

export type { ExplorationPanelProps };
