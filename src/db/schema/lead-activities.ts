import {
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { leads } from "./leads";

export const LEAD_ACTIVITY_TYPES = [
  "lead_created",
  "note_added",
  "whatsapp_clicked",
  "call_clicked",
  "viewing_requested",
  "viewing_confirmed",
  "viewing_completed",
  "viewing_cancelled",
  "status_changed",
  "follow_up_scheduled",
  "follow_up_completed",
  "follow_up_cleared",
  "whatsapp_follow_up_opened",
  "deal_value_updated",
  "lead_assigned",
  "reservation_created",
  "reservation_cancelled",
  "reservation_completed",
  "reservation_expired",
] as const;

export const leadActivities = mysqlTable(
  "lead_activities",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    leadId: varchar("lead_id", { length: 64 })
      .notNull()
      .references(() => leads.id),
    type: mysqlEnum("type", [...LEAD_ACTIVITY_TYPES]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("lead_activities_lead_idx").on(table.leadId),
    index("lead_activities_created_idx").on(table.leadId, table.createdAt),
    index("lead_activities_type_idx").on(table.type),
  ],
);
