"use server";

import { requireAdmin, unauthorizedResult } from "@/features/admin/lib/requireAdmin";
import { revalidateAdmin } from "@/features/admin/lib/revalidate";
import { parseDealValue } from "@/features/leads/lib/dealValue";
import { followUpFromToday, parseFollowUpInput } from "@/features/leads/lib/followUp";
import { isLostReason, sanitizeLostReasonDetail } from "@/features/leads/lib/lostReason";
import { isLeadSource, sanitizeSourceDetail } from "@/features/leads/lib/source";
import { validateContactFields } from "@/features/leads/lib/validateLead";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/types";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import type { AdminResult } from "@/features/admin/actions/vehicles";

function readId(value: FormDataEntryValue | null) {
  const id = String(value ?? "").trim();
  if (!id || id.length > 64) return "";
  return id;
}

export async function updateLeadStatusAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!id || !LEAD_STATUSES.includes(status)) {
    return { ok: false, error: "Choose a valid status." };
  }
  const lostReasonRaw = String(formData.get("lostReason") ?? "").trim();
  const lostReasonDetail = sanitizeLostReasonDetail(String(formData.get("lostReasonDetail") ?? ""));
  const final = parseDealValue(formData.get("finalSaleValue"));
  if (status === "lost" && !isLostReason(lostReasonRaw)) {
    return { ok: false, error: "Choose why this lead was lost." };
  }
  if (final.kind === "invalid") {
    return { ok: false, error: "Final sale value must be a positive whole number in INR." };
  }
  try {
    await leadRepository.updateStatus(id, status, {
      lostReason: status === "lost" && isLostReason(lostReasonRaw) ? lostReasonRaw : null,
      lostReasonDetail: status === "lost" && lostReasonRaw === "other" ? lostReasonDetail ?? null : null,
      actor: session.email,
    });
    if (status === "won" && final.kind === "value") {
      await leadRepository.updateDealValue(id, { finalSaleValue: final.value }, session.email);
    }
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update lead." };
  }
}

export async function addLeadNoteAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const leadId = readId(formData.get("leadId"));
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!leadId || body.length < 2) {
    return { ok: false, error: "Write a short internal note." };
  }
  try {
    await leadRepository.addNote({
      leadId,
      body,
      createdBy: session.email,
    });
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to add note." };
  }
}

export async function updateLeadFollowUpAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const parsed = parseFollowUpInput(date, time);
  if (!id || !parsed) {
    return { ok: false, error: "Choose a valid follow-up date and time." };
  }
  try {
    const existing = await leadRepository.getById(id);
    if (!existing) return { ok: false, error: "Lead not found." };
    await leadRepository.updateFollowUp(id, parsed, session.email);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to set follow-up." };
  }
}

export async function scheduleLeadFollowUpPresetAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  const preset = String(formData.get("preset") ?? "").trim();
  const parsed = preset === "tomorrow" ? followUpFromToday(1) : preset === "next_week" ? followUpFromToday(7) : null;
  if (!id || !parsed) {
    return { ok: false, error: "Choose a valid follow-up preset." };
  }
  try {
    const existing = await leadRepository.getById(id);
    if (!existing) return { ok: false, error: "Lead not found." };
    await leadRepository.updateFollowUp(id, parsed, session.email);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to set follow-up." };
  }
}

export async function clearLeadFollowUpAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  if (!id) return { ok: false, error: "Lead is required." };
  try {
    const existing = await leadRepository.getById(id);
    if (!existing) return { ok: false, error: "Lead not found." };
    await leadRepository.updateFollowUp(id, null, session.email);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to clear follow-up." };
  }
}

export async function markLeadContactedAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  const note = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!id) return { ok: false, error: "Lead is required." };
  try {
    const existing = await leadRepository.getById(id);
    if (!existing) return { ok: false, error: "Lead not found." };
    await leadRepository.markContacted(id, undefined, session.email);
    if (note.length >= 2) {
      await leadRepository.addNote({
        leadId: id,
        body: note,
        createdBy: session.email,
      });
    }
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to mark contacted." };
  }
}

export async function updateLeadSourceAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  const source = String(formData.get("source") ?? "").trim();
  const sourceDetail = sanitizeSourceDetail(String(formData.get("sourceDetail") ?? ""));
  if (!id || !isLeadSource(source)) {
    return { ok: false, error: "Choose a valid source." };
  }
  try {
    const existing = await leadRepository.getById(id);
    if (!existing) return { ok: false, error: "Lead not found." };
    await leadRepository.updateSource(id, source, sourceDetail ?? null, session.email);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update source." };
  }
}

export async function updateLeadDealValueAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  if (!id) return { ok: false, error: "Lead is required." };
  const expected = parseDealValue(formData.get("expectedDealValue"));
  const final = parseDealValue(formData.get("finalSaleValue"));
  if (expected.kind === "invalid") {
    return { ok: false, error: "Expected deal value must be a positive whole number in INR." };
  }
  if (final.kind === "invalid") {
    return { ok: false, error: "Final sale value must be a positive whole number in INR." };
  }
  try {
    const existing = await leadRepository.getById(id);
    if (!existing) return { ok: false, error: "Lead not found." };
    if (existing.status !== "won" && final.kind === "value") {
      return { ok: false, error: "Final sale value can only be recorded on a won lead." };
    }
    await leadRepository.updateDealValue(
      id,
      {
        expectedDealValue: expected.kind === "value" ? expected.value : existing.expectedDealValue ?? null,
        finalSaleValue: final.kind === "value" ? final.value : existing.finalSaleValue ?? null,
      },
      session.email,
    );
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update deal value." };
  }
}

export async function openWhatsAppFollowUpAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = readId(formData.get("id"));
  if (!id) return { ok: false, error: "Lead is required." };
  try {
    const dealership = await dealershipRepository.get();
    const url = await leadRepository.recordWhatsAppFollowUp(id, dealership.name, session.email);
    revalidateAdmin();
    return { ok: true, url };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to open WhatsApp." };
  }
}

export async function createLeadAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();

  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const email = String(formData.get("email") ?? "");
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  const source = String(formData.get("source") ?? "").trim();
  const sourceDetail = sanitizeSourceDetail(String(formData.get("sourceDetail") ?? ""));
  const vehicleId = readId(formData.get("vehicleId"));

  const fieldErrors = validateContactFields({ name, phone, email });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: fieldErrors.name ?? fieldErrors.phone ?? fieldErrors.email ?? "Check the lead details." };
  }
  if (!isLeadSource(source)) {
    return { ok: false, error: "Choose a valid source." };
  }

  let vehicleName = "";
  let vehicleSlug = "";
  if (vehicleId) {
    const record = await vehicleRepository.getVehicleById(vehicleId);
    if (!record) return { ok: false, error: "Choose a valid vehicle." };
    vehicleName = `${record.brand.name} ${record.vehicle.name}`;
    vehicleSlug = record.vehicle.slug;
  }

  try {
    await leadRepository.create({
      vehicleId,
      vehicleName,
      vehicleSlug,
      pagePath: vehicleSlug ? `/cars/${vehicleSlug}` : "/admin/leads",
      source,
      sourceDetail,
      name,
      phone,
      email,
      message: message || undefined,
      createdBy: session.email,
      assignedTo: session.email,
    });
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to record lead." };
  }
}
