import { and, count, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { mapBrand, mapCategory, mapModel, mapVehicle } from "@/db/mapToDomain";
import { brands } from "@/db/schema/brands";
import { bookings } from "@/db/schema/bookings";
import { categories } from "@/db/schema/categories";
import { leads } from "@/db/schema/leads";
import { vehicle360Frames } from "@/db/schema/vehicle-360-frames";
import { vehicleImages } from "@/db/schema/vehicle-images";
import { vehicleInternal } from "@/db/schema/vehicle-internal";
import { vehicleModels } from "@/db/schema/vehicle-models";
import { vehicleReservations } from "@/db/schema/vehicle-reservations";
import { vehicles } from "@/db/schema/vehicles";
import { isFeaturedEligible } from "@/features/vehicles/lib/availability";
import { resolveVehicle } from "@/features/vehicles/lib/resolveVehicle";
import { findSimilarVehicles } from "@/features/vehicles/lib/similarVehicles";
import { MIN_360_FRAMES } from "@/features/vehicles/lib/spin";
import {
  compareVehicleImageOrder,
  isStoredVehiclePhoto,
  preferStoredVehicleImages,
} from "@/features/vehicles/lib/vehicleImages";
import type {
  Model,
  VehicleAvailability,
  VehicleCatalog,
  VehicleRecord,
  VehicleWriteInput,
} from "@/features/vehicles/types";

function groupImages(rows: (typeof vehicleImages.$inferSelect)[]) {
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = grouped.get(row.vehicleId) ?? [];
    list.push(row);
    grouped.set(row.vehicleId, list);
  }
  return grouped;
}

function groupFrames(rows: (typeof vehicle360Frames.$inferSelect)[]) {
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = grouped.get(row.vehicleId) ?? [];
    list.push(row);
    grouped.set(row.vehicleId, list);
  }
  return grouped;
}

function toRow(
  input: VehicleWriteInput,
  id: string,
  primaryImage: string | null,
  has360View: boolean,
) {
  return {
    id,
    slug: input.slug,
    brandId: input.brandId,
    modelId: input.modelId,
    categoryId: input.categoryId,
    title: input.name,
    year: input.year,
    price: input.price,
    currency: input.currency,
    mileage: input.mileageKm ?? null,
    fuelType: input.fuelType,
    transmission: input.transmission,
    condition: input.condition,
    availability: input.availability,
    description: input.description,
    location: input.location ?? null,
    isFeatured: input.isFeatured,
    hasGallery: input.hasGallery,
    has360View,
    has3DExperience: input.has3DExperience,
    primaryImage,
    model3dUrl: input.optional3DModelUrl ?? null,
  };
}

export const mysqlVehicleRepository = {
  async getCatalog(): Promise<VehicleCatalog> {
    const db = getDb();
    const [brandRows, modelRows, categoryRows, vehicleRows, imageRows, frameRows] =
      await Promise.all([
        db.select().from(brands),
        db.select().from(vehicleModels),
        db.select().from(categories),
        db.select().from(vehicles),
        db.select().from(vehicleImages),
        db.select().from(vehicle360Frames),
      ]);

    const imagesByVehicle = groupImages(imageRows);
    const framesByVehicle = groupFrames(frameRows);

    return {
      brands: brandRows.map(mapBrand),
      models: modelRows.map(mapModel),
      categories: categoryRows.map(mapCategory),
      vehicles: vehicleRows.map((row) =>
        mapVehicle(
          row,
          imagesByVehicle.get(row.id) ?? [],
          framesByVehicle.get(row.id) ?? [],
        ),
      ),
    };
  },

  async getVehicleBySlug(slug: string): Promise<VehicleRecord | null> {
    const catalog = await this.getCatalog();
    const vehicle = catalog.vehicles.find((item) => item.slug === slug);
    if (!vehicle) return null;
    return resolveVehicle(vehicle, catalog);
  },

  async getVehicleById(id: string): Promise<VehicleRecord | null> {
    const catalog = await this.getCatalog();
    const vehicle = catalog.vehicles.find((item) => item.id === id);
    if (!vehicle) return null;
    return resolveVehicle(vehicle, catalog);
  },

  async getFeaturedVehicles(): Promise<VehicleRecord[]> {
    const catalog = await this.getCatalog();
    return catalog.vehicles
      .filter(
        (vehicle) =>
          vehicle.isFeatured && isFeaturedEligible(vehicle.availability),
      )
      .map((vehicle) => resolveVehicle(vehicle, catalog))
      .filter((record): record is VehicleRecord => record !== null);
  },

  async getSimilarVehicles(
    record: VehicleRecord,
    limit = 3,
  ): Promise<VehicleRecord[]> {
    const catalog = await this.getCatalog();
    return findSimilarVehicles(record.vehicle, catalog, limit);
  },

  async getModelsByBrand(brandId: string): Promise<Model[]> {
    const catalog = await this.getCatalog();
    return catalog.models.filter((model) => model.brandId === brandId);
  },

  async count(): Promise<number> {
    const db = getDb();
    const [row] = await db.select({ n: count() }).from(vehicles);
    return Number(row?.n ?? 0);
  },

  async countByAvailability(): Promise<Record<VehicleAvailability, number>> {
    const db = getDb();
    const rows = await db
      .select({ availability: vehicles.availability, n: count() })
      .from(vehicles)
      .groupBy(vehicles.availability);

    const counts: Record<VehicleAvailability, number> = {
      available: 0,
      reserved: 0,
      sold: 0,
      coming_soon: 0,
    };
    for (const row of rows) {
      counts[row.availability] = Number(row.n);
    }
    return counts;
  },

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const db = getDb();
    const rows = excludeId
      ? await db
          .select({ id: vehicles.id })
          .from(vehicles)
          .where(and(eq(vehicles.slug, slug), ne(vehicles.id, excludeId)))
          .limit(1)
      : await db
          .select({ id: vehicles.id })
          .from(vehicles)
          .where(eq(vehicles.slug, slug))
          .limit(1);
    return rows.length > 0;
  },

  async create(input: VehicleWriteInput): Promise<string> {
    const db = getDb();
    const id = `veh-${crypto.randomUUID().slice(0, 12)}`;
    await db.insert(vehicles).values(toRow(input, id, null, false));
    return id;
  },

  async update(id: string, input: VehicleWriteInput): Promise<void> {
    const db = getDb();
    const [current] = await db
      .select({
        primaryImage: vehicles.primaryImage,
        has360View: vehicles.has360View,
      })
      .from(vehicles)
      .where(eq(vehicles.id, id))
      .limit(1);
    if (!current) throw new Error("Vehicle not found.");
    await db
      .update(vehicles)
      .set(toRow(input, id, current.primaryImage, Boolean(current.has360View)))
      .where(eq(vehicles.id, id));
  },

  async delete(id: string): Promise<{ imageUrls: string[] }> {
    const db = getDb();
    const [leadCount] = await db
      .select({ n: count() })
      .from(leads)
      .where(eq(leads.vehicleId, id));
    const [bookingCount] = await db
      .select({ n: count() })
      .from(bookings)
      .where(eq(bookings.vehicleId, id));

    if (Number(leadCount?.n ?? 0) > 0) {
      throw new Error(
        "This vehicle has enquiries. Mark it sold instead of deleting it.",
      );
    }
    if (Number(bookingCount?.n ?? 0) > 0) {
      throw new Error(
        "This vehicle has viewings. Cancel or complete them before deleting.",
      );
    }
    const [activeHold] = await db
      .select({ n: count() })
      .from(vehicleReservations)
      .where(and(eq(vehicleReservations.vehicleId, id), eq(vehicleReservations.status, "active")));
    if (Number(activeHold?.n ?? 0) > 0) {
      throw new Error("Cancel the active reservation before deleting this vehicle.");
    }

    await db.delete(vehicleReservations).where(eq(vehicleReservations.vehicleId, id));
    await db.delete(vehicleInternal).where(eq(vehicleInternal.vehicleId, id));

    const images = await db
      .select()
      .from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, id));
    const frames = await db
      .select()
      .from(vehicle360Frames)
      .where(eq(vehicle360Frames.vehicleId, id));
    await db.delete(vehicle360Frames).where(eq(vehicle360Frames.vehicleId, id));
    await db.delete(vehicleImages).where(eq(vehicleImages.vehicleId, id));
    await db.delete(vehicles).where(eq(vehicles.id, id));
    return {
      imageUrls: [...images.map((image) => image.url), ...frames.map((frame) => frame.url)],
    };
  },

  async addImage(input: {
    vehicleId: string;
    url: string;
    alt: string;
    isPrimary: boolean;
  }) {
    const db = getDb();
    const existing = await db
      .select({
        id: vehicleImages.id,
        sortOrder: vehicleImages.sortOrder,
        url: vehicleImages.url,
      })
      .from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, input.vehicleId));
    const nextOrder =
      existing.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
    const storedCount = existing.filter((row) => isStoredVehiclePhoto(row.url)).length;
    const incomingStored = isStoredVehiclePhoto(input.url);
    const makePrimary =
      input.isPrimary || (incomingStored ? storedCount === 0 : existing.length === 0);
    if (makePrimary) {
      await db
        .update(vehicleImages)
        .set({ isPrimary: false })
        .where(eq(vehicleImages.vehicleId, input.vehicleId));
    }
    const id = `img-${crypto.randomUUID().slice(0, 12)}`;
    await db.insert(vehicleImages).values({
      id,
      vehicleId: input.vehicleId,
      url: input.url,
      alt: input.alt,
      sortOrder: nextOrder,
      isPrimary: makePrimary,
    });
    if (makePrimary) {
      await db
        .update(vehicles)
        .set({ primaryImage: input.url })
        .where(eq(vehicles.id, input.vehicleId));
    }
    const nextStored = storedCount + (incomingStored ? 1 : 0);
    const nextTotal = existing.length + 1;
    await db
      .update(vehicles)
      .set({ hasGallery: (nextStored > 0 ? nextStored : nextTotal) > 1 })
      .where(eq(vehicles.id, input.vehicleId));
    return id;
  },

  async setCoverImage(vehicleId: string, imageId: string) {
    const db = getDb();
    const [image] = await db
      .select()
      .from(vehicleImages)
      .where(and(eq(vehicleImages.id, imageId), eq(vehicleImages.vehicleId, vehicleId)))
      .limit(1);
    if (!image) throw new Error("Image not found.");
    await db
      .update(vehicleImages)
      .set({ isPrimary: false })
      .where(eq(vehicleImages.vehicleId, vehicleId));
    await db
      .update(vehicleImages)
      .set({ isPrimary: true })
      .where(eq(vehicleImages.id, imageId));
    await db
      .update(vehicles)
      .set({ primaryImage: image.url })
      .where(eq(vehicles.id, vehicleId));
  },

  async reorderImages(vehicleId: string, orderedIds: string[]) {
    const db = getDb();
    for (const [index, id] of orderedIds.entries()) {
      await db
        .update(vehicleImages)
        .set({ sortOrder: index })
        .where(and(eq(vehicleImages.id, id), eq(vehicleImages.vehicleId, vehicleId)));
    }
  },

  async deleteImage(vehicleId: string, imageId: string) {
    const db = getDb();
    const [image] = await db
      .select()
      .from(vehicleImages)
      .where(and(eq(vehicleImages.id, imageId), eq(vehicleImages.vehicleId, vehicleId)))
      .limit(1);
    if (!image) throw new Error("Image not found.");
    await db.delete(vehicleImages).where(eq(vehicleImages.id, imageId));
    const remaining = await db
      .select()
      .from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, vehicleId));
    const nextCover = preferStoredVehicleImages(remaining)
      .slice()
      .sort(compareVehicleImageOrder)[0];
    if (image.isPrimary && nextCover) {
      await db
        .update(vehicleImages)
        .set({ isPrimary: true })
        .where(eq(vehicleImages.id, nextCover.id));
      await db
        .update(vehicles)
        .set({ primaryImage: nextCover.url })
        .where(eq(vehicles.id, vehicleId));
    } else if (remaining.length === 0) {
      await db
        .update(vehicles)
        .set({ primaryImage: null })
        .where(eq(vehicles.id, vehicleId));
    }
    const storedRemaining = remaining.filter((row) => isStoredVehiclePhoto(row.url)).length;
    await db
      .update(vehicles)
      .set({
        hasGallery: (storedRemaining > 0 ? storedRemaining : remaining.length) > 1,
      })
      .where(eq(vehicles.id, vehicleId));
    return image.url;
  },

  async add360Frame(input: { vehicleId: string; url: string; alt: string }) {
    const db = getDb();
    const existing = await db
      .select({ sortOrder: vehicle360Frames.sortOrder })
      .from(vehicle360Frames)
      .where(eq(vehicle360Frames.vehicleId, input.vehicleId));
    const nextOrder =
      existing.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
    const id = `spn-${crypto.randomUUID().slice(0, 12)}`;
    await db.insert(vehicle360Frames).values({
      id,
      vehicleId: input.vehicleId,
      url: input.url,
      alt: input.alt,
      sortOrder: nextOrder,
    });
    return id;
  },

  async reorder360Frames(vehicleId: string, orderedIds: string[]) {
    const db = getDb();
    for (const [index, id] of orderedIds.entries()) {
      await db
        .update(vehicle360Frames)
        .set({ sortOrder: index })
        .where(
          and(eq(vehicle360Frames.id, id), eq(vehicle360Frames.vehicleId, vehicleId)),
        );
    }
  },

  async delete360Frame(vehicleId: string, frameId: string) {
    const db = getDb();
    const [frame] = await db
      .select()
      .from(vehicle360Frames)
      .where(
        and(eq(vehicle360Frames.id, frameId), eq(vehicle360Frames.vehicleId, vehicleId)),
      )
      .limit(1);
    if (!frame) throw new Error("360 frame not found.");
    await db.delete(vehicle360Frames).where(eq(vehicle360Frames.id, frameId));
    const remaining = await db
      .select({ id: vehicle360Frames.id })
      .from(vehicle360Frames)
      .where(eq(vehicle360Frames.vehicleId, vehicleId));
    if (remaining.length < MIN_360_FRAMES) {
      await db
        .update(vehicles)
        .set({ has360View: false })
        .where(eq(vehicles.id, vehicleId));
    }
    return frame.url;
  },

  async set360Enabled(vehicleId: string, enabled: boolean) {
    const db = getDb();
    if (enabled) {
      const [row] = await db
        .select({ n: count() })
        .from(vehicle360Frames)
        .where(eq(vehicle360Frames.vehicleId, vehicleId));
      if (Number(row?.n ?? 0) < MIN_360_FRAMES) {
        throw new Error(
          `Upload at least ${MIN_360_FRAMES} frames before enabling 360° view.`,
        );
      }
    }
    await db
      .update(vehicles)
      .set({ has360View: enabled })
      .where(eq(vehicles.id, vehicleId));
  },

  async setAvailability(id: string, availability: VehicleAvailability) {
    const db = getDb();
    await db.update(vehicles).set({ availability }).where(eq(vehicles.id, id));
  },
};
