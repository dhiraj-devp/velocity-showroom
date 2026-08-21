import type { VehicleCatalog, VehicleRecord } from "@/features/vehicles/types";
import type { Vehicle } from "@/features/vehicles/types";

export function resolveVehicle(
  vehicle: Vehicle,
  catalog: VehicleCatalog,
): VehicleRecord | null {
  const brand = catalog.brands.find((item) => item.id === vehicle.brandId);
  const model = catalog.models.find((item) => item.id === vehicle.modelId);
  const category = catalog.categories.find((item) => item.id === vehicle.categoryId);

  if (!brand || !model || !category) return null;

  return { vehicle, brand, model, category };
}

export function resolveVehicles(
  vehicles: Vehicle[],
  catalog: VehicleCatalog,
): VehicleRecord[] {
  return vehicles
    .map((vehicle) => resolveVehicle(vehicle, catalog))
    .filter((record): record is VehicleRecord => record !== null);
}

export function getHeroImage(record: VehicleRecord) {
  return (
    record.vehicle.images.find((image) => image.role === "hero") ??
    record.vehicle.images[0]
  );
}
