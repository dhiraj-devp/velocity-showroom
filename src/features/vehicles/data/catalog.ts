import { brands } from "@/features/vehicles/data/brands";
import { categories } from "@/features/vehicles/data/categories";
import { models } from "@/features/vehicles/data/models";
import { vehicles } from "@/features/vehicles/data/vehicles";
import type { VehicleCatalog } from "@/features/vehicles/types";

export const catalog: VehicleCatalog = {
  brands,
  models,
  categories,
  vehicles,
};
