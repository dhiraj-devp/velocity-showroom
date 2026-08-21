import { LOST_REASONS, type LostReason } from "@/features/leads/types";

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  price_too_high: "Price too high",
  vehicle_sold_elsewhere: "Vehicle sold elsewhere",
  no_response: "No response",
  budget_issue: "Budget issue",
  not_interested: "Not interested",
  purchased_elsewhere: "Purchased elsewhere",
  other: "Other",
};

export function isLostReason(value: string): value is LostReason {
  return (LOST_REASONS as readonly string[]).includes(value);
}

export function sanitizeLostReasonDetail(value: string | undefined | null) {
  const detail = (value ?? "").trim().slice(0, 160);
  return detail || undefined;
}

export function lostReasonTitle(reason: LostReason, detail?: string) {
  const label = LOST_REASON_LABELS[reason];
  if (reason === "other" && detail) {
    return `Lead marked as lost — Other: ${detail}`;
  }
  return `Lead marked as lost — ${label}`;
}
