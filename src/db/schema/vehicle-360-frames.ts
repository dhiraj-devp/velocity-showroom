import {
  index,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { vehicles } from "./vehicles";

export const vehicle360Frames = mysqlTable(
  "vehicle_360_frames",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    vehicleId: varchar("vehicle_id", { length: 64 })
      .notNull()
      .references(() => vehicles.id),
    url: varchar("url", { length: 512 }).notNull(),
    alt: varchar("alt", { length: 255 }),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("vehicle_360_frames_vehicle_idx").on(table.vehicleId),
    index("vehicle_360_frames_order_idx").on(table.vehicleId, table.sortOrder),
  ],
);
