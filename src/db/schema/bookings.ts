import {
  date,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { leads } from "./leads";
import { vehicles } from "./vehicles";

export const bookings = mysqlTable(
  "bookings",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    vehicleId: varchar("vehicle_id", { length: 64 })
      .notNull()
      .references(() => vehicles.id),
    leadId: varchar("lead_id", { length: 64 }).references(() => leads.id),
    name: varchar("name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 160 }),
    bookingType: mysqlEnum("booking_type", ["viewing", "test_drive"]).notNull(),
    bookingDate: date("booking_date", { mode: "string" }).notNull(),
    bookingTime: varchar("booking_time", { length: 8 }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ])
      .notNull()
      .default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("bookings_vehicle_idx").on(table.vehicleId),
    index("bookings_lead_idx").on(table.leadId),
    index("bookings_date_idx").on(table.bookingDate),
    index("bookings_status_idx").on(table.status),
    index("bookings_created_idx").on(table.createdAt),
  ],
);
