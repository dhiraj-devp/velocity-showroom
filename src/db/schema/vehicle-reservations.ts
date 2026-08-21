import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { leads } from "./leads";
import { vehicles } from "./vehicles";

export const RESERVATION_STATUSES = [
  "active",
  "completed",
  "cancelled",
  "expired",
] as const;

export const vehicleReservations = mysqlTable(
  "vehicle_reservations",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    vehicleId: varchar("vehicle_id", { length: 64 })
      .notNull()
      .references(() => vehicles.id),
    leadId: varchar("lead_id", { length: 64 }).references(() => leads.id),
    reservationAmount: int("reservation_amount", { unsigned: true }),
    status: mysqlEnum("status", [...RESERVATION_STATUSES]).notNull().default("active"),
    expiresAt: timestamp("expires_at"),
    notes: text("notes"),
    createdBy: varchar("created_by", { length: 160 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("reservations_vehicle_idx").on(table.vehicleId),
    index("reservations_lead_idx").on(table.leadId),
    index("reservations_status_idx").on(table.status),
    index("reservations_expires_idx").on(table.expiresAt),
  ],
);
