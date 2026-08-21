/** Admin/object-storage photos. Seeded `/images/vehicles/...` paths are cinematic placeholders, not files. */
export function isStoredVehiclePhoto(src: string) {
  return src.startsWith("/uploads/") || /^https?:\/\//.test(src);
}

export function preferStoredVehicleImages<T extends { url: string }>(images: T[]): T[] {
  const stored = images.filter((image) => isStoredVehiclePhoto(image.url));
  return stored.length > 0 ? stored : images;
}

export function compareVehicleImageOrder<
  T extends { isPrimary: boolean | number; sortOrder: number; id: string },
>(a: T, b: T) {
  const aPrimary = Boolean(a.isPrimary);
  const bPrimary = Boolean(b.isPrimary);
  if (aPrimary !== bPrimary) return aPrimary ? -1 : 1;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}
