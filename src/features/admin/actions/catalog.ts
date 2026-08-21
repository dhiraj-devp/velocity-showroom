"use server";

import { requireAdmin, unauthorizedResult } from "@/features/admin/lib/requireAdmin";
import { revalidateAdmin, revalidatePublicCatalog } from "@/features/admin/lib/revalidate";
import { isValidSlug, slugify } from "@/features/admin/lib/slug";
import { catalogRepository } from "@/features/vehicles/repository/catalogRepository";
import type { AdminResult } from "@/features/admin/actions/vehicles";

function nameAndSlug(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? name));
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter a name.";
  if (!isValidSlug(slug)) fieldErrors.slug = "Use a lowercase slug with hyphens.";
  return { name, slug, fieldErrors };
}

export async function createBrandAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const parsed = nameAndSlug(formData);
  if (Object.keys(parsed.fieldErrors).length) {
    return { ok: false, error: "Please correct the form.", fieldErrors: parsed.fieldErrors };
  }
  try {
    await catalogRepository.createBrand({
      id: parsed.slug,
      name: parsed.name,
      slug: parsed.slug,
    });
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to create brand." };
  }
}

export async function updateBrandAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = String(formData.get("id") ?? "");
  const parsed = nameAndSlug(formData);
  if (!id) return { ok: false, error: "Missing brand." };
  if (Object.keys(parsed.fieldErrors).length) {
    return { ok: false, error: "Please correct the form.", fieldErrors: parsed.fieldErrors };
  }
  try {
    await catalogRepository.updateBrand(id, { name: parsed.name, slug: parsed.slug });
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update brand." };
  }
}

export async function deleteBrandAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  try {
    await catalogRepository.deleteBrand(String(formData.get("id") ?? ""));
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to delete brand." };
  }
}

export async function createModelAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const brandId = String(formData.get("brandId") ?? "");
  const parsed = nameAndSlug(formData);
  if (!brandId) return { ok: false, error: "Select a brand.", fieldErrors: { brandId: "Required." } };
  if (Object.keys(parsed.fieldErrors).length) {
    return { ok: false, error: "Please correct the form.", fieldErrors: parsed.fieldErrors };
  }
  try {
    await catalogRepository.createModel({
      id: `${brandId}-${parsed.slug}`,
      brandId,
      name: parsed.name,
      slug: parsed.slug,
    });
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to create model." };
  }
}

export async function updateModelAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = String(formData.get("id") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const parsed = nameAndSlug(formData);
  if (!id || !brandId) return { ok: false, error: "Missing model." };
  try {
    await catalogRepository.updateModel(id, {
      brandId,
      name: parsed.name,
      slug: parsed.slug,
    });
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update model." };
  }
}

export async function deleteModelAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  try {
    await catalogRepository.deleteModel(String(formData.get("id") ?? ""));
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to delete model." };
  }
}

export async function createCategoryAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const parsed = nameAndSlug(formData);
  if (Object.keys(parsed.fieldErrors).length) {
    return { ok: false, error: "Please correct the form.", fieldErrors: parsed.fieldErrors };
  }
  try {
    await catalogRepository.createCategory({
      id: parsed.slug,
      name: parsed.name,
      slug: parsed.slug,
    });
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to create category." };
  }
}

export async function updateCategoryAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = String(formData.get("id") ?? "");
  const parsed = nameAndSlug(formData);
  try {
    await catalogRepository.updateCategory(id, { name: parsed.name, slug: parsed.slug });
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update category." };
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  try {
    await catalogRepository.deleteCategory(String(formData.get("id") ?? ""));
    revalidatePublicCatalog();
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to delete category." };
  }
}
