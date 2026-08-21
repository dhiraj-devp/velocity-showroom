import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dealershipSettings } from "@/db/schema/dealership";
import { mapDealership } from "@/db/mapToDomain";
import type { Dealership } from "@/features/dealership/types";

export const mysqlDealershipRepository = {
  async get(): Promise<Dealership> {
    const db = getDb();
    const rows = await db.select().from(dealershipSettings).limit(1);
    const row = rows[0];
    if (!row) {
      throw new Error("No dealership settings found. Run npm run db:seed.");
    }
    return mapDealership(row);
  },

  async update(input: Dealership): Promise<void> {
    const db = getDb();
    await db
      .update(dealershipSettings)
      .set({
        name: input.name,
        legalName: input.legalName ?? null,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        address: input.address,
        city: input.city,
        country: input.country,
        currency: input.currency,
        primaryContactName: input.primaryContactName ?? null,
        openingHours: input.openingHours ?? null,
        mapsUrl: input.mapsUrl ?? null,
      })
      .where(eq(dealershipSettings.id, input.id));
  },
};
