import type { MetadataRoute } from "next";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import { absoluteUrl } from "@/lib/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await vehicleRepository.getCatalog();
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/cars"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...catalog.vehicles.map((vehicle) => ({
      url: absoluteUrl(`/cars/${vehicle.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
