import type { SortOption, Vehicle } from "@/features/vehicles/types";

export function sortVehicles(vehicles: Vehicle[], sort: SortOption): Vehicle[] {
  const next = [...vehicles];

  next.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "year-desc":
        return b.year - a.year;
      case "year-asc":
        return a.year - b.year;
      default:
        if (a.isFeatured !== b.isFeatured) {
          return Number(b.isFeatured) - Number(a.isFeatured);
        }
        return b.year - a.year;
    }
  });

  return next;
}
