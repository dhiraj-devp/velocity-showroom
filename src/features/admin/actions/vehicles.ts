"use server";

import { redirect } from "next/navigation";
import { requireAdmin, unauthorizedResult } from "@/features/admin/lib/requireAdmin";
import { revalidateAdmin, revalidatePublicCatalog } from "@/features/admin/lib/revalidate";
import { currentYear, isValidSlug, slugify } from "@/features/admin/lib/slug";
import { mediaStorage } from "@/features/media/storage";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import type {
  FuelType,
  Transmission,
  VehicleAvailability,
  VehicleCondition,
  VehicleWriteInput,
} from "@/features/vehicles/types";

export type AdminResult =
  | { ok: true; id?: string; url?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const AVAILABILITY: VehicleAvailability[] = [
  "available",
  "reserved",
  "sold",
  "coming_soon",
];
const FUELS: FuelType[] = ["petrol", "diesel", "electric", "hybrid"];
const GEARS: Transmission[] = ["automatic", "manual"];
const CONDITIONS: VehicleCondition[] = ["new", "used"];

function parseVehicle(formData: FormData): { input?: VehicleWriteInput; fieldErrors?: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? name));
  const brandId = String(formData.get("brandId") ?? "");
  const modelId = String(formData.get("modelId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const year = Number(formData.get("year"));
  const price = Number(formData.get("price"));
  const mileageRaw = String(formData.get("mileageKm") ?? "").trim();
  const fuelType = String(formData.get("fuelType") ?? "") as FuelType;
  const transmission = String(formData.get("transmission") ?? "") as Transmission;
  const condition = String(formData.get("condition") ?? "") as VehicleCondition;
  const availability = String(formData.get("availability") ?? "") as VehicleAvailability;
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const model3d = String(formData.get("optional3DModelUrl") ?? "").trim();

  if (name.length < 2) fieldErrors.name = "Enter a vehicle name.";
  if (!isValidSlug(slug)) fieldErrors.slug = "Use a lowercase slug with hyphens.";
  if (!brandId) fieldErrors.brandId = "Select a brand.";
  if (!modelId) fieldErrors.modelId = "Select a model.";
  if (!categoryId) fieldErrors.categoryId = "Select a category.";
  if (!Number.isInteger(year) || year < 1990 || year > currentYear() + 2) {
    fieldErrors.year = "Enter a valid year.";
  }
  if (!Number.isInteger(price) || price <= 0) {
    fieldErrors.price = "Enter a positive whole-rupee price.";
  }
  if (mileageRaw && (!Number.isInteger(Number(mileageRaw)) || Number(mileageRaw) < 0)) {
    fieldErrors.mileageKm = "Mileage must be a whole number.";
  }
  if (!FUELS.includes(fuelType)) fieldErrors.fuelType = "Select fuel type.";
  if (!GEARS.includes(transmission)) fieldErrors.transmission = "Select transmission.";
  if (!CONDITIONS.includes(condition)) fieldErrors.condition = "Select condition.";
  if (!AVAILABILITY.includes(availability)) {
    fieldErrors.availability = "Select availability.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  return {
    input: {
      name,
      slug,
      brandId,
      modelId,
      categoryId,
      year,
      price,
      currency: "INR",
      mileageKm: mileageRaw ? Number(mileageRaw) : undefined,
      fuelType,
      transmission,
      condition,
      availability,
      description,
      location: location || undefined,
      isFeatured: formData.get("isFeatured") === "on",
      hasGallery: formData.get("hasGallery") === "on",
      has360View: false,
      has3DExperience: formData.get("has3DExperience") === "on",
      optional3DModelUrl: model3d || undefined,
    },
  };
}

export async function createVehicleAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();

  const parsed = parseVehicle(formData);
  if (!parsed.input) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.fieldErrors };
  }
  if (await vehicleRepository.slugExists(parsed.input.slug)) {
    return {
      ok: false,
      error: "That slug is already in use.",
      fieldErrors: { slug: "Choose another slug." },
    };
  }

  let id: string;
  try {
    id = await vehicleRepository.create(parsed.input);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to create vehicle.",
    };
  }
  revalidatePublicCatalog(parsed.input.slug);
  revalidateAdmin();
  redirect(`/admin/vehicles/${id}/edit`);
}

export async function updateVehicleAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();

  const id = String(formData.get("id") ?? "");
  const previousSlug = String(formData.get("previousSlug") ?? "");
  if (!id) return { ok: false, error: "Missing vehicle." };

  const parsed = parseVehicle(formData);
  if (!parsed.input) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.fieldErrors };
  }
  if (await vehicleRepository.slugExists(parsed.input.slug, id)) {
    return {
      ok: false,
      error: "That slug is already in use.",
      fieldErrors: { slug: "Choose another slug." },
    };
  }

  try {
    await vehicleRepository.update(id, parsed.input);
    revalidatePublicCatalog(previousSlug);
    revalidatePublicCatalog(parsed.input.slug);
    revalidateAdmin();
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to update vehicle.",
    };
  }
}

export async function deleteVehicleAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!id) return { ok: false, error: "Missing vehicle." };

  let deleted: { imageUrls: string[] };
  try {
    deleted = await vehicleRepository.delete(id);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to delete vehicle.",
    };
  }
  for (const url of deleted.imageUrls) {
    await mediaStorage.deleteStoredUpload(url);
  }
  await mediaStorage.deleteVehicleUploadDir(id);
  revalidatePublicCatalog(slug);
  revalidateAdmin();
  redirect("/admin/vehicles");
}

export async function uploadVehicleImageAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const file = formData.get("image");
  if (!vehicleId || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }

  try {
    const saved = await mediaStorage.saveVehicleImage(vehicleId, file);
    await vehicleRepository.addImage({
      vehicleId,
      url: saved.url,
      alt: String(formData.get("alt") ?? "").trim(),
      isPrimary: formData.get("isPrimary") === "on",
    });
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true, id: vehicleId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to upload image.",
    };
  }
}

export async function setCoverImageAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  try {
    await vehicleRepository.setCoverImage(vehicleId, imageId);
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to set cover image.",
    };
  }
}

export async function deleteVehicleImageAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  try {
    const url = await vehicleRepository.deleteImage(vehicleId, imageId);
    await mediaStorage.deleteStoredUpload(url);
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to delete image.",
    };
  }
}

export async function upload360FrameAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const file = formData.get("image");
  if (!vehicleId || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a 360 frame to upload." };
  }

  try {
    const saved = await mediaStorage.saveVehicleImage(vehicleId, file, "360");
    await vehicleRepository.add360Frame({
      vehicleId,
      url: saved.url,
      alt: String(formData.get("alt") ?? "").trim(),
    });
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true, id: vehicleId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to upload 360 frame.",
    };
  }
}

export async function delete360FrameAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const frameId = String(formData.get("frameId") ?? "");
  try {
    const url = await vehicleRepository.delete360Frame(vehicleId, frameId);
    await mediaStorage.deleteStoredUpload(url);
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to delete 360 frame.",
    };
  }
}

export async function move360FrameAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const ordered = String(formData.get("orderedIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  try {
    await vehicleRepository.reorder360Frames(vehicleId, ordered);
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to reorder 360 frames.",
    };
  }
}

export async function set360EnabledAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";
  try {
    await vehicleRepository.set360Enabled(vehicleId, enabled);
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to update 360 experience.",
    };
  }
}

export async function moveVehicleImageAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const ordered = String(formData.get("orderedIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  try {
    await vehicleRepository.reorderImages(vehicleId, ordered);
    const record = await vehicleRepository.getVehicleById(vehicleId);
    revalidatePublicCatalog(record?.vehicle.slug);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to reorder images.",
    };
  }
}
