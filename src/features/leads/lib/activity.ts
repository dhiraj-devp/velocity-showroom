import type { LeadActivityType } from "@/features/leads/types";

export function parseActivityMetadata(raw: string | null | undefined): Record<string, string> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.length > 0 && value.length <= 255) {
        result[key] = value;
      }
    }
    return Object.keys(result).length ? result : undefined;
  } catch {
    return undefined;
  }
}

export function stringifyActivityMetadata(metadata?: Record<string, string>) {
  if (!metadata || Object.keys(metadata).length === 0) return null;
  return JSON.stringify(metadata);
}

export const MEANINGFUL_ACTIVITY_TYPES: LeadActivityType[] = [
  "lead_created",
  "note_added",
  "whatsapp_clicked",
  "call_clicked",
  "viewing_requested",
  "viewing_confirmed",
];
