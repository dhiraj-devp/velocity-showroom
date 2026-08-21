import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { brands as brandRows } from "../features/vehicles/data/brands";
import { categories as categoryRows } from "../features/vehicles/data/categories";
import { models as modelRows } from "../features/vehicles/data/models";
import { vehicles as vehicleRows } from "../features/vehicles/data/vehicles";
import { dealership } from "../features/dealership/data/dealership";
import { brands } from "./schema/brands";
import { bookings } from "./schema/bookings";
import { categories } from "./schema/categories";
import { dealershipSettings } from "./schema/dealership";
import { leads } from "./schema/leads";
import { vehicleImages } from "./schema/vehicle-images";
import { vehicleModels } from "./schema/vehicle-models";
import { vehicles } from "./schema/vehicles";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  try {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional when DATABASE_URL is already in the environment.
  }
}

async function seed() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to seed. Copy .env.example to .env.");
  }

  const pool = mysql.createPool({ uri: url });
  const db = drizzle(pool);

  try {
    for (const [index, brand] of brandRows.entries()) {
      await db
        .insert(brands)
        .values({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logo ?? null,
          isActive: true,
          sortOrder: index,
        })
        .onDuplicateKeyUpdate({
          set: {
            name: brand.name,
            slug: brand.slug,
            logoUrl: brand.logo ?? null,
            isActive: true,
            sortOrder: index,
          },
        });
    }

    for (const [index, category] of categoryRows.entries()) {
      await db
        .insert(categories)
        .values({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: null,
          isActive: true,
          sortOrder: index,
        })
        .onDuplicateKeyUpdate({
          set: {
            name: category.name,
            slug: category.slug,
            isActive: true,
            sortOrder: index,
          },
        });
    }

    for (const [index, model] of modelRows.entries()) {
      await db
        .insert(vehicleModels)
        .values({
          id: model.id,
          brandId: model.brandId,
          name: model.name,
          slug: model.slug,
          isActive: true,
          sortOrder: index,
        })
        .onDuplicateKeyUpdate({
          set: {
            brandId: model.brandId,
            name: model.name,
            slug: model.slug,
            isActive: true,
            sortOrder: index,
          },
        });
    }

    for (const vehicle of vehicleRows) {
      const primary = vehicle.images[0];
      await db
        .insert(vehicles)
        .values({
          id: vehicle.id,
          slug: vehicle.slug,
          brandId: vehicle.brandId,
          modelId: vehicle.modelId,
          categoryId: vehicle.categoryId,
          title: vehicle.name,
          year: vehicle.year,
          price: vehicle.price,
          currency: vehicle.currency,
          mileage: vehicle.mileageKm ?? null,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          condition: vehicle.condition,
          availability: vehicle.availability,
          description: vehicle.description,
          location: vehicle.location ?? null,
          isFeatured: vehicle.isFeatured,
          hasGallery: vehicle.hasGallery,
          has360View: vehicle.has360View,
          has3DExperience: vehicle.has3DExperience,
          primaryImage: primary?.src ?? null,
          model3dUrl: vehicle.optional3DModelUrl ?? null,
          seoTitle: null,
          seoDescription: null,
        })
        .onDuplicateKeyUpdate({
          set: {
            slug: vehicle.slug,
            brandId: vehicle.brandId,
            modelId: vehicle.modelId,
            categoryId: vehicle.categoryId,
            title: vehicle.name,
            year: vehicle.year,
            price: vehicle.price,
            currency: vehicle.currency,
            mileage: vehicle.mileageKm ?? null,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            condition: vehicle.condition,
            availability: vehicle.availability,
            description: vehicle.description,
            location: vehicle.location ?? null,
            isFeatured: vehicle.isFeatured,
            hasGallery: vehicle.hasGallery,
            has3DExperience: vehicle.has3DExperience,
            primaryImage: primary?.src ?? null,
            model3dUrl: vehicle.optional3DModelUrl ?? null,
          },
        });

      for (const [index, image] of vehicle.images.entries()) {
        await db
          .insert(vehicleImages)
          .values({
            id: image.id,
            vehicleId: vehicle.id,
            url: image.src,
            alt: image.alt,
            sortOrder: index,
            isPrimary: image.role === "hero" || index === 0,
          })
          .onDuplicateKeyUpdate({
            set: {
              vehicleId: vehicle.id,
              url: image.src,
              alt: image.alt,
              sortOrder: index,
              isPrimary: image.role === "hero" || index === 0,
            },
          });
      }
    }

    await db
      .insert(dealershipSettings)
      .values({
        id: dealership.id,
        name: dealership.name,
        legalName: dealership.legalName ?? null,
        phone: dealership.phone,
        whatsapp: dealership.whatsapp,
        email: dealership.email,
        address: dealership.address,
        city: dealership.city,
        country: dealership.country,
        currency: dealership.currency,
        primaryContactName: dealership.primaryContactName ?? null,
        openingHours: dealership.openingHours ?? null,
        mapsUrl: dealership.mapsUrl ?? null,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: dealership.name,
          legalName: dealership.legalName ?? null,
          phone: dealership.phone,
          whatsapp: dealership.whatsapp,
          email: dealership.email,
          address: dealership.address,
          city: dealership.city,
          country: dealership.country,
          currency: dealership.currency,
          primaryContactName: dealership.primaryContactName ?? null,
          openingHours: dealership.openingHours ?? null,
          mapsUrl: dealership.mapsUrl ?? null,
        },
      });

    const brandCount = (await db.select({ id: brands.id }).from(brands)).length;
    const modelCount = (await db.select({ id: vehicleModels.id }).from(vehicleModels)).length;
    const categoryCount = (await db.select({ id: categories.id }).from(categories)).length;
    const vehCount = (await db.select({ id: vehicles.id }).from(vehicles)).length;
    const imageCount = (await db.select({ id: vehicleImages.id }).from(vehicleImages)).length;
    const leadCount = (await db.select({ id: leads.id }).from(leads)).length;
    const bookingCount = (await db.select({ id: bookings.id }).from(bookings)).length;

    console.log("Seed complete.");
    console.log(`  brands: ${brandCount}`);
    console.log(`  models: ${modelCount}`);
    console.log(`  categories: ${categoryCount}`);
    console.log(`  vehicles: ${vehCount}`);
    console.log(`  images: ${imageCount}`);
    console.log(`  leads: ${leadCount}`);
    console.log(`  bookings: ${bookingCount}`);
  } finally {
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
