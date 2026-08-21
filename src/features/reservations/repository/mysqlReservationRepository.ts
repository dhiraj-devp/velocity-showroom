import { and, count, desc, eq, gte, isNotNull, lt, lte, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema/leads";
import { vehicleReservations } from "@/db/schema/vehicle-reservations";
import { vehicles } from "@/db/schema/vehicles";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import type {
  CreateReservationInput,
  ReservationCounts,
  VehicleReservation,
} from "@/features/reservations/types";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

const EXPIRING_SOON_MS = 48 * 60 * 60 * 1000;

type ReservationRow = typeof vehicleReservations.$inferSelect;

function mapReservation(
  row: ReservationRow,
  vehicle?: { title: string | null; slug: string | null },
  leadName?: string | null,
): VehicleReservation {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    vehicleName: vehicle?.title ?? "",
    vehicleSlug: vehicle?.slug ?? "",
    leadId: row.leadId ?? undefined,
    leadName: leadName ?? undefined,
    reservationAmount: row.reservationAmount ?? undefined,
    status: row.status,
    expiresAt: row.expiresAt?.toISOString(),
    notes: row.notes ?? undefined,
    createdBy: row.createdBy ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

async function expireOverdue() {
  const db = getDb();
  const now = new Date();
  const overdue = await db
    .select({
      id: vehicleReservations.id,
      vehicleId: vehicleReservations.vehicleId,
      leadId: vehicleReservations.leadId,
    })
    .from(vehicleReservations)
    .where(
      and(
        eq(vehicleReservations.status, "active"),
        isNotNull(vehicleReservations.expiresAt),
        lt(vehicleReservations.expiresAt, now),
      ),
    );
  for (const row of overdue) {
    await db
      .update(vehicleReservations)
      .set({ status: "expired" })
      .where(eq(vehicleReservations.id, row.id));
    const [stillActive] = await db
      .select({ n: count() })
      .from(vehicleReservations)
      .where(
        and(eq(vehicleReservations.vehicleId, row.vehicleId), eq(vehicleReservations.status, "active")),
      );
    if (Number(stillActive?.n ?? 0) === 0) {
      await vehicleRepository.setAvailability(row.vehicleId, "available");
    }
    if (row.leadId) {
      await leadRepository.addActivity({
        leadId: row.leadId,
        type: "reservation_expired",
        title: "Vehicle reservation expired",
        metadata: { reservationId: row.id, vehicleId: row.vehicleId },
      });
    }
  }
}

async function loadBy(where: SQL | undefined) {
  const db = getDb();
  const [row] = await db
    .select({
      reservation: vehicleReservations,
      vehicleTitle: vehicles.title,
      vehicleSlug: vehicles.slug,
      leadName: leads.name,
    })
    .from(vehicleReservations)
    .leftJoin(vehicles, eq(vehicleReservations.vehicleId, vehicles.id))
    .leftJoin(leads, eq(vehicleReservations.leadId, leads.id))
    .where(where)
    .orderBy(desc(vehicleReservations.createdAt))
    .limit(1);
  if (!row) return null;
  return mapReservation(row.reservation, { title: row.vehicleTitle, slug: row.vehicleSlug }, row.leadName);
}

export const mysqlReservationRepository = {
  async getById(id: string): Promise<VehicleReservation | null> {
    await expireOverdue();
    return loadBy(eq(vehicleReservations.id, id));
  },

  async getActiveByVehicle(vehicleId: string): Promise<VehicleReservation | null> {
    await expireOverdue();
    return loadBy(
      and(eq(vehicleReservations.vehicleId, vehicleId), eq(vehicleReservations.status, "active")),
    );
  },

  async getActiveByLead(leadId: string): Promise<VehicleReservation | null> {
    await expireOverdue();
    return loadBy(and(eq(vehicleReservations.leadId, leadId), eq(vehicleReservations.status, "active")));
  },

  async counts(): Promise<ReservationCounts> {
    await expireOverdue();
    const db = getDb();
    const soon = new Date(Date.now() + EXPIRING_SOON_MS);
    const now = new Date();
    const [activeRow, soonRow] = await Promise.all([
      db
        .select({ n: count() })
        .from(vehicleReservations)
        .where(eq(vehicleReservations.status, "active")),
      db
        .select({ n: count() })
        .from(vehicleReservations)
        .where(
          and(
            eq(vehicleReservations.status, "active"),
            isNotNull(vehicleReservations.expiresAt),
            gte(vehicleReservations.expiresAt, now),
            lte(vehicleReservations.expiresAt, soon),
          ),
        ),
    ]);
    return {
      active: Number(activeRow[0]?.n ?? 0),
      expiringSoon: Number(soonRow[0]?.n ?? 0),
    };
  },

  async create(input: CreateReservationInput): Promise<VehicleReservation> {
    await expireOverdue();
    const existing = await this.getActiveByVehicle(input.vehicleId);
    if (existing) {
      throw new Error("This vehicle already has an active reservation.");
    }
    const vehicle = await vehicleRepository.getVehicleById(input.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found.");
    if (vehicle.vehicle.availability !== "available") {
      throw new Error("Only an available vehicle can be reserved.");
    }
    if (input.leadId) {
      const lead = await leadRepository.getById(input.leadId);
      if (!lead) throw new Error("Lead not found.");
      if (lead.vehicleId && lead.vehicleId !== input.vehicleId) {
        throw new Error("This lead is linked to a different vehicle.");
      }
    }
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(vehicleReservations).values({
      id,
      vehicleId: input.vehicleId,
      leadId: input.leadId || null,
      reservationAmount: input.reservationAmount ?? null,
      status: "active",
      expiresAt: input.expiresAt ?? null,
      notes: input.notes?.trim() || null,
      createdBy: input.createdBy ?? null,
    });
    await vehicleRepository.setAvailability(input.vehicleId, "reserved");
    if (input.leadId) {
      await leadRepository.addActivity({
        leadId: input.leadId,
        type: "reservation_created",
        title: "Vehicle reserved",
        metadata: {
          reservationId: id,
          vehicleId: input.vehicleId,
          ...(input.reservationAmount ? { amount: String(input.reservationAmount) } : {}),
        },
      });
    }
    return (await this.getById(id))!;
  },

  async cancel(id: string) {
    await expireOverdue();
    const existing = await this.getById(id);
    if (!existing) throw new Error("Reservation not found.");
    if (existing.status !== "active") {
      throw new Error("Only an active reservation can be cancelled.");
    }
    const db = getDb();
    await db.update(vehicleReservations).set({ status: "cancelled" }).where(eq(vehicleReservations.id, id));
    await vehicleRepository.setAvailability(existing.vehicleId, "available");
    if (existing.leadId) {
      await leadRepository.addActivity({
        leadId: existing.leadId,
        type: "reservation_cancelled",
        title: "Vehicle reservation cancelled",
        metadata: { reservationId: id, vehicleId: existing.vehicleId },
      });
    }
  },

  async completeSale(id: string, actor?: string) {
    await expireOverdue();
    const existing = await this.getById(id);
    if (!existing) throw new Error("Reservation not found.");
    if (existing.status !== "active") {
      throw new Error("Only an active reservation can be completed.");
    }
    const db = getDb();
    await db.update(vehicleReservations).set({ status: "completed" }).where(eq(vehicleReservations.id, id));
    await vehicleRepository.setAvailability(existing.vehicleId, "sold");
    if (existing.leadId) {
      await leadRepository.addActivity({
        leadId: existing.leadId,
        type: "reservation_completed",
        title: "Reservation completed — vehicle marked sold",
        metadata: { reservationId: id, vehicleId: existing.vehicleId },
      });
      await leadRepository.updateStatus(existing.leadId, "won", { actor });
    }
  },
};
