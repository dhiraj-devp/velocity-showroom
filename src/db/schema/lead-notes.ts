import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { leads } from "./leads";

export const leadNotes = mysqlTable(
  "lead_notes",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    leadId: varchar("lead_id", { length: 64 })
      .notNull()
      .references(() => leads.id),
    body: text("body").notNull(),
    createdBy: varchar("created_by", { length: 160 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("lead_notes_lead_idx").on(table.leadId),
    index("lead_notes_created_idx").on(table.createdAt),
  ],
);
