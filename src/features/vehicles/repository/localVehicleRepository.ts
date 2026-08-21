import { catalog } from "@/features/vehicles/data/catalog";
import { isFeaturedEligible } from "@/features/vehicles/lib/availability";
import { resolveVehicle } from "@/features/vehicles/lib/resolveVehicle";
import { findSimilarVehicles } from "@/features/vehicles/lib/similarVehicles";
import type {
  Model,
  VehicleCatalog,
  VehicleRecord,
} from "@/features/vehicles/types";

/**
 * Local catalog access. Replace this module later with an API or MySQL-backed
 * repository that returns the same VehicleCatalog / VehicleRecord shapes.
 */
export const localVehicleRepository = {
  getCatalog(): VehicleCatalog {
    return catalog;
  },

  getVehicleBySlug(slug: string): VehicleRecord | null {
    const vehicle = catalog.vehicles.find((item) => item.slug === slug);
    if (!vehicle) return null;
    return resolveVehicle(vehicle, catalog);
  },

  getFeaturedVehicles(): VehicleRecord[] {
    return catalog.vehicles
      .filter((vehicle) => vehicle.isFeatured && isFeaturedEligible(vehicle.availability))
      .map((vehicle) => resolveVehicle(vehicle, catalog))
      .filter((record): record is VehicleRecord => record !== null);
  },

  getSimilarVehicles(record: VehicleRecord, limit = 3): VehicleRecord[] {
    return findSimilarVehicles(record.vehicle, catalog, limit);
  },

  getModelsByBrand(brandId: string): Model[] {
    return catalog.models.filter((model) => model.brandId === brandId);
  },
};
