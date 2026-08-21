"use server";

import { requireAdmin, unauthorizedResult } from "@/features/admin/lib/requireAdmin";
import { revalidateAdmin, revalidatePublicCatalog } from "@/features/admin/lib/revalidate";
import { parseDealValue } from "@/features/leads/lib/dealValue";
import { parseFollowUpInput } from "@/features/leads/lib/followUp";
import { reservationRepository } from "@/features/reservations/repository/reservationRepository";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import type { AdminResult } from "@/features/admin/actions/vehicles";

function readId(value: FormDataEntryValue | null) {
  const id = String(value ?? "").trim();
  if (!id || id.length > 64) return "";
  return id;
}

export async function createReservationAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = readId(formData.get("vehicleId"));
  const leadId = readId(formData.get("leadId")) || undefined;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000);
  const amount = parseDealValue(formData.get("reservationAmount"));
  const date = String(formData.get("expiresDate") ?? "").trim();
  const time = String(formData.get("expiresTime") ?? "").trim() || "18:00";
  if (!vehicleId) return { ok: false, error: "Choose a vehicle." };
  if (amount.kind === "invalid") {
    return { ok: false, error: "Reservation amount must be a positive whole number in INR." };
  }
  const expiresAt = date ? parseFollowUpInput(date, time) : null;
  if (date && !expiresAt) {
    return { ok: false, error: "Choose a valid expiry date and time." };
  }
  try {
    const vehicle = await vehicleRepository.getVehicleById(vehicleId);
    if (!vehicle) return { ok: false, error: "Vehicle not found." };
    await reservationRepository.create({
      vehicleId,
      leadId,
      reservationAmount: amount.kind === "value" ? amount.value : undefined,
      expiresAt,
      notes: notes || undefined,
      createdBy: session.email,
    });
    revalidateAdmin();
    revalidatePublicCatalog(vehicle.vehicle.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to create reservation." };
  }
}

export async function cancelReservationAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  if (!id) return { ok: false, error: "Reservation is required." };
  try {
    const existing = await reservationRepository.getById(id);
    if (!existing) return { ok: false, error: "Reservation not found." };
    await reservationRepository.cancel(id);
    revalidateAdmin();
    revalidatePublicCatalog(existing.vehicleSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to cancel reservation." };
  }
}

export async function completeReservationSaleAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  if (!id) return { ok: false, error: "Reservation is required." };
  try {
    const existing = await reservationRepository.getById(id);
    if (!existing) return { ok: false, error: "Reservation not found." };
    await reservationRepository.completeSale(id, session.email);
    revalidateAdmin();
    revalidatePublicCatalog(existing.vehicleSlug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to complete the sale." };
  }
}
