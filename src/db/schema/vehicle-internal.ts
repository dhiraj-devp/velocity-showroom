import {
  boolean,
  date,
  int,
  mysqlTable,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { vehicles } from "./vehicles";

/**
 * Dealer-only stock record. Never join this table in public catalog queries.
 */
export const vehicleInternal = mysqlTable("vehicle_internal", {
  vehicleId: varchar("vehicle_id", { length: 64 })
    .primaryKey()
    .references(() => vehicles.id),
  registrationNumber: varchar("registration_number", { length: 32 }),
  vinOrChassisNumber: varchar("vin_or_chassis_number", { length: 64 }),
  ownershipCount: smallint("ownership_count", { unsigned: true }),
  serviceHistoryAvailable: boolean("service_history_available").notNull().default(false),
  insuranceExpiry: date("insurance_expiry"),
  numberOfKeys: smallint("number_of_keys", { unsigned: true }),
  purchasePrice: int("purchase_price", { unsigned: true }),
  purchaseSource: varchar("purchase_source", { length: 160 }),
  internalNotes: text("internal_notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
