export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${suffix}`;
}
