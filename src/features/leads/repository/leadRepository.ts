import { isDatabaseConfigured } from "@/db";
import { localLeadRepository } from "@/features/leads/repository/localLeadRepository";
import { mysqlLeadRepository } from "@/features/leads/repository/mysqlLeadRepository";
import type {
  CreateLeadInput,
  DealPipelineMetrics,
  FollowUpState,
  Lead,
  LeadActivity,
  LeadActivityType,
  LeadListFilters,
  LeadNote,
  LeadSource,
  LeadStatus,
  LostReason,
  PublicClickKind,
  VehicleLeadStats,
} from "@/features/leads/types";

const EMPTY_PIPELINE: Record<LeadStatus, number> = {
  new: 0,
  contacted: 0,
  qualified: 0,
  won: 0,
  lost: 0,
};

const EMPTY_STATS: VehicleLeadStats = {
  totalEnquiries: 0,
  whatsappInteractions: 0,
  callIntents: 0,
  activeLeads: 0,
  qualifiedLeads: 0,
  wonLeads: 0,
  viewings: 0,
  pipelineValue: 0,
  wonRevenue: 0,
};

const EMPTY_DEAL_PIPELINE: DealPipelineMetrics = {
  openPipelineValue: 0,
  qualifiedPipelineValue: 0,
  wonRevenue: 0,
  averageWonDeal: null,
  wonDealsWithValue: 0,
  lostLeads: 0,
};

export const leadRepository = {
  async create(input: CreateLeadInput): Promise<Lead> {
    if (isDatabaseConfigured()) {
      return mysqlLeadRepository.create(input);
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required to capture leads in production.");
    }
    return localLeadRepository.create(input);
  },

  async count(): Promise<number> {
    if (isDatabaseConfigured()) {
      return mysqlLeadRepository.count();
    }
    return 0;
  },

  async countByStatus() {
    if (!isDatabaseConfigured()) return { ...EMPTY_PIPELINE };
    return mysqlLeadRepository.countByStatus();
  },

  async countCreatedBetween(start: Date, end: Date) {
    if (!isDatabaseConfigured()) return 0;
    return mysqlLeadRepository.countCreatedBetween(start, end);
  },

  async countFollowUpsDue() {
    if (!isDatabaseConfigured()) return 0;
    return mysqlLeadRepository.countFollowUpsDue();
  },

  async list(filters: LeadListFilters = {}): Promise<Lead[]> {
    if (!isDatabaseConfigured()) return [];
    return mysqlLeadRepository.list(filters);
  },

  async listByIds(ids: string[]): Promise<Lead[]> {
    if (!isDatabaseConfigured()) return [];
    return mysqlLeadRepository.listByIds(ids);
  },

  async getById(id: string): Promise<Lead | null> {
    if (!isDatabaseConfigured()) return null;
    return mysqlLeadRepository.getById(id);
  },

  async updateStatus(
    id: string,
    status: LeadStatus,
    options?: {
      lostReason?: LostReason | null;
      lostReasonDetail?: string | null;
      actor?: string;
    },
  ) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update leads.");
    }
    return mysqlLeadRepository.updateStatus(id, status, options);
  },

  async updateFollowUp(id: string, nextFollowUpAt: Date | null, actor?: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update leads.");
    }
    return mysqlLeadRepository.updateFollowUp(id, nextFollowUpAt, actor);
  },

  async markContacted(id: string, lastContactedAt?: Date, actor?: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update leads.");
    }
    return mysqlLeadRepository.markContacted(id, lastContactedAt, actor);
  },

  async updateSource(id: string, source: LeadSource, sourceDetail?: string | null, actor?: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update leads.");
    }
    return mysqlLeadRepository.updateSource(id, source, sourceDetail, actor);
  },

  async updateDealValue(
    id: string,
    input: { expectedDealValue?: number | null; finalSaleValue?: number | null },
    actor?: string,
  ) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update leads.");
    }
    return mysqlLeadRepository.updateDealValue(id, input, actor);
  },

  async recordWhatsAppFollowUp(id: string, dealershipName: string, actor?: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update leads.");
    }
    return mysqlLeadRepository.recordWhatsAppFollowUp(id, dealershipName, actor);
  },

  async pipelineMetrics(): Promise<DealPipelineMetrics> {
    if (!isDatabaseConfigured()) return { ...EMPTY_DEAL_PIPELINE };
    return mysqlLeadRepository.pipelineMetrics();
  },

  async addNote(input: { leadId: string; body: string; createdBy?: string }) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to add lead notes.");
    }
    return mysqlLeadRepository.addNote(input);
  },

  async addActivity(input: {
    leadId: string;
    type: LeadActivityType;
    title: string;
    metadata?: Record<string, string>;
  }) {
    if (!isDatabaseConfigured()) return;
    return mysqlLeadRepository.addActivity(input);
  },

  async listNotes(leadId: string): Promise<LeadNote[]> {
    if (!isDatabaseConfigured()) return [];
    return mysqlLeadRepository.listNotes(leadId);
  },

  async listActivities(leadId: string): Promise<LeadActivity[]> {
    if (!isDatabaseConfigured()) return [];
    return mysqlLeadRepository.listActivities(leadId);
  },

  async recent(limit = 8): Promise<Lead[]> {
    if (!isDatabaseConfigured()) return [];
    return mysqlLeadRepository.recent(limit);
  },

  async listFollowUps(state: FollowUpState, limit = 8) {
    if (!isDatabaseConfigured()) return [];
    return mysqlLeadRepository.listFollowUps(state, limit);
  },

  async listOpenDesk() {
    if (!isDatabaseConfigured()) return [];
    return mysqlLeadRepository.listOpenDesk();
  },

  async statsForVehicle(vehicleId: string): Promise<VehicleLeadStats> {
    if (!isDatabaseConfigured()) return { ...EMPTY_STATS };
    return mysqlLeadRepository.statsForVehicle(vehicleId);
  },

  async trackPublicClick(input: {
    kind: PublicClickKind;
    vehicleId: string;
    vehicleName: string;
    vehicleSlug: string;
    visitorKey: string;
  }) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to track interactions.");
    }
    return mysqlLeadRepository.trackPublicClick(input);
  },

  async resolveForBooking(input: {
    vehicleId: string;
    vehicleName: string;
    vehicleSlug: string;
    name: string;
    phone: string;
    email?: string;
    visitorKey?: string;
  }) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to link bookings.");
    }
    return mysqlLeadRepository.resolveForBooking(input);
  },
};
