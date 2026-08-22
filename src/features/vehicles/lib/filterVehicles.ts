import type { Vehicle, VehicleCatalog, VehicleFilters } from "@/features/vehicles/types";

export function filterVehicles(
  vehicles: Vehicle[],
  filters: VehicleFilters,
  catalog: VehicleCatalog,
): Vehicle[] {
  const query = filters.query.trim().toLowerCase();

  return vehicles.filter((vehicle) => {
    const brand = catalog.brands.find((item) => item.id === vehicle.brandId);
    const model = catalog.models.find((item) => item.id === vehicle.modelId);
    if (!brand || !model) return false;

    if (query) {
      const haystack = `${brand.name} ${model.name} ${vehicle.name}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.brandId && vehicle.brandId !== filters.brandId) return false;
    if (filters.modelId && vehicle.modelId !== filters.modelId) return false;
    if (filters.categoryId && vehicle.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.minPrice !== null && vehicle.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && vehicle.price > filters.maxPrice) return false;
    if (filters.yearMin !== null && vehicle.year < filters.yearMin) return false;
    if (filters.yearMax !== null && vehicle.year > filters.yearMax) return false;
    if (filters.fuelType && vehicle.fuelType !== filters.fuelType) return false;
    if (filters.transmission && vehicle.transmission !== filters.transmission) {
      return false;
    }
    if (filters.condition && vehicle.condition !== filters.condition) return false;
    if (filters.availability && vehicle.availability !== filters.availability) {
      return false;
    }

    return true;
  });
}
