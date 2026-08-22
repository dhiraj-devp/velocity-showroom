import { isDatabaseConfigured } from "@/db";
import { cache } from "react";
import { localVehicleRepository } from "@/features/vehicles/repository/localVehicleRepository";
import { mysqlVehicleRepository } from "@/features/vehicles/repository/mysqlVehicleRepository";
import { LATEST_ARRIVAL_LIMIT } from "@/features/vehicles/lib/homepageCatalog";
import type {
  HomepageCategory,
  Model,
  VehicleAvailability,
  VehicleCatalog,
  VehicleRecord,
  VehicleSearchOptions,
  VehicleWriteInput,
} from "@/features/vehicles/types";

const loadCatalog = cache(async (): Promise<VehicleCatalog> => {
  if (isDatabaseConfigured()) {
    return mysqlVehicleRepository.getCatalog();
  }
  return localVehicleRepository.getCatalog();
});

export const vehicleRepository = {
  getCatalog: loadCatalog,

  async getVehicleBySlug(slug: string): Promise<VehicleRecord | null> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.getVehicleBySlug(slug);
    }
    return localVehicleRepository.getVehicleBySlug(slug);
  },

  async getFeaturedVehicles(): Promise<VehicleRecord[]> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.getFeaturedVehicles();
    }
    return localVehicleRepository.getFeaturedVehicles();
  },

  async getLatestVehicles(
    limit = LATEST_ARRIVAL_LIMIT,
  ): Promise<VehicleRecord[]> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.getLatestVehicles(limit);
    }
    return localVehicleRepository.getLatestVehicles(limit);
  },

  async getHomepageCategories(): Promise<HomepageCategory[]> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.getHomepageCategories();
    }
    return localVehicleRepository.getHomepageCategories();
  },

  async getVehicleSearchOptions(): Promise<VehicleSearchOptions> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.getVehicleSearchOptions();
    }
    return localVehicleRepository.getVehicleSearchOptions();
  },

  async get360ShowcaseVehicle(): Promise<VehicleRecord | null> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.get360ShowcaseVehicle();
    }
    return localVehicleRepository.get360ShowcaseVehicle();
  },

  async getSimilarVehicles(
    record: VehicleRecord,
    limit = 3,
  ): Promise<VehicleRecord[]> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.getSimilarVehicles(record, limit);
    }
    return localVehicleRepository.getSimilarVehicles(record, limit);
  },

  async getModelsByBrand(brandId: string): Promise<Model[]> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.getModelsByBrand(brandId);
    }
    return localVehicleRepository.getModelsByBrand(brandId);
  },

  async count(): Promise<number> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.count();
    }
    return localVehicleRepository.getCatalog().vehicles.length;
  },

  async getVehicleById(id: string): Promise<VehicleRecord | null> {
    if (!isDatabaseConfigured()) return null;
    return mysqlVehicleRepository.getVehicleById(id);
  },

  async countByAvailability(): Promise<Record<VehicleAvailability, number>> {
    if (isDatabaseConfigured()) {
      return mysqlVehicleRepository.countByAvailability();
    }
    const catalog = localVehicleRepository.getCatalog();
    const counts: Record<VehicleAvailability, number> = {
      available: 0,
      reserved: 0,
      sold: 0,
      coming_soon: 0,
    };
    for (const vehicle of catalog.vehicles) {
      counts[vehicle.availability] += 1;
    }
    return counts;
  },

  async slugExists(slug: string, excludeId?: string) {
    if (!isDatabaseConfigured()) return false;
    return mysqlVehicleRepository.slugExists(slug, excludeId);
  },

  async create(input: VehicleWriteInput) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to create vehicles.");
    }
    return mysqlVehicleRepository.create(input);
  },

  async update(id: string, input: VehicleWriteInput) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update vehicles.");
    }
    return mysqlVehicleRepository.update(id, input);
  },

  async delete(id: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to delete vehicles.");
    }
    return mysqlVehicleRepository.delete(id);
  },

  async addImage(input: {
    vehicleId: string;
    url: string;
    alt: string;
    isPrimary: boolean;
  }) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage images.");
    }
    return mysqlVehicleRepository.addImage(input);
  },

  async setCoverImage(vehicleId: string, imageId: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage images.");
    }
    return mysqlVehicleRepository.setCoverImage(vehicleId, imageId);
  },

  async reorderImages(vehicleId: string, orderedIds: string[]) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage images.");
    }
    return mysqlVehicleRepository.reorderImages(vehicleId, orderedIds);
  },

  async deleteImage(vehicleId: string, imageId: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage images.");
    }
    return mysqlVehicleRepository.deleteImage(vehicleId, imageId);
  },

  async add360Frame(input: { vehicleId: string; url: string; alt: string }) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage 360 frames.");
    }
    return mysqlVehicleRepository.add360Frame(input);
  },

  async reorder360Frames(vehicleId: string, orderedIds: string[]) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage 360 frames.");
    }
    return mysqlVehicleRepository.reorder360Frames(vehicleId, orderedIds);
  },

  async delete360Frame(vehicleId: string, frameId: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage 360 frames.");
    }
    return mysqlVehicleRepository.delete360Frame(vehicleId, frameId);
  },

  async set360Enabled(vehicleId: string, enabled: boolean) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to manage 360 frames.");
    }
    return mysqlVehicleRepository.set360Enabled(vehicleId, enabled);
  },

  async setAvailability(id: string, availability: VehicleAvailability) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update availability.");
    }
    return mysqlVehicleRepository.setAvailability(id, availability);
  },
};
