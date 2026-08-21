import { count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brands } from "@/db/schema/brands";
import { categories } from "@/db/schema/categories";
import { vehicleModels } from "@/db/schema/vehicle-models";
import { vehicles } from "@/db/schema/vehicles";

export const mysqlCatalogRepository = {
  async createBrand(input: { id: string; name: string; slug: string }) {
    const db = getDb();
    const [{ n }] = await db.select({ n: count() }).from(brands);
    await db.insert(brands).values({
      id: input.id,
      name: input.name,
      slug: input.slug,
      isActive: true,
      sortOrder: Number(n),
    });
  },

  async updateBrand(id: string, input: { name: string; slug: string }) {
    const db = getDb();
    await db.update(brands).set(input).where(eq(brands.id, id));
  },

  async deleteBrand(id: string) {
    const db = getDb();
    const [modelCount] = await db
      .select({ n: count() })
      .from(vehicleModels)
      .where(eq(vehicleModels.brandId, id));
    const [vehicleCount] = await db
      .select({ n: count() })
      .from(vehicles)
      .where(eq(vehicles.brandId, id));
    if (Number(modelCount?.n ?? 0) > 0 || Number(vehicleCount?.n ?? 0) > 0) {
      throw new Error("This brand still has models or vehicles. Reassign them first.");
    }
    await db.delete(brands).where(eq(brands.id, id));
  },

  async createModel(input: {
    id: string;
    brandId: string;
    name: string;
    slug: string;
  }) {
    const db = getDb();
    const [{ n }] = await db
      .select({ n: count() })
      .from(vehicleModels)
      .where(eq(vehicleModels.brandId, input.brandId));
    await db.insert(vehicleModels).values({
      ...input,
      isActive: true,
      sortOrder: Number(n),
    });
  },

  async updateModel(
    id: string,
    input: { brandId: string; name: string; slug: string },
  ) {
    const db = getDb();
    await db.update(vehicleModels).set(input).where(eq(vehicleModels.id, id));
  },

  async deleteModel(id: string) {
    const db = getDb();
    const [vehicleCount] = await db
      .select({ n: count() })
      .from(vehicles)
      .where(eq(vehicles.modelId, id));
    if (Number(vehicleCount?.n ?? 0) > 0) {
      throw new Error("This model is used by vehicles. Reassign them first.");
    }
    await db.delete(vehicleModels).where(eq(vehicleModels.id, id));
  },

  async createCategory(input: { id: string; name: string; slug: string }) {
    const db = getDb();
    const [{ n }] = await db.select({ n: count() }).from(categories);
    await db.insert(categories).values({
      ...input,
      isActive: true,
      sortOrder: Number(n),
    });
  },

  async updateCategory(id: string, input: { name: string; slug: string }) {
    const db = getDb();
    await db.update(categories).set(input).where(eq(categories.id, id));
  },

  async deleteCategory(id: string) {
    const db = getDb();
    const [vehicleCount] = await db
      .select({ n: count() })
      .from(vehicles)
      .where(eq(vehicles.categoryId, id));
    if (Number(vehicleCount?.n ?? 0) > 0) {
      throw new Error("This category is used by vehicles. Reassign them first.");
    }
    await db.delete(categories).where(eq(categories.id, id));
  },
};
