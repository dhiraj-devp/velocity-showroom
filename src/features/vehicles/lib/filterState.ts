import type { SortOption, VehicleFilters } from "@/features/vehicles/types";

export const DEFAULT_SORT: SortOption = "featured";

export const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "year-desc", label: "Newest Year" },
  { id: "year-asc", label: "Oldest Year" },
];

export function createDefaultFilters(): VehicleFilters {
  return {
    query: "",
    brandId: null,
    modelId: null,
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    yearMin: null,
    yearMax: null,
    fuelType: null,
    transmission: null,
    condition: null,
    availability: null,
  };
}

export function hasActiveFilters(filters: VehicleFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.brandId !== null ||
    filters.modelId !== null ||
    filters.categoryId !== null ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.yearMin !== null ||
    filters.yearMax !== null ||
    filters.fuelType !== null ||
    filters.transmission !== null ||
    filters.condition !== null ||
    filters.availability !== null
  );
}
