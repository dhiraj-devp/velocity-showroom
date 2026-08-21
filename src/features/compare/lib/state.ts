export const COMPARE_PARAM = "v";
export const COMPARE_STORAGE_KEY = "velocity-compare";
export const MAX_COMPARE = 3;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function sanitizeCompareSlug(value: string) {
  const slug = value.trim().toLowerCase();
  if (!slug || slug.length > 160 || !SLUG_PATTERN.test(slug)) return "";
  return slug;
}

export function uniqueCompareSlugs(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const slug = sanitizeCompareSlug(value);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    result.push(slug);
    if (result.length >= MAX_COMPARE) break;
  }
  return result;
}

export function parseCompareSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const raw = searchParams[COMPARE_PARAM];
  const parts = Array.isArray(raw)
    ? raw.flatMap((item) => item.split(","))
    : (raw ?? "").split(",");
  return uniqueCompareSlugs(parts);
}

export function serializeCompareQuery(slugs: string[]) {
  const next = uniqueCompareSlugs(slugs);
  if (next.length === 0) return "";
  return `${COMPARE_PARAM}=${next.map(encodeURIComponent).join(",")}`;
}

export function compareHref(slugs: string[]) {
  const query = serializeCompareQuery(slugs);
  return query ? `/compare?${query}` : "/compare";
}

export function readStoredCompareSlugs() {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return uniqueCompareSlugs(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return [];
  }
}

export function writeStoredCompareSlugs(slugs: string[]) {
  if (typeof window === "undefined") return;
  const next = uniqueCompareSlugs(slugs);
  try {
    sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing may block storage.
  }
}
