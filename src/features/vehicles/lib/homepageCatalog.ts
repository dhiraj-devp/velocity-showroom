import { isFeaturedEligible } from "@/features/vehicles/lib/availability";
import { resolveVehicle } from "@/features/vehicles/lib/resolveVehicle";
import type {
  HomepageCategory,
  VehicleCatalog,
  VehicleRecord,
  VehicleSearchOptions,
} from "@/features/vehicles/types";

export const LATEST_ARRIVAL_LIMIT = 6;

function createdAtMs(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export function selectLatestVehicles(
  catalog: VehicleCatalog,
  limit = LATEST_ARRIVAL_LIMIT,
): VehicleRecord[] {
  return catalog.vehicles
    .filter((vehicle) => vehicle.availability !== "sold")
    .slice()
    .sort((a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt))
    .slice(0, limit)
    .map((vehicle) => resolveVehicle(vehicle, catalog))
    .filter((record): record is VehicleRecord => record !== null);
}

export function selectHomepageCategories(
  catalog: VehicleCatalog,
): HomepageCategory[] {
  const counts = new Map<string, number>();
  for (const vehicle of catalog.vehicles) {
    counts.set(vehicle.categoryId, (counts.get(vehicle.categoryId) ?? 0) + 1);
  }

  return catalog.categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      vehicleCount: counts.get(category.id) ?? 0,
    }))
    .filter((category) => category.vehicleCount > 0);
}

export function selectVehicleSearchOptions(
  catalog: VehicleCatalog,
): VehicleSearchOptions {
  return {
    brands: catalog.brands,
    models: catalog.models,
    categories: catalog.categories,
  };
}

export function select360ShowcaseVehicle(
  catalog: VehicleCatalog,
): VehicleRecord | null {
  const matches = catalog.vehicles
    .filter((vehicle) => vehicle.has360View)
    .slice()
    .sort((a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt));

  for (const vehicle of matches) {
    const record = resolveVehicle(vehicle, catalog);
    if (record) return record;
  }

  return null;
}

export function selectFeaturedVehicles(catalog: VehicleCatalog): VehicleRecord[] {
  return catalog.vehicles
    .filter(
      (vehicle) =>
        vehicle.isFeatured && isFeaturedEligible(vehicle.availability),
    )
    .map((vehicle) => resolveVehicle(vehicle, catalog))
    .filter((record): record is VehicleRecord => record !== null);
}
