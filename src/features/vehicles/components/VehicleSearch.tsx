import { PRICE_PRESETS } from "@/features/vehicles/lib/pricePresets";
import type { Brand, Model, VehicleFilters } from "@/features/vehicles/types";

type VehicleSearchProps = {
  filters: VehicleFilters;
  brands: Brand[];
  models: Model[];
  onChange: (filters: VehicleFilters) => void;
  onSubmit: () => void;
};

export function VehicleSearch({
  filters,
  brands,
  models,
  onChange,
  onSubmit,
}: VehicleSearchProps) {
  const brandModels = filters.brandId
    ? models.filter((model) => model.brandId === filters.brandId)
    : [];

  return (
    <form
      className="collection-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="collection-field collection-search-query">
        <span className="collection-label">Search</span>
        <input
          type="search"
          value={filters.query}
          placeholder="Vehicles, brands, or models"
          className="collection-input"
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
        />
      </label>

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
              modelId:
                brandId &&
                models.some(
                  (model) =>
                    model.id === filters.modelId && model.brandId === brandId,
                )
                  ? filters.modelId
                  : null,
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

      <label className="collection-field">
        <span className="collection-label">Price</span>
        <select
          className="collection-select"
          value={priceSelectValue(filters)}
          onChange={(event) => {
            const preset = PRICE_PRESETS.find((item) => item.id === event.target.value);
            if (!preset) return;
            onChange({
              ...filters,
              minPrice: preset.min,
              maxPrice: preset.max,
            });
          }}
        >
          {PRICE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
          {priceSelectValue(filters) === "custom" ? (
            <option value="custom">Custom</option>
          ) : null}
        </select>
      </label>

      <button type="submit" className="collection-apply">
        Search
      </button>
    </form>
  );
}

function priceSelectValue(filters: VehicleFilters) {
  const preset = PRICE_PRESETS.find(
    (item) => item.min === filters.minPrice && item.max === filters.maxPrice,
  );
  return preset?.id ?? "custom";
}
