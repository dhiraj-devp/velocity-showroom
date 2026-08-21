import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { brands } from "./brands";
import { categories } from "./categories";
import { vehicleModels } from "./vehicle-models";

export const vehicles = mysqlTable(
  "vehicles",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    brandId: varchar("brand_id", { length: 64 })
      .notNull()
      .references(() => brands.id),
    modelId: varchar("model_id", { length: 64 }).references(() => vehicleModels.id),
    categoryId: varchar("category_id", { length: 64 })
      .notNull()
      .references(() => categories.id),
    title: varchar("title", { length: 160 }).notNull(),
    year: smallint("year", { unsigned: true }).notNull(),
    price: int("price", { unsigned: true }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("INR"),
    mileage: int("mileage", { unsigned: true }),
    fuelType: mysqlEnum("fuel_type", ["petrol", "diesel", "electric", "hybrid"]),
    transmission: mysqlEnum("transmission", ["automatic", "manual"]),
    condition: mysqlEnum("condition", ["new", "used"]).notNull(),
    availability: mysqlEnum("availability", [
      "available",
      "reserved",
      "sold",
      "coming_soon",
    ])
      .notNull()
      .default("available"),
    description: text("description"),
    location: varchar("location", { length: 128 }),
    isFeatured: boolean("is_featured").notNull().default(false),
    hasGallery: boolean("has_gallery").notNull().default(false),
    has360View: boolean("has_360_view").notNull().default(false),
    has3DExperience: boolean("has_3d_experience").notNull().default(false),
    primaryImage: varchar("primary_image", { length: 512 }),
    model3dUrl: varchar("model_3d_url", { length: 512 }),
    seoTitle: varchar("seo_title", { length: 180 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("vehicles_slug_uidx").on(table.slug),
    index("vehicles_brand_idx").on(table.brandId),
    index("vehicles_model_idx").on(table.modelId),
    index("vehicles_category_idx").on(table.categoryId),
    index("vehicles_availability_idx").on(table.availability),
    index("vehicles_featured_idx").on(table.isFeatured),
    index("vehicles_price_idx").on(table.price),
    index("vehicles_year_idx").on(table.year),
    index("vehicles_created_idx").on(table.createdAt),
  ],
);
