import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const dealershipSettings = mysqlTable("dealership_settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  legalName: varchar("legal_name", { length: 180 }),
  phone: varchar("phone", { length: 32 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 32 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 80 }),
  country: varchar("country", { length: 80 }),
  currency: varchar("currency", { length: 8 }).notNull().default("INR"),
  primaryContactName: varchar("primary_contact_name", { length: 120 }),
  openingHours: varchar("opening_hours", { length: 160 }),
  mapsUrl: varchar("maps_url", { length: 512 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
