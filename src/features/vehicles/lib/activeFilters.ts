import { availabilityLabel } from "@/features/vehicles/lib/availability";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import { matchPricePreset } from "@/features/vehicles/lib/pricePresets";
import type { VehicleCatalog, VehicleFilters } from "@/features/vehicles/types";

export type ActiveFilterChip = {
  id: string;
  label: string;
};

export function getActiveFilterChips(
  filters: VehicleFilters,
  catalog: VehicleCatalog,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.query.trim()) {
    chips.push({ id: "query", label: `“${filters.query.trim()}”` });
  }

  const brand = catalog.brands.find((item) => item.id === filters.brandId);
  if (brand) chips.push({ id: "brandId", label: brand.name });

  const model = catalog.models.find((item) => item.id === filters.modelId);
  if (model) chips.push({ id: "modelId", label: model.name });

  const category = catalog.categories.find((item) => item.id === filters.categoryId);
  if (category) chips.push({ id: "categoryId", label: category.name });

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const preset = matchPricePreset(filters.minPrice, filters.maxPrice);
    chips.push({
      id: "price",
      label:
        preset && preset.id !== "any"
          ? preset.label
          : `${filters.minPrice !== null ? formatPrice(filters.minPrice) : "Any"} – ${filters.maxPrice !== null ? formatPrice(filters.maxPrice) : "Any"}`,
    });
  }

  if (filters.yearMin !== null || filters.yearMax !== null) {
    chips.push({
      id: "year",
      label: `${filters.yearMin ?? "Any"}–${filters.yearMax ?? "Any"}`,
    });
  }

  if (filters.fuelType) {
    chips.push({ id: "fuelType", label: title(filters.fuelType) });
  }
  if (filters.transmission) {
    chips.push({ id: "transmission", label: title(filters.transmission) });
  }
  if (filters.condition) {
    chips.push({ id: "condition", label: title(filters.condition) });
  }
  if (filters.availability) {
    chips.push({
      id: "availability",
      label: availabilityLabel(filters.availability),
    });
  }

  return chips;
}

export function clearFilterField(
  filters: VehicleFilters,
  id: string,
): VehicleFilters {
  switch (id) {
    case "query":
      return { ...filters, query: "" };
    case "brandId":
      return { ...filters, brandId: null, modelId: null };
    case "modelId":
      return { ...filters, modelId: null };
    case "categoryId":
      return { ...filters, categoryId: null };
    case "price":
      return { ...filters, minPrice: null, maxPrice: null };
    case "year":
      return { ...filters, yearMin: null, yearMax: null };
    case "fuelType":
      return { ...filters, fuelType: null };
    case "transmission":
      return { ...filters, transmission: null };
    case "condition":
      return { ...filters, condition: null };
    case "availability":
      return { ...filters, availability: null };
    default:
      return filters;
  }
}

function title(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
