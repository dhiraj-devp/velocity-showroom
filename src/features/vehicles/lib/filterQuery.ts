import { PRICE_PRESETS } from "@/features/vehicles/lib/pricePresets";
import { createDefaultFilters, DEFAULT_SORT } from "@/features/vehicles/lib/filterState";
import type {
  FuelType,
  SortOption,
  Transmission,
  VehicleAvailability,
  VehicleCatalog,
  VehicleCondition,
  VehicleFilters,
} from "@/features/vehicles/types";

export type CollectionQuery = {
  filters: VehicleFilters;
  sort: SortOption;
};

type SearchValue = string | string[] | undefined;

function readParam(value: SearchValue) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function readNumber(value: SearchValue) {
  const raw = readParam(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

const FUEL: FuelType[] = ["petrol", "diesel", "electric", "hybrid"];
const GEAR: Transmission[] = ["automatic", "manual"];
const CONDITION: VehicleCondition[] = ["new", "used"];
const AVAILABILITY: VehicleAvailability[] = [
  "available",
  "reserved",
  "sold",
  "coming_soon",
];
const SORT: SortOption[] = [
  "featured",
  "price-asc",
  "price-desc",
  "year-desc",
  "year-asc",
];

export function parseCollectionQuery(
  params: Record<string, SearchValue>,
  catalog: VehicleCatalog,
): CollectionQuery {
  const filters = createDefaultFilters();
  const query = readParam(params.q).trim();
  if (query) filters.query = query;

  const brandSlug = readParam(params.brand);
  const brand = catalog.brands.find((item) => item.slug === brandSlug);
  if (brand) filters.brandId = brand.id;

  const modelSlug = readParam(params.model);
  const model = catalog.models.find((item) => {
    if (item.slug !== modelSlug) return false;
    return filters.brandId ? item.brandId === filters.brandId : true;
  });
  if (model) filters.modelId = model.id;

  const categorySlug = readParam(params.category);
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (category) filters.categoryId = category.id;

  const pricePreset = PRICE_PRESETS.find(
    (item) => item.id === readParam(params.price),
  );
  if (pricePreset && pricePreset.id !== "any") {
    filters.minPrice = pricePreset.min;
    filters.maxPrice = pricePreset.max;
  }

  filters.minPrice = readNumber(params.minPrice) ?? filters.minPrice;
  filters.maxPrice = readNumber(params.maxPrice) ?? filters.maxPrice;
  filters.yearMin = readNumber(params.yearMin);
  filters.yearMax = readNumber(params.yearMax);

  const fuel = readParam(params.fuel);
  if (FUEL.includes(fuel as FuelType)) filters.fuelType = fuel as FuelType;

  const transmission = readParam(params.transmission);
  if (GEAR.includes(transmission as Transmission)) {
    filters.transmission = transmission as Transmission;
  }

  const condition = readParam(params.condition);
  if (CONDITION.includes(condition as VehicleCondition)) {
    filters.condition = condition as VehicleCondition;
  }

  const availability = readParam(params.availability);
  if (AVAILABILITY.includes(availability as VehicleAvailability)) {
    filters.availability = availability as VehicleAvailability;
  }

  const sortRaw = readParam(params.sort);
  const sort = SORT.includes(sortRaw as SortOption)
    ? (sortRaw as SortOption)
    : DEFAULT_SORT;

  return { filters, sort };
}

export function serializeCollectionQuery(
  query: CollectionQuery,
  catalog: VehicleCatalog,
): string {
  const params = new URLSearchParams();
  const { filters, sort } = query;

  if (filters.query.trim()) params.set("q", filters.query.trim());

  const brand = catalog.brands.find((item) => item.id === filters.brandId);
  if (brand) params.set("brand", brand.slug);

  const model = catalog.models.find((item) => item.id === filters.modelId);
  if (model) params.set("model", model.slug);

  const category = catalog.categories.find((item) => item.id === filters.categoryId);
  if (category) params.set("category", category.slug);

  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.yearMin !== null) params.set("yearMin", String(filters.yearMin));
  if (filters.yearMax !== null) params.set("yearMax", String(filters.yearMax));
  if (filters.fuelType) params.set("fuel", filters.fuelType);
  if (filters.transmission) params.set("transmission", filters.transmission);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.availability) params.set("availability", filters.availability);
  if (sort !== DEFAULT_SORT) params.set("sort", sort);

  return params.toString();
}
