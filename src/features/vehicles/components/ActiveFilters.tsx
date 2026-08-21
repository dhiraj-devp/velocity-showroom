import type { ActiveFilterChip } from "@/features/vehicles/lib/activeFilters";

type ActiveFiltersProps = {
  chips: ActiveFilterChip[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

export function ActiveFilters({ chips, onRemove, onClear }: ActiveFiltersProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className="collection-chip collection-chip-active"
          onClick={() => onRemove(chip.id)}
        >
          {chip.label}
          <span aria-hidden="true"> ×</span>
          <span className="sr-only">Remove {chip.label}</span>
        </button>
      ))}
      <button
        type="button"
        className="text-[0.58rem] tracking-[0.24em] text-muted uppercase"
        onClick={onClear}
      >
        Clear all
      </button>
    </div>
  );
}
