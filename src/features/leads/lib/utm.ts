const UTM_PATTERN = /^[\w.+%-][\w.+%-\s]{0,119}$/;

export function sanitizeUtm(value: string | undefined | null) {
  const raw = (value ?? "").trim().slice(0, 120);
  if (!raw) return undefined;
  if (!UTM_PATTERN.test(raw)) return undefined;
  return raw;
}

export function readClientUtm(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return {
    utmSource: sanitizeUtm(params.get("utm_source")),
    utmMedium: sanitizeUtm(params.get("utm_medium")),
    utmCampaign: sanitizeUtm(params.get("utm_campaign")),
  };
}
