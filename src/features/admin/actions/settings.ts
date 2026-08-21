"use server";

import { requireAdmin, unauthorizedResult } from "@/features/admin/lib/requireAdmin";
import { revalidateAdmin, revalidatePublicCatalog } from "@/features/admin/lib/revalidate";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";
import type { Dealership } from "@/features/dealership/types";
import type { AdminResult } from "@/features/admin/actions/vehicles";

export async function updateDealershipAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const current = await dealershipRepository.get();
  const next: Dealership = {
    ...current,
    name: String(formData.get("name") ?? "").trim() || current.name,
    legalName: String(formData.get("legalName") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    primaryContactName: String(formData.get("primaryContactName") ?? "").trim() || undefined,
    openingHours: String(formData.get("openingHours") ?? "").trim() || undefined,
    mapsUrl: String(formData.get("mapsUrl") ?? "").trim() || undefined,
  };
  if (!next.phone || !next.whatsapp || !next.email) {
    return { ok: false, error: "Phone, WhatsApp, and email are required." };
  }
  try {
    await dealershipRepository.update(next);
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to save settings." };
  }
}
