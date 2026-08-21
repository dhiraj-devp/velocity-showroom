import { LEAD_SOURCES, type LeadSource } from "@/features/leads/types";

const LEGACY_WEBSITE_SOURCES = new Set([
  "vehicle_enquiry",
  "book_viewing",
  "test_drive",
  "contact",
  "register_interest",
  "similar_enquiry",
]);

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  phone: "Phone",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  referral: "Referral",
  direct: "Direct",
  other: "Other",
};

export function isLeadSource(value: string): value is LeadSource {
  return (LEAD_SOURCES as readonly string[]).includes(value);
}

export function normalizeLeadSource(value: string | undefined | null): LeadSource {
  const raw = (value ?? "").trim().toLowerCase();
  if (isLeadSource(raw)) return raw;
  if (LEGACY_WEBSITE_SOURCES.has(raw)) return "website";
  return "other";
}

export function sanitizeSourceDetail(value: string | undefined | null) {
  const detail = (value ?? "").trim().slice(0, 64);
  return detail || undefined;
}
