import type { FollowUpState, Lead, LeadPriority, LeadSource, LeadStatus } from "@/features/leads/types";

export const EXPENSIVE_VEHICLE_INR = 20_000_000;

export type PrioritySignals = {
  status: LeadStatus;
  source: LeadSource;
  hasIdentifiedContact: boolean;
  hasOpenViewing: boolean;
  meaningfulInteractionCount: number;
  vehiclePrice?: number;
  followUpState: FollowUpState;
};

/**
 * Deterministic desk priority. Not a score and not AI.
 *
 * HOT when any of:
 * - status is qualified
 * - an open viewing exists (pending or confirmed)
 * - 3 or more meaningful interactions (created, WhatsApp, call, viewing, note)
 * - vehicle price is at least ₹2,00,00,000 and the lead has an identified contact
 *
 * WARM when not hot and any of:
 * - identified new enquiry
 * - source is WhatsApp or phone
 * - follow-up is due today or upcoming
 * - 2 meaningful interactions
 *
 * NORMAL otherwise.
 *
 * Won and lost leads still receive a label but are excluded from the priority queue.
 */
export function getLeadPriority(signals: PrioritySignals): LeadPriority {
  const expensive =
    typeof signals.vehiclePrice === "number" && signals.vehiclePrice >= EXPENSIVE_VEHICLE_INR;

  if (
    signals.status === "qualified" ||
    signals.hasOpenViewing ||
    signals.meaningfulInteractionCount >= 3 ||
    (expensive && signals.hasIdentifiedContact)
  ) {
    return "hot";
  }

  if (
    (signals.hasIdentifiedContact && signals.status === "new") ||
    signals.source === "whatsapp" ||
    signals.source === "phone" ||
    signals.followUpState === "today" ||
    signals.followUpState === "upcoming" ||
    signals.meaningfulInteractionCount >= 2
  ) {
    return "warm";
  }

  return "normal";
}

export function prioritySignalsFromLead(lead: Lead, followUpState: FollowUpState): PrioritySignals {
  return {
    status: lead.status,
    source: lead.source,
    hasIdentifiedContact: Boolean(lead.name.trim() || lead.phone.trim()),
    hasOpenViewing: Boolean(lead.hasOpenViewing),
    meaningfulInteractionCount: lead.interactionCount ?? 0,
    vehiclePrice: lead.vehiclePrice,
    followUpState,
  };
}

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  hot: "Hot",
  warm: "Warm",
  normal: "Normal",
};
