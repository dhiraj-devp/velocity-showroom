import { resolveVehicles } from "@/features/vehicles/lib/resolveVehicle";
import type { Vehicle, VehicleCatalog, VehicleRecord } from "@/features/vehicles/types";

const PRICE_TOLERANCE = 0.35;
const LIMIT = 3;

function score(candidate: Vehicle, current: Vehicle): number {
  let value = 0;

  if (candidate.brandId === current.brandId) value += 4;
  if (candidate.categoryId === current.categoryId) value += 3;

  const delta = Math.abs(candidate.price - current.price) / Math.max(current.price, 1);
  if (delta <= PRICE_TOLERANCE) value += 2;

  if (candidate.isFeatured) value += 1;
  if (candidate.availability === "available") value += 1;
  if (candidate.availability === "sold") value -= 2;

  return value;
}

export function findSimilarVehicles(
  current: Vehicle,
  catalog: VehicleCatalog,
  limit = LIMIT,
): VehicleRecord[] {
  const ranked = catalog.vehicles
    .filter((vehicle) => vehicle.id !== current.id)
    .map((vehicle) => ({ vehicle, rank: score(vehicle, current) }))
    .sort((a, b) => b.rank - a.rank || b.vehicle.year - a.vehicle.year);

  const picked: Vehicle[] = [];

  for (const item of ranked) {
    if (picked.length >= limit) break;
    if (item.rank <= 0) continue;
    picked.push(item.vehicle);
  }

  if (picked.length < limit) {
    const featured = catalog.vehicles.filter(
      (vehicle) =>
        vehicle.id !== current.id &&
        vehicle.isFeatured &&
        vehicle.availability === "available" &&
        !picked.some((item) => item.id === vehicle.id),
    );

    for (const vehicle of featured) {
      if (picked.length >= limit) break;
      picked.push(vehicle);
    }
  }

  if (picked.length < limit) {
    for (const item of ranked) {
      if (picked.length >= limit) break;
      if (picked.some((vehicle) => vehicle.id === item.vehicle.id)) continue;
      picked.push(item.vehicle);
    }
  }

  return resolveVehicles(picked.slice(0, limit), catalog);
}
