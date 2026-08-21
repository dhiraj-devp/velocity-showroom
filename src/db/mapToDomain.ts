import type { Dealership } from "@/features/dealership/types";
import type { CreateBookingInput, ViewingBooking } from "@/features/bookings/types";
import type { CreateLeadInput, Lead, LeadActivity, LeadNote, LeadStatus } from "@/features/leads/types";
import { parseActivityMetadata } from "@/features/leads/lib/activity";
import { normalizeLeadSource, sanitizeSourceDetail } from "@/features/leads/lib/source";
import { isVisitorKey } from "@/features/leads/lib/visitor";
import { sanitizeUtm } from "@/features/leads/lib/utm";
import type {
  Brand,
  Category,
  CurrencyCode,
  FuelType,
  Model,
  Transmission,
  Vehicle,
  Vehicle360Frame,
  VehicleAvailability,
  VehicleCondition,
  VehicleImage,
} from "@/features/vehicles/types";
import type { InferSelectModel } from "drizzle-orm";
import type { brands } from "@/db/schema/brands";
import type { bookings } from "@/db/schema/bookings";
import type { categories } from "@/db/schema/categories";
import type { dealershipSettings } from "@/db/schema/dealership";
import type { leadActivities } from "@/db/schema/lead-activities";
import type { leadNotes } from "@/db/schema/lead-notes";
import type { leads } from "@/db/schema/leads";
import type { vehicle360Frames } from "@/db/schema/vehicle-360-frames";
import type { vehicleImages } from "@/db/schema/vehicle-images";
import type { vehicleModels } from "@/db/schema/vehicle-models";
import type { vehicles } from "@/db/schema/vehicles";
import { is360ExperienceReady } from "@/features/vehicles/lib/spin";
import {
  compareVehicleImageOrder,
  preferStoredVehicleImages,
} from "@/features/vehicles/lib/vehicleImages";

type BrandRow = InferSelectModel<typeof brands>;
type ModelRow = InferSelectModel<typeof vehicleModels>;
type CategoryRow = InferSelectModel<typeof categories>;
type VehicleRow = InferSelectModel<typeof vehicles>;
type ImageRow = InferSelectModel<typeof vehicleImages>;
type Frame360Row = InferSelectModel<typeof vehicle360Frames>;
type DealershipRow = InferSelectModel<typeof dealershipSettings>;
type LeadRow = InferSelectModel<typeof leads>;
type LeadNoteRow = InferSelectModel<typeof leadNotes>;
type LeadActivityRow = InferSelectModel<typeof leadActivities>;
type BookingRow = InferSelectModel<typeof bookings>;

export function mapBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logoUrl ?? undefined,
  };
}

export function mapModel(row: ModelRow): Model {
  return {
    id: row.id,
    brandId: row.brandId,
    name: row.name,
    slug: row.slug,
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

export function mapImage(row: ImageRow): VehicleImage {
  return {
    id: row.id,
    src: row.url,
    alt: row.alt ?? "",
    width: 1600,
    height: 1000,
    role: row.isPrimary ? "hero" : "gallery",
  };
}

export function map360Frame(row: Frame360Row): Vehicle360Frame {
  return {
    id: row.id,
    src: row.url,
    sortOrder: row.sortOrder,
  };
}

export function mapVehicle(
  row: VehicleRow,
  images: ImageRow[],
  frames: Frame360Row[] = [],
): Vehicle {
  const mappedImages = preferStoredVehicleImages(images)
    .slice()
    .sort(compareVehicleImageOrder)
    .map(mapImage);
  const mappedFrames = [...frames]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
    .map(map360Frame);
  const is360Enabled = Boolean(row.has360View);

  return {
    id: row.id,
    slug: row.slug,
    brandId: row.brandId,
    modelId: row.modelId ?? "",
    categoryId: row.categoryId,
    name: row.title,
    year: row.year,
    price: row.price,
    currency: (row.currency as CurrencyCode) || "INR",
    mileageKm: row.mileage ?? undefined,
    fuelType: (row.fuelType ?? "petrol") as FuelType,
    transmission: (row.transmission ?? "automatic") as Transmission,
    condition: row.condition as VehicleCondition,
    location: row.location ?? undefined,
    description: row.description ?? "",
    images: mappedImages,
    frames: mappedFrames,
    isFeatured: Boolean(row.isFeatured),
    availability: row.availability as VehicleAvailability,
    hasGallery: Boolean(row.hasGallery),
    is360Enabled,
    has360View: is360ExperienceReady(is360Enabled, mappedFrames.length),
    has3DExperience: Boolean(row.has3DExperience),
    optional3DModelUrl: row.model3dUrl ?? undefined,
  };
}

export function mapDealership(row: DealershipRow): Dealership {
  return {
    id: row.id,
    name: row.name,
    legalName: row.legalName ?? undefined,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    address: row.address ?? "",
    city: row.city ?? "",
    country: row.country ?? "",
    currency: (row.currency as CurrencyCode) || "INR",
    primaryContactName: row.primaryContactName ?? undefined,
    openingHours: row.openingHours ?? undefined,
    mapsUrl: row.mapsUrl ?? undefined,
  };
}

export function mapLeadStatus(status: LeadStatus): LeadRow["status"] {
  return status;
}

export function mapLead(
  row: LeadRow,
  vehicle?: { name: string; slug: string; price?: number },
): Lead {
  return {
    id: row.id,
    vehicleId: row.vehicleId ?? "",
    vehicleName: vehicle?.name ?? "",
    vehicleSlug: vehicle?.slug ?? "",
    vehiclePrice: vehicle?.price,
    pagePath: row.pagePath ?? "",
    source: normalizeLeadSource(row.source),
    sourceDetail: row.sourceDetail ?? undefined,
    utmSource: row.utmSource ?? undefined,
    utmMedium: row.utmMedium ?? undefined,
    utmCampaign: row.utmCampaign ?? undefined,
    name: row.name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    nextFollowUpAt: row.nextFollowUpAt?.toISOString(),
    lastContactedAt: row.lastContactedAt?.toISOString(),
    expectedDealValue: row.expectedDealValue ?? undefined,
    finalSaleValue: row.finalSaleValue ?? undefined,
    lostReason: row.lostReason ?? undefined,
    lostReasonDetail: row.lostReasonDetail ?? undefined,
    assignedTo: row.assignedTo ?? undefined,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapBooking(
  row: BookingRow,
  vehicle?: { name: string; slug: string },
): ViewingBooking {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    vehicleName: vehicle?.name ?? "",
    vehicleSlug: vehicle?.slug ?? "",
    leadId: row.leadId ?? undefined,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    preferredDate: row.bookingDate,
    preferredTime: row.bookingTime,
    message: row.notes ?? undefined,
    type: row.bookingType,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapLeadActivity(row: LeadActivityRow): LeadActivity {
  return {
    id: row.id,
    leadId: row.leadId,
    type: row.type,
    title: row.title,
    metadata: parseActivityMetadata(row.metadata),
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapLeadNote(row: LeadNoteRow): LeadNote {
  return {
    id: row.id,
    leadId: row.leadId,
    body: row.body,
    createdBy: row.createdBy ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toCreateLeadValues(input: CreateLeadInput, id: string) {
  return {
    id,
    vehicleId: input.vehicleId || null,
    name: input.name?.trim() || null,
    phone: input.phone?.trim() || null,
    visitorKey: isVisitorKey(input.visitorKey) ? input.visitorKey : null,
    email: input.email?.trim() || null,
    message: input.message?.trim() || null,
    source: normalizeLeadSource(input.source),
    sourceDetail: sanitizeSourceDetail(input.sourceDetail) ?? null,
    utmSource: sanitizeUtm(input.utmSource) ?? null,
    utmMedium: sanitizeUtm(input.utmMedium) ?? null,
    utmCampaign: sanitizeUtm(input.utmCampaign) ?? null,
    pagePath: (input.pagePath ?? "").trim().slice(0, 255) || null,
    status: "new" as const,
    createdBy: input.createdBy?.trim() || null,
    assignedTo: input.assignedTo?.trim() || input.createdBy?.trim() || null,
    updatedBy: input.createdBy?.trim() || null,
  };
}

export function toCreateBookingValues(input: CreateBookingInput, id: string) {
  return {
    id,
    vehicleId: input.vehicleId,
    leadId: input.leadId || null,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    bookingType: input.type,
    bookingDate: input.preferredDate,
    bookingTime: input.preferredTime,
    notes: input.message?.trim() || null,
    status: "pending" as const,
  };
}
