import { SORT_OPTIONS } from "@/features/vehicles/lib/filterState";
import type { SortOption } from "@/features/vehicles/types";

type VehicleSortProps = {
  value: SortOption;
  onChange: (sort: SortOption) => void;
};

export function VehicleSort({ value, onChange }: VehicleSortProps) {
  return (
    <label className="collection-field">
      <span className="collection-label">Sort</span>
      <select
        className="collection-select"
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
