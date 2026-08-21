import {
  boolean,
  index,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { brands } from "./brands";

export const vehicleModels = mysqlTable(
  "vehicle_models",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    brandId: varchar("brand_id", { length: 64 })
      .notNull()
      .references(() => brands.id),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("vehicle_models_brand_slug_uidx").on(table.brandId, table.slug),
    index("vehicle_models_brand_idx").on(table.brandId),
  ],
);
