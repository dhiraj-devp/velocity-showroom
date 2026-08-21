import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { vehicleInternal } from "@/db/schema/vehicle-internal";
import type { VehicleInternal, VehicleInternalWriteInput } from "@/features/vehicles/lib/internal";

type InternalRow = typeof vehicleInternal.$inferSelect;

function parseIsoDate(value?: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateInput(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return undefined;
}

function mapInternal(row: InternalRow): VehicleInternal {
  return {
    vehicleId: row.vehicleId,
    registrationNumber: row.registrationNumber ?? undefined,
    vinOrChassisNumber: row.vinOrChassisNumber ?? undefined,
    ownershipCount: row.ownershipCount ?? undefined,
    serviceHistoryAvailable: Boolean(row.serviceHistoryAvailable),
    insuranceExpiry: toDateInput(row.insuranceExpiry),
    numberOfKeys: row.numberOfKeys ?? undefined,
    purchasePrice: row.purchasePrice ?? undefined,
    purchaseSource: row.purchaseSource ?? undefined,
    internalNotes: row.internalNotes ?? undefined,
  };
}

export const mysqlInternalRepository = {
  async getByVehicleId(vehicleId: string): Promise<VehicleInternal | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(vehicleInternal)
      .where(eq(vehicleInternal.vehicleId, vehicleId))
      .limit(1);
    return row ? mapInternal(row) : null;
  },

  async upsert(vehicleId: string, input: VehicleInternalWriteInput) {
    const db = getDb();
    const values = {
      vehicleId,
      registrationNumber: input.registrationNumber?.trim() || null,
      vinOrChassisNumber: input.vinOrChassisNumber?.trim() || null,
      ownershipCount: input.ownershipCount ?? null,
      serviceHistoryAvailable: input.serviceHistoryAvailable,
      insuranceExpiry: parseIsoDate(input.insuranceExpiry),
      numberOfKeys: input.numberOfKeys ?? null,
      purchasePrice: input.purchasePrice ?? null,
      purchaseSource: input.purchaseSource?.trim() || null,
      internalNotes: input.internalNotes?.trim() || null,
    };
    const existing = await this.getByVehicleId(vehicleId);
    if (existing) {
      await db.update(vehicleInternal).set(values).where(eq(vehicleInternal.vehicleId, vehicleId));
      return;
    }
    await db.insert(vehicleInternal).values(values);
  },

  async deleteForVehicle(vehicleId: string) {
    const db = getDb();
    await db.delete(vehicleInternal).where(eq(vehicleInternal.vehicleId, vehicleId));
  },
};
