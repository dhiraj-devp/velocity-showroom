import {
  EXPLORATION_POINTS,
  type ExplorationPoint,
} from "@/features/showroom/config/explorationPresets";

type ExplorationNavigationProps = {
  active: ExplorationPoint;
  onSelect: (point: ExplorationPoint) => void;
};

const LABELS: Record<ExplorationPoint, string> = {
  design: "01 DESIGN",
  wheels: "02 WHEELS",
  interior: "03 INTERIOR",
};

export function ExplorationNavigation({
  active,
  onSelect,
}: ExplorationNavigationProps) {
  return (
    <nav aria-label="Vehicle areas" className="exploration-nav">
      {EXPLORATION_POINTS.map((point) => {
        const selected = point === active;
        return (
          <button
            key={point}
            type="button"
            className="exploration-nav-item"
            aria-current={selected ? "true" : undefined}
            onClick={() => onSelect(point)}
          >
            {LABELS[point]}
          </button>
        );
      })}
    </nav>
  );
}
