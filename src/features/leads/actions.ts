"use server";

import { isDatabaseConfigured } from "@/db";
import { bookingRepository } from "@/features/bookings/repository/bookingRepository";
import type { CreateBookingInput } from "@/features/bookings/types";
import { sanitizeSourceDetail } from "@/features/leads/lib/source";
import { sanitizeUtm } from "@/features/leads/lib/utm";
import {
  validateBookingFields,
  validateContactFields,
} from "@/features/leads/lib/validateLead";
import { ensureVisitorKey } from "@/features/leads/lib/visitorCookie";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import type { CreateLeadInput } from "@/features/leads/types";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export type MutationResult =
  | { ok: true; persisted: "mysql" | "local" }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function trustedVehicle(vehicleId: string, slug?: string) {
  const id = vehicleId.trim();
  if (!id || id.length > 64) return null;
  if (isDatabaseConfigured()) {
    return vehicleRepository.getVehicleById(id);
  }
  if (slug) return vehicleRepository.getVehicleBySlug(slug.trim());
  const catalog = await vehicleRepository.getCatalog();
  const vehicle = catalog.vehicles.find((item) => item.id === id);
  return vehicle ? vehicleRepository.getVehicleBySlug(vehicle.slug) : null;
}

export async function submitEnquiry(input: CreateLeadInput): Promise<MutationResult> {
  const fieldErrors = validateContactFields({
    name: input.name ?? "",
    phone: input.phone ?? "",
    email: input.email ?? "",
  });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }

  const record = await trustedVehicle(input.vehicleId, input.vehicleSlug);
  if (!record) {
    return { ok: false, error: "This vehicle is no longer available." };
  }

  try {
    const visitorKey = await ensureVisitorKey();
    await leadRepository.create({
      ...input,
      vehicleId: record.vehicle.id,
      vehicleName: `${record.brand.name} ${record.vehicle.name}`,
      vehicleSlug: record.vehicle.slug,
      pagePath: `/cars/${record.vehicle.slug}`,
      source: "website",
      sourceDetail: sanitizeSourceDetail(input.sourceDetail),
      utmSource: sanitizeUtm(input.utmSource),
      utmMedium: sanitizeUtm(input.utmMedium),
      utmCampaign: sanitizeUtm(input.utmCampaign),
      visitorKey,
    });
    return {
      ok: true,
      persisted: isDatabaseConfigured() ? "mysql" : "local",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to record this enquiry.";
    return { ok: false, error: message };
  }
}

export async function submitBooking(
  input: CreateBookingInput,
): Promise<MutationResult> {
  const fieldErrors = validateBookingFields({
    name: input.name,
    phone: input.phone,
    email: input.email ?? "",
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
  });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }

  const record = await trustedVehicle(input.vehicleId, input.vehicleSlug);
  if (!record) {
    return { ok: false, error: "This vehicle is no longer available." };
  }

  try {
    const visitorKey = await ensureVisitorKey();
    const vehicleName = `${record.brand.name} ${record.vehicle.name}`;
    let leadId: string | undefined;
    if (isDatabaseConfigured()) {
      const lead = await leadRepository.resolveForBooking({
        vehicleId: record.vehicle.id,
        vehicleName,
        vehicleSlug: record.vehicle.slug,
        name: input.name,
        phone: input.phone,
        email: input.email,
        visitorKey,
      });
      leadId = lead.id;
    }
    const booking = await bookingRepository.create({
      ...input,
      vehicleId: record.vehicle.id,
      vehicleName,
      vehicleSlug: record.vehicle.slug,
      leadId,
    });
    if (leadId) {
      await leadRepository.addActivity({
        leadId,
        type: "viewing_requested",
        title: "Viewing requested",
        metadata: {
          bookingId: booking.id,
          date: input.preferredDate,
          time: input.preferredTime,
        },
      });
    }
    return {
      ok: true,
      persisted: isDatabaseConfigured() ? "mysql" : "local",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to record this viewing request.";
    return { ok: false, error: message };
  }
}
