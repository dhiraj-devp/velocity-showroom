import { PRICE_PRESETS } from "@/features/vehicles/lib/pricePresets";
import type {
  Brand,
  FuelType,
  Model,
  Transmission,
  VehicleCondition,
  VehicleFilters,
} from "@/features/vehicles/types";

type VehicleFiltersPanelProps = {
  filters: VehicleFilters;
  brands: Brand[];
  models: Model[];
  years: number[];
  onChange: (filters: VehicleFilters) => void;
};

const FUELS: FuelType[] = ["petrol", "diesel", "electric", "hybrid"];
const GEARS: Transmission[] = ["automatic", "manual"];
const CONDITIONS: VehicleCondition[] = ["new", "used"];

export function VehicleFiltersPanel({
  filters,
  brands,
  models,
  years,
  onChange,
}: VehicleFiltersPanelProps) {
  const brandModels = filters.brandId
    ? models.filter((model) => model.brandId === filters.brandId)
    : [];

  return (
    <div className="collection-filters">
      <p className="collection-label">Refine</p>

      <label className="collection-field">
        <span className="collection-label">Brand</span>
        <select
          className="collection-select"
          value={filters.brandId ?? ""}
          onChange={(event) => {
            const brandId = event.target.value || null;
            onChange({
              ...filters,
              brandId,
              modelId: null,
            });
          }}
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <label className="collection-field">
        <span className="collection-label">Model</span>
        <select
          className="collection-select"
          value={filters.modelId ?? ""}
          disabled={!filters.brandId}
          onChange={(event) =>
            onChange({ ...filters, modelId: event.target.value || null })
          }
        >
          <option value="">
            {filters.brandId ? "All models" : "Select a brand first"}
          </option>
          {brandModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="collection-field">
        <legend className="collection-label">Price range</legend>
        <div className="mt-3 flex flex-col gap-2">
          {PRICE_PRESETS.map((preset) => (
            <label key={preset.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="price-preset"
                checked={
                  filters.minPrice === preset.min && filters.maxPrice === preset.max
                }
                onChange={() =>
                  onChange({
                    ...filters,
                    minPrice: preset.min,
                    maxPrice: preset.max,
                  })
                }
              />
              {preset.label}
            </label>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="collection-field">
            <span className="collection-label">Min</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className="collection-input"
              placeholder="₹"
              value={filters.minPrice ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  minPrice: event.target.value ? Number(event.target.value) : null,
                })
              }
            />
          </label>
          <label className="collection-field">
            <span className="collection-label">Max</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className="collection-input"
              placeholder="₹"
              value={filters.maxPrice ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  maxPrice: event.target.value ? Number(event.target.value) : null,
                })
              }
            />
          </label>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="collection-field">
          <span className="collection-label">Year from</span>
          <select
            className="collection-select"
            value={filters.yearMin ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                yearMin: event.target.value ? Number(event.target.value) : null,
              })
            }
          >
            <option value="">Any</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="collection-field">
          <span className="collection-label">Year to</span>
          <select
            className="collection-select"
            value={filters.yearMax ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                yearMax: event.target.value ? Number(event.target.value) : null,
              })
            }
          >
            <option value="">Any</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="collection-field">
        <span className="collection-label">Fuel</span>
        <select
          className="collection-select"
          value={filters.fuelType ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              fuelType: (event.target.value as FuelType) || null,
            })
          }
        >
          <option value="">Any</option>
          {FUELS.map((fuel) => (
            <option key={fuel} value={fuel}>
              {label(fuel)}
            </option>
          ))}
        </select>
      </label>

      <label className="collection-field">
        <span className="collection-label">Transmission</span>
        <select
          className="collection-select"
          value={filters.transmission ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              transmission: (event.target.value as Transmission) || null,
            })
          }
        >
          <option value="">Any</option>
          {GEARS.map((gear) => (
            <option key={gear} value={gear}>
              {label(gear)}
            </option>
          ))}
        </select>
      </label>

      <label className="collection-field">
        <span className="collection-label">Condition</span>
        <select
          className="collection-select"
          value={filters.condition ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              condition: (event.target.value as VehicleCondition) || null,
            })
          }
        >
          <option value="">Any</option>
          {CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {label(condition)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
