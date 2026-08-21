export const LEAD_SOURCES = [
  "website",
  "whatsapp",
  "phone",
  "instagram",
  "facebook",
  "google",
  "referral",
  "direct",
  "other",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const FOLLOW_UP_STATES = [
  "overdue",
  "today",
  "upcoming",
  "unscheduled",
] as const;

export type FollowUpState = (typeof FOLLOW_UP_STATES)[number];

export const LEAD_PRIORITIES = ["hot", "warm", "normal"] as const;

export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LOST_REASONS = [
  "price_too_high",
  "vehicle_sold_elsewhere",
  "no_response",
  "budget_issue",
  "not_interested",
  "purchased_elsewhere",
  "other",
] as const;

export type LostReason = (typeof LOST_REASONS)[number];

export const LEAD_ACTIVITY_TYPES = [
  "lead_created",
  "note_added",
  "whatsapp_clicked",
  "call_clicked",
  "viewing_requested",
  "viewing_confirmed",
  "viewing_completed",
  "viewing_cancelled",
  "status_changed",
  "follow_up_scheduled",
  "follow_up_completed",
  "follow_up_cleared",
  "whatsapp_follow_up_opened",
  "deal_value_updated",
  "lead_assigned",
  "reservation_created",
  "reservation_cancelled",
  "reservation_completed",
  "reservation_expired",
] as const;

export type LeadActivityType = (typeof LEAD_ACTIVITY_TYPES)[number];

export type Lead = {
  id: string;
  dealershipId?: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  vehiclePrice?: number;
  pagePath: string;
  source: LeadSource;
  sourceDetail?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: LeadStatus;
  nextFollowUpAt?: string;
  lastContactedAt?: string;
  expectedDealValue?: number;
  finalSaleValue?: number;
  lostReason?: LostReason;
  lostReasonDetail?: string;
  /** Admin session email today; remap to a user id when the desk gains a team. */
  assignedTo?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  hasOpenViewing?: boolean;
  interactionCount?: number;
  priority?: LeadPriority;
};

export type LeadNote = {
  id: string;
  leadId: string;
  body: string;
  createdBy?: string;
  createdAt: string;
};

export type LeadActivity = {
  id: string;
  leadId: string;
  type: LeadActivityType;
  title: string;
  metadata?: Record<string, string>;
  createdAt: string;
};

export type CreateLeadInput = {
  dealershipId?: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  pagePath: string;
  source: LeadSource;
  sourceDetail?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  visitorKey?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  createdBy?: string;
  assignedTo?: string;
};

export type LeadListFilters = {
  q?: string;
  status?: LeadStatus;
  source?: LeadSource;
  vehicleId?: string;
  followUp?: FollowUpState;
  priority?: LeadPriority;
};

export type VehicleLeadStats = {
  totalEnquiries: number;
  whatsappInteractions: number;
  callIntents: number;
  activeLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  viewings: number;
  pipelineValue: number;
  wonRevenue: number;
};

export type DealPipelineMetrics = {
  openPipelineValue: number;
  qualifiedPipelineValue: number;
  wonRevenue: number;
  averageWonDeal: number | null;
  wonDealsWithValue: number;
  lostLeads: number;
};

export type PublicClickKind = "whatsapp" | "call";
