import type { Lead, LeadSource } from "@/features/leads/types";

export function isIdentifiedLead(lead: Pick<Lead, "name" | "phone">) {
  return Boolean(lead.name.trim() || lead.phone.trim());
}

export function leadDisplayName(lead: Pick<Lead, "name" | "phone" | "source">) {
  if (lead.name.trim()) return lead.name.trim();
  return anonymousLeadLabel(lead.source);
}

export function anonymousLeadLabel(source: LeadSource) {
  if (source === "whatsapp") return "WhatsApp interaction";
  if (source === "phone") return "Call intent";
  return "Anonymous interaction";
}
