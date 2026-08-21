import {
  boolean,
  index,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const brands = mysqlTable(
  "brands",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    logoUrl: varchar("logo_url", { length: 512 }),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("brands_slug_uidx").on(table.slug),
    index("brands_active_idx").on(table.isActive),
  ],
);
