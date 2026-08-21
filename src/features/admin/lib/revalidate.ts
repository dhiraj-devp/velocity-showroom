import { revalidatePath } from "next/cache";

export function revalidatePublicCatalog(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/cars", "page");
  revalidatePath("/cars/[slug]", "page");
  revalidatePath("/compare", "page");
  if (slug) {
    revalidatePath(`/cars/${slug}`, "page");
  }
}

export function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}
