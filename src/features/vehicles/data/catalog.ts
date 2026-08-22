import { brands } from "@/features/vehicles/data/brands";
import { categories } from "@/features/vehicles/data/categories";
import { models } from "@/features/vehicles/data/models";
import { vehicles as demoVehicles } from "@/features/vehicles/data/vehicles";
import { is360ExperienceReady } from "@/features/vehicles/lib/spin";
import type { VehicleCatalog } from "@/features/vehicles/types";

export const catalog: VehicleCatalog = {
  brands,
  models,
  categories,
  vehicles: demoVehicles.map((vehicle, index) => ({
    ...vehicle,
    frames: [],
    is360Enabled: vehicle.has360View,
    has360View: is360ExperienceReady(vehicle.has360View, 0),
    createdAt: new Date(Date.UTC(2025, 0, 4 + index)).toISOString(),
  })),
};
