import { isDatabaseConfigured } from "@/db";
import { bookingRepository } from "@/features/bookings/repository/bookingRepository";
import type { ViewingBooking } from "@/features/bookings/types";
import { deskDayBounds, deskYmd } from "@/features/leads/lib/followUp";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import { reservationRepository } from "@/features/reservations/repository/reservationRepository";
import type { Lead, LeadStatus, DealPipelineMetrics } from "@/features/leads/types";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export type DeskSnapshot = {
  metrics: {
    newLeadsToday: number;
    followUpsDue: number;
    upcomingViewings: number;
    availableVehicles: number;
    leadsThisWeek: number;
    qualifiedLeads: number;
    wonLeads: number;
    soldVehicles: number;
    activeReservations: number;
    reservationsExpiringSoon: number;
  };
  pipeline: Record<LeadStatus, number>;
  dealPipeline: DealPipelineMetrics;
  overdueFollowUps: Lead[];
  todayFollowUps: Lead[];
  upcomingViewings: ViewingBooking[];
  recentLeads: Lead[];
  priorityLeads: Lead[];
};

const EMPTY_PIPELINE: Record<LeadStatus, number> = {
  new: 0,
  contacted: 0,
  qualified: 0,
  won: 0,
  lost: 0,
};

const EMPTY_DEAL_PIPELINE: DealPipelineMetrics = {
  openPipelineValue: 0,
  qualifiedPipelineValue: 0,
  wonRevenue: 0,
  averageWonDeal: null,
  wonDealsWithValue: 0,
  lostLeads: 0,
};

const EMPTY_SNAPSHOT: DeskSnapshot = {
  metrics: {
    newLeadsToday: 0,
    followUpsDue: 0,
    upcomingViewings: 0,
    availableVehicles: 0,
    leadsThisWeek: 0,
    qualifiedLeads: 0,
    wonLeads: 0,
    soldVehicles: 0,
    activeReservations: 0,
    reservationsExpiringSoon: 0,
  },
  pipeline: { ...EMPTY_PIPELINE },
  dealPipeline: { ...EMPTY_DEAL_PIPELINE },
  overdueFollowUps: [],
  todayFollowUps: [],
  upcomingViewings: [],
  recentLeads: [],
  priorityLeads: [],
};

function mergePriorityQueue(groups: Lead[][], limit = 8) {
  const seen = new Set<string>();
  const result: Lead[] = [];
  for (const group of groups) {
    for (const lead of group) {
      if (lead.status === "won" || lead.status === "lost") continue;
      if (seen.has(lead.id)) continue;
      seen.add(lead.id);
      result.push(lead);
      if (result.length >= limit) return result;
    }
  }
  return result;
}

export const dashboardRepository = {
  async getSnapshot(): Promise<DeskSnapshot> {
    if (!isDatabaseConfigured()) return EMPTY_SNAPSHOT;

    const { startToday, startTomorrow, startWeek } = deskDayBounds();
    const today = deskYmd();

    const [
      availability,
      pipeline,
      newLeadsToday,
      leadsThisWeek,
      followUpsDue,
      upcomingViewingsCount,
      overdueFollowUps,
      todayFollowUps,
      upcomingViewings,
      recentLeads,
      qualifiedLeads,
      dealPipeline,
      reservations,
    ] = await Promise.all([
      vehicleRepository.countByAvailability(),
      leadRepository.countByStatus(),
      leadRepository.countCreatedBetween(startToday, startTomorrow),
      leadRepository.countCreatedBetween(startWeek, startTomorrow),
      leadRepository.countFollowUpsDue(),
      bookingRepository.countUpcoming(today),
      leadRepository.listFollowUps("overdue", 8),
      leadRepository.listFollowUps("today", 8),
      bookingRepository.listUpcoming(today, 8),
      leadRepository.recent(8),
      leadRepository.list({ status: "qualified" }),
      leadRepository.pipelineMetrics(),
      reservationRepository.counts(),
    ]);

    const viewingLeadIds = upcomingViewings
      .map((item) => item.leadId)
      .filter((id): id is string => Boolean(id));
    const viewingLeads = await leadRepository.listByIds(viewingLeadIds);
    const hotLeads = [
      ...qualifiedLeads.filter((lead) => lead.priority === "hot"),
      ...recentLeads.filter((lead) => lead.priority === "hot"),
    ];

    return {
      metrics: {
        newLeadsToday,
        followUpsDue,
        upcomingViewings: upcomingViewingsCount,
        availableVehicles: availability.available,
        leadsThisWeek,
        qualifiedLeads: pipeline.qualified,
        wonLeads: pipeline.won,
        soldVehicles: availability.sold,
        activeReservations: reservations.active,
        reservationsExpiringSoon: reservations.expiringSoon,
      },
      pipeline,
      dealPipeline,
      overdueFollowUps,
      todayFollowUps,
      upcomingViewings,
      recentLeads,
      priorityLeads: mergePriorityQueue([
        overdueFollowUps,
        todayFollowUps,
        viewingLeads,
        hotLeads,
        recentLeads.filter((lead) => lead.status === "new"),
      ]),
    };
  },
};
