"use server";

import { requireAdmin, unauthorizedResult } from "@/features/admin/lib/requireAdmin";
import { revalidateAdmin } from "@/features/admin/lib/revalidate";
import { parseDealValue } from "@/features/leads/lib/dealValue";
import { vehicleInternalRepository } from "@/features/vehicles/repository/vehicleInternalRepository";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import type { AdminResult } from "@/features/admin/actions/vehicles";

function readId(value: FormDataEntryValue | null) {
  const id = String(value ?? "").trim();
  if (!id || id.length > 64) return "";
  return id;
}

function parseOptionalInt(raw: FormDataEntryValue | null, max: number) {
  const text = String(raw ?? "").trim();
  if (!text) return { kind: "empty" as const };
  if (!/^\d+$/.test(text)) return { kind: "invalid" as const };
  const value = Number(text);
  if (!Number.isInteger(value) || value < 0 || value > max) return { kind: "invalid" as const };
  return { kind: "value" as const, value };
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function updateVehicleInternalAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = readId(formData.get("vehicleId"));
  if (!vehicleId) return { ok: false, error: "Vehicle is required." };

  const purchase = parseDealValue(formData.get("purchasePrice"));
  const ownership = parseOptionalInt(formData.get("ownershipCount"), 99);
  const keys = parseOptionalInt(formData.get("numberOfKeys"), 20);
  const insuranceExpiry = String(formData.get("insuranceExpiry") ?? "").trim();
  if (purchase.kind === "invalid") {
    return { ok: false, error: "Purchase price must be a positive whole number in INR." };
  }
  if (ownership.kind === "invalid") {
    return { ok: false, error: "Ownership count must be a whole number." };
  }
  if (keys.kind === "invalid") {
    return { ok: false, error: "Number of keys must be a whole number." };
  }
  if (insuranceExpiry && !DATE_PATTERN.test(insuranceExpiry)) {
    return { ok: false, error: "Insurance expiry must be a valid date." };
  }

  try {
    const record = await vehicleRepository.getVehicleById(vehicleId);
    if (!record) return { ok: false, error: "Vehicle not found." };
    await vehicleInternalRepository.upsert(vehicleId, {
      registrationNumber: String(formData.get("registrationNumber") ?? "").trim().slice(0, 32) || undefined,
      vinOrChassisNumber: String(formData.get("vinOrChassisNumber") ?? "").trim().slice(0, 64) || undefined,
      ownershipCount: ownership.kind === "value" ? ownership.value : undefined,
      serviceHistoryAvailable: formData.get("serviceHistoryAvailable") === "on",
      insuranceExpiry: insuranceExpiry || undefined,
      numberOfKeys: keys.kind === "value" ? keys.value : undefined,
      purchasePrice: purchase.kind === "value" ? purchase.value : undefined,
      purchaseSource: String(formData.get("purchaseSource") ?? "").trim().slice(0, 160) || undefined,
      internalNotes: String(formData.get("internalNotes") ?? "").trim().slice(0, 4000) || undefined,
    });
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to save internal details." };
  }
}
