import { and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, like, lt, notInArray, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import {
  mapLead,
  mapLeadActivity,
  mapLeadNote,
  toCreateLeadValues,
} from "@/db/mapToDomain";
import { bookings } from "@/db/schema/bookings";
import { leadActivities } from "@/db/schema/lead-activities";
import { leadNotes } from "@/db/schema/lead-notes";
import { leads } from "@/db/schema/leads";
import { vehicles } from "@/db/schema/vehicles";
import { digitsOnly } from "@/features/dealership/lib/contact";
import { customerWhatsAppUrl } from "@/features/leads/lib/customerWhatsApp";
import { MEANINGFUL_ACTIVITY_TYPES, stringifyActivityMetadata } from "@/features/leads/lib/activity";
import { formatDeskDateTime, deskDayBounds, getFollowUpState } from "@/features/leads/lib/followUp";
import { lostReasonTitle } from "@/features/leads/lib/lostReason";
import { getLeadPriority, prioritySignalsFromLead } from "@/features/leads/lib/priority";
import { isLeadSource } from "@/features/leads/lib/source";
import { isVisitorKey } from "@/features/leads/lib/visitor";
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

const CRM_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
const OPEN_BOOKINGS = ["pending", "confirmed"] as const;
const OPEN_STATUSES = ["new", "contacted", "qualified"] as const;
const EMPTY_PIPELINE: Record<LeadStatus, number> = {
  new: 0,
  contacted: 0,
  qualified: 0,
  won: 0,
  lost: 0,
};
const CLICK_THROTTLE_MS = 90_000;

function escapeLike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function followUpConditions(state: FollowUpState) {
  const { startToday, startTomorrow } = deskDayBounds();
  if (state === "unscheduled") return isNull(leads.nextFollowUpAt);
  if (state === "overdue") {
    return and(isNotNull(leads.nextFollowUpAt), lt(leads.nextFollowUpAt, startToday));
  }
  if (state === "today") {
    return and(
      isNotNull(leads.nextFollowUpAt),
      gte(leads.nextFollowUpAt, startToday),
      lt(leads.nextFollowUpAt, startTomorrow),
    );
  }
  return and(isNotNull(leads.nextFollowUpAt), gte(leads.nextFollowUpAt, startTomorrow));
}

function vehicleInfo(row: {
  vehicleTitle: string | null;
  vehicleSlug: string | null;
  vehiclePrice: number | null;
}) {
  return row.vehicleTitle
    ? { name: row.vehicleTitle, slug: row.vehicleSlug ?? "", price: row.vehiclePrice ?? undefined }
    : undefined;
}

function createdTitle(input: CreateLeadInput) {
  const identified = Boolean(input.name?.trim() || input.phone?.trim());
  if (!identified) {
    if (input.source === "whatsapp") return "WhatsApp interaction recorded";
    if (input.source === "phone") return "Call intent recorded";
    return "Anonymous interaction recorded";
  }
  if (input.sourceDetail === "book_viewing") return "Lead created from viewing request";
  if (input.source === "website") return "Lead created from website enquiry";
  return `Lead created from ${input.source}`;
}

async function listJoined(where?: SQL, order: "created" | "followUp" = "created", limit?: number) {
  const db = getDb();
  const query = db
    .select({
      lead: leads,
      vehicleTitle: vehicles.title,
      vehicleSlug: vehicles.slug,
      vehiclePrice: vehicles.price,
    })
    .from(leads)
    .leftJoin(vehicles, eq(leads.vehicleId, vehicles.id))
    .where(where)
    .orderBy(order === "followUp" ? asc(leads.nextFollowUpAt) : desc(leads.createdAt));
  const rows = limit ? await query.limit(limit) : await query;
  return rows.map((row) => mapLead(row.lead, vehicleInfo(row)));
}

async function insertActivity(input: {
  leadId: string;
  type: LeadActivityType;
  title: string;
  metadata?: Record<string, string>;
}) {
  const db = getDb();
  await db.insert(leadActivities).values({
    id: crypto.randomUUID(),
    leadId: input.leadId,
    type: input.type,
    title: input.title.slice(0, 255),
    metadata: stringifyActivityMetadata(input.metadata),
  });
}

function asMoney(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

async function recentlyLogged(leadId: string, type: LeadActivityType, withinMs: number) {
  const db = getDb();
  const [recent] = await db
    .select({ createdAt: leadActivities.createdAt })
    .from(leadActivities)
    .where(and(eq(leadActivities.leadId, leadId), eq(leadActivities.type, type)))
    .orderBy(desc(leadActivities.createdAt))
    .limit(1);
  return Boolean(recent?.createdAt && Date.now() - recent.createdAt.getTime() < withinMs);
}

async function touchLead(id: string, actor: string | undefined, existing: Lead | null) {
  if (!actor) return;
  const db = getDb();
  const assignedTo = existing?.assignedTo || actor;
  await db
    .update(leads)
    .set({ updatedBy: actor, assignedTo })
    .where(eq(leads.id, id));
  if (!existing?.assignedTo) {
    await insertActivity({
      leadId: id,
      type: "lead_assigned",
      title: `Lead assigned to ${actor}`,
      metadata: { assignedTo: actor },
    });
  }
}

async function attachSignals(items: Lead[]): Promise<Lead[]> {
  if (items.length === 0) return items;
  const db = getDb();
  const ids = items.map((item) => item.id);
  const [openRows, countRows] = await Promise.all([
    db
      .select({ leadId: bookings.leadId })
      .from(bookings)
      .where(and(inArray(bookings.leadId, ids), inArray(bookings.status, [...OPEN_BOOKINGS]))),
    db
      .select({ leadId: leadActivities.leadId, n: count() })
      .from(leadActivities)
      .where(
        and(
          inArray(leadActivities.leadId, ids),
          inArray(leadActivities.type, [...MEANINGFUL_ACTIVITY_TYPES]),
        ),
      )
      .groupBy(leadActivities.leadId),
  ]);
  const open = new Set(openRows.map((row) => row.leadId).filter((id): id is string => Boolean(id)));
  const counts = new Map(countRows.map((row) => [row.leadId, Number(row.n)]));
  return items.map((lead) => {
    const next = {
      ...lead,
      hasOpenViewing: open.has(lead.id),
      interactionCount: counts.get(lead.id) ?? 0,
    };
    const followUp = getFollowUpState(next.nextFollowUpAt);
    return { ...next, priority: getLeadPriority(prioritySignalsFromLead(next, followUp)) };
  });
}

export const mysqlLeadRepository = {
  async create(input: CreateLeadInput): Promise<Lead> {
    const db = getDb();
    const id = crypto.randomUUID();
    const identified = Boolean(input.name?.trim() || input.phone?.trim());
    let expectedDealValue: number | null = null;
    if (identified && input.vehicleId) {
      const [vehicle] = await db
        .select({ price: vehicles.price })
        .from(vehicles)
        .where(eq(vehicles.id, input.vehicleId))
        .limit(1);
      expectedDealValue = vehicle?.price ?? null;
    }
    await db.insert(leads).values({
      ...toCreateLeadValues(input, id),
      expectedDealValue,
    });
    await insertActivity({
      leadId: id,
      type: "lead_created",
      title: createdTitle(input),
      metadata: {
        source: input.source,
        ...(input.sourceDetail ? { sourceDetail: input.sourceDetail } : {}),
        ...(input.pagePath ? { pagePath: input.pagePath } : {}),
      },
    });
    return (await this.getById(id))!;
  },

  async count(): Promise<number> {
    const db = getDb();
    const [row] = await db.select({ n: count() }).from(leads);
    return Number(row?.n ?? 0);
  },

  async countByStatus(): Promise<Record<LeadStatus, number>> {
    const db = getDb();
    const rows = await db
      .select({ status: leads.status, n: count() })
      .from(leads)
      .groupBy(leads.status);
    const result = { ...EMPTY_PIPELINE };
    for (const row of rows) result[row.status] = Number(row.n);
    return result;
  },

  async countCreatedBetween(start: Date, end: Date): Promise<number> {
    const db = getDb();
    const [row] = await db
      .select({ n: count() })
      .from(leads)
      .where(and(gte(leads.createdAt, start), lt(leads.createdAt, end)));
    return Number(row?.n ?? 0);
  },

  async countFollowUpsDue(): Promise<number> {
    const db = getDb();
    const { startTomorrow } = deskDayBounds();
    const [row] = await db
      .select({ n: count() })
      .from(leads)
      .where(and(isNotNull(leads.nextFollowUpAt), lt(leads.nextFollowUpAt, startTomorrow)));
    return Number(row?.n ?? 0);
  },

  async list(filters: LeadListFilters = {}): Promise<Lead[]> {
    const conditions: SQL[] = [];
    if (filters.status && CRM_STATUSES.includes(filters.status)) {
      conditions.push(eq(leads.status, filters.status));
    }
    if (filters.source && isLeadSource(filters.source)) {
      conditions.push(eq(leads.source, filters.source));
    }
    if (filters.vehicleId) {
      conditions.push(eq(leads.vehicleId, filters.vehicleId));
    }
    if (filters.followUp) {
      const clause = followUpConditions(filters.followUp);
      if (clause) conditions.push(clause);
    }
    if (filters.q) {
      const pattern = `%${escapeLike(filters.q)}%`;
      const search = or(
        like(leads.name, pattern),
        like(leads.phone, pattern),
        like(leads.email, pattern),
      );
      if (search) conditions.push(search);
    }
    const rows = await attachSignals(
      await listJoined(conditions.length ? and(...conditions) : undefined),
    );
    if (!filters.priority) return rows;
    return rows.filter((lead) => lead.priority === filters.priority);
  },

  async listByIds(ids: string[]): Promise<Lead[]> {
    if (ids.length === 0) return [];
    return attachSignals(await listJoined(inArray(leads.id, ids)));
  },

  async getById(id: string): Promise<Lead | null> {
    const [lead] = await attachSignals(await listJoined(eq(leads.id, id), "created", 1));
    return lead ?? null;
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
    if (!CRM_STATUSES.includes(status)) {
      throw new Error("Invalid lead status.");
    }
    const existing = await this.getById(id);
    if (!existing) throw new Error("Lead not found.");
    const db = getDb();
    const lostReason = status === "lost" ? options?.lostReason ?? existing.lostReason ?? null : existing.lostReason ?? null;
    const lostReasonDetail =
      status === "lost"
        ? lostReason === "other"
          ? options?.lostReasonDetail ?? existing.lostReasonDetail ?? null
          : null
        : existing.lostReasonDetail ?? null;
    await db
      .update(leads)
      .set({
        status,
        lostReason,
        lostReasonDetail,
        updatedBy: options?.actor ?? existing.updatedBy ?? null,
      })
      .where(eq(leads.id, id));
    await touchLead(id, options?.actor, existing);
    if (existing.status !== status) {
      const title =
        status === "won"
          ? "Lead marked as won"
          : status === "lost" && lostReason
            ? lostReasonTitle(lostReason, lostReasonDetail ?? undefined)
            : `Status changed from ${existing.status} to ${status}`;
      await insertActivity({
        leadId: id,
        type: "status_changed",
        title,
        metadata: {
          from: existing.status,
          to: status,
          ...(lostReason ? { lostReason } : {}),
          ...(lostReasonDetail ? { lostReasonDetail } : {}),
        },
      });
    } else if (status === "lost" && lostReason && lostReason !== existing.lostReason) {
      await insertActivity({
        leadId: id,
        type: "status_changed",
        title: lostReasonTitle(lostReason, lostReasonDetail ?? undefined),
        metadata: { to: status, lostReason, ...(lostReasonDetail ? { lostReasonDetail } : {}) },
      });
    }
  },

  async updateFollowUp(id: string, nextFollowUpAt: Date | null, actor?: string) {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Lead not found.");
    const db = getDb();
    await db.update(leads).set({ nextFollowUpAt }).where(eq(leads.id, id));
    await touchLead(id, actor, existing);
    if (nextFollowUpAt) {
      const previous = existing.nextFollowUpAt ? new Date(existing.nextFollowUpAt).getTime() : 0;
      if (Math.abs(previous - nextFollowUpAt.getTime()) > 60_000) {
        await insertActivity({
          leadId: id,
          type: "follow_up_scheduled",
          title: `Follow-up scheduled for ${formatDeskDateTime(nextFollowUpAt)}`,
          metadata: { followUpAt: nextFollowUpAt.toISOString() },
        });
      }
    } else if (existing.nextFollowUpAt) {
      await insertActivity({
        leadId: id,
        type: "follow_up_cleared",
        title: "Follow-up cleared",
      });
    }
  },

  async markContacted(id: string, lastContactedAt?: Date, actor?: string) {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Lead not found.");
    const contactedAt = lastContactedAt ?? new Date();
    const db = getDb();
    const nextStatus = existing.status === "new" ? "contacted" : existing.status;
    await db
      .update(leads)
      .set({ lastContactedAt: contactedAt, status: nextStatus })
      .where(eq(leads.id, id));
    await touchLead(id, actor, existing);
    if (existing.status === "new") {
      await insertActivity({
        leadId: id,
        type: "status_changed",
        title: "Status changed from new to contacted",
        metadata: { from: "new", to: "contacted" },
      });
    }
    await insertActivity({
      leadId: id,
      type: "follow_up_completed",
      title: "Lead marked contacted",
    });
  },

  async updateSource(id: string, source: LeadSource, sourceDetail?: string | null, actor?: string) {
    if (!isLeadSource(source)) {
      throw new Error("Invalid lead source.");
    }
    const existing = await this.getById(id);
    if (!existing) throw new Error("Lead not found.");
    const db = getDb();
    await db
      .update(leads)
      .set({ source, sourceDetail: sourceDetail?.trim() || null })
      .where(eq(leads.id, id));
    await touchLead(id, actor, existing);
  },

  async updateDealValue(
    id: string,
    input: { expectedDealValue?: number | null; finalSaleValue?: number | null },
    actor?: string,
  ) {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Lead not found.");
    const db = getDb();
    const expectedDealValue =
      input.expectedDealValue === undefined ? existing.expectedDealValue ?? null : input.expectedDealValue;
    const finalSaleValue =
      existing.status === "won"
        ? input.finalSaleValue === undefined
          ? existing.finalSaleValue ?? null
          : input.finalSaleValue
        : existing.finalSaleValue ?? null;
    await db.update(leads).set({ expectedDealValue, finalSaleValue }).where(eq(leads.id, id));
    await touchLead(id, actor, existing);
    const expectedChanged = (existing.expectedDealValue ?? null) !== expectedDealValue;
    const finalChanged = (existing.finalSaleValue ?? null) !== finalSaleValue;
    if (expectedChanged || finalChanged) {
      await insertActivity({
        leadId: id,
        type: "deal_value_updated",
        title: "Deal value updated",
        metadata: {
          ...(expectedChanged ? { expectedDealValue: String(expectedDealValue ?? "") } : {}),
          ...(finalChanged ? { finalSaleValue: String(finalSaleValue ?? "") } : {}),
        },
      });
    }
  },

  async recordWhatsAppFollowUp(id: string, dealershipName: string, actor?: string) {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Lead not found.");
    const url = customerWhatsAppUrl(existing, dealershipName);
    if (!url) throw new Error("This lead does not have a valid phone number.");
    await touchLead(id, actor, existing);
    if (!(await recentlyLogged(id, "whatsapp_follow_up_opened", CLICK_THROTTLE_MS))) {
      await insertActivity({
        leadId: id,
        type: "whatsapp_follow_up_opened",
        title: "WhatsApp follow-up opened",
        metadata: { channel: "whatsapp" },
      });
    }
    return url;
  },

  async pipelineMetrics(): Promise<DealPipelineMetrics> {
    const db = getDb();
    const [openRow, qualifiedRow, wonRow, lostRow] = await Promise.all([
      db
        .select({ total: sql<string>`coalesce(sum(${leads.expectedDealValue}), 0)` })
        .from(leads)
        .where(inArray(leads.status, [...OPEN_STATUSES])),
      db
        .select({ total: sql<string>`coalesce(sum(${leads.expectedDealValue}), 0)` })
        .from(leads)
        .where(eq(leads.status, "qualified")),
      db
        .select({
          total: sql<string>`coalesce(sum(${leads.finalSaleValue}), 0)`,
          n: count(),
        })
        .from(leads)
        .where(and(eq(leads.status, "won"), isNotNull(leads.finalSaleValue))),
      db.select({ n: count() }).from(leads).where(eq(leads.status, "lost")),
    ]);
    const wonRevenue = asMoney(wonRow[0]?.total);
    const wonDealsWithValue = Number(wonRow[0]?.n ?? 0);
    return {
      openPipelineValue: asMoney(openRow[0]?.total),
      qualifiedPipelineValue: asMoney(qualifiedRow[0]?.total),
      wonRevenue,
      averageWonDeal: wonDealsWithValue > 0 ? Math.round(wonRevenue / wonDealsWithValue) : null,
      wonDealsWithValue,
      lostLeads: Number(lostRow[0]?.n ?? 0),
    };
  },

  async addNote(input: { leadId: string; body: string; createdBy?: string }) {
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(leadNotes).values({
      id,
      leadId: input.leadId,
      body: input.body,
      createdBy: input.createdBy ?? null,
    });
    await insertActivity({
      leadId: input.leadId,
      type: "note_added",
      title: input.createdBy ? `Note added by ${input.createdBy}` : "Salesperson added a note",
    });
  },

  async addActivity(input: {
    leadId: string;
    type: LeadActivityType;
    title: string;
    metadata?: Record<string, string>;
  }) {
    await insertActivity(input);
  },

  async listNotes(leadId: string): Promise<LeadNote[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(leadNotes)
      .where(eq(leadNotes.leadId, leadId))
      .orderBy(desc(leadNotes.createdAt));
    return rows.map(mapLeadNote);
  },

  async listActivities(leadId: string): Promise<LeadActivity[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt));
    return rows.map(mapLeadActivity);
  },

  async recent(limit = 8): Promise<Lead[]> {
    return attachSignals(await listJoined(undefined, "created", limit));
  },

  async listFollowUps(state: FollowUpState, limit = 8): Promise<Lead[]> {
    return attachSignals(await listJoined(followUpConditions(state), "followUp", limit));
  },

  async listOpenDesk(): Promise<Lead[]> {
    return attachSignals(
      await listJoined(notInArray(leads.status, ["won", "lost"]), "followUp"),
    );
  },

  async statsForVehicle(vehicleId: string): Promise<VehicleLeadStats> {
    const db = getDb();
    const [statusRows, identifiedRow, viewingRow, activityRows, pipelineRow, wonRow] = await Promise.all([
      db
        .select({ status: leads.status, n: count() })
        .from(leads)
        .where(eq(leads.vehicleId, vehicleId))
        .groupBy(leads.status),
      db
        .select({ n: count() })
        .from(leads)
        .where(and(eq(leads.vehicleId, vehicleId), isNotNull(leads.name))),
      db
        .select({ n: count() })
        .from(bookings)
        .where(eq(bookings.vehicleId, vehicleId)),
      db
        .select({ type: leadActivities.type, n: count() })
        .from(leadActivities)
        .innerJoin(leads, eq(leadActivities.leadId, leads.id))
        .where(
          and(
            eq(leads.vehicleId, vehicleId),
            inArray(leadActivities.type, ["whatsapp_clicked", "call_clicked"]),
          ),
        )
        .groupBy(leadActivities.type),
      db
        .select({ total: sql<string>`coalesce(sum(${leads.expectedDealValue}), 0)` })
        .from(leads)
        .where(and(eq(leads.vehicleId, vehicleId), inArray(leads.status, [...OPEN_STATUSES]))),
      db
        .select({ total: sql<string>`coalesce(sum(${leads.finalSaleValue}), 0)` })
        .from(leads)
        .where(and(eq(leads.vehicleId, vehicleId), eq(leads.status, "won"), isNotNull(leads.finalSaleValue))),
    ]);
    const byStatus = { ...EMPTY_PIPELINE };
    for (const row of statusRows) byStatus[row.status] = Number(row.n);
    const activityCounts = { whatsapp_clicked: 0, call_clicked: 0 };
    for (const row of activityRows) {
      if (row.type === "whatsapp_clicked" || row.type === "call_clicked") {
        activityCounts[row.type] = Number(row.n);
      }
    }
    return {
      totalEnquiries: Number(identifiedRow[0]?.n ?? 0),
      whatsappInteractions: activityCounts.whatsapp_clicked,
      callIntents: activityCounts.call_clicked,
      activeLeads: byStatus.new + byStatus.contacted + byStatus.qualified,
      qualifiedLeads: byStatus.qualified,
      wonLeads: byStatus.won,
      viewings: Number(viewingRow[0]?.n ?? 0),
      pipelineValue: asMoney(pipelineRow[0]?.total),
      wonRevenue: asMoney(wonRow[0]?.total),
    };
  },

  async findForVisitorVehicle(visitorKey: string, vehicleId: string): Promise<Lead | null> {
    if (!isVisitorKey(visitorKey) || !vehicleId) return null;
    const rows = await attachSignals(
      await listJoined(
        and(eq(leads.visitorKey, visitorKey), eq(leads.vehicleId, vehicleId)),
        "created",
        8,
      ),
    );
    return (
      rows.find((lead) => lead.status !== "lost" && (lead.name.trim() || lead.phone.trim())) ??
      rows.find((lead) => lead.status !== "lost") ??
      null
    );
  },

  async findForPhoneVehicle(phone: string, vehicleId: string): Promise<Lead | null> {
    const digits = digitsOnly(phone);
    if (digits.length < 8 || !vehicleId) return null;
    const rows = await attachSignals(
      await listJoined(and(eq(leads.vehicleId, vehicleId), isNotNull(leads.phone)), "created", 20),
    );
    return (
      rows.find(
        (lead) => lead.status !== "lost" && digitsOnly(lead.phone) === digits,
      ) ?? null
    );
  },

  async enrichIdentity(
    id: string,
    input: { name?: string; phone?: string; email?: string; visitorKey?: string },
  ) {
    const db = getDb();
    const existing = await this.getById(id);
    if (!existing) return;
    await db
      .update(leads)
      .set({
        name: existing.name.trim() || input.name?.trim() || null,
        phone: existing.phone.trim() || input.phone?.trim() || null,
        email: existing.email || input.email?.trim() || null,
        ...(isVisitorKey(input.visitorKey) ? { visitorKey: input.visitorKey } : {}),
      })
      .where(eq(leads.id, id));
  },

  async trackPublicClick(input: {
    kind: PublicClickKind;
    vehicleId: string;
    vehicleName: string;
    vehicleSlug: string;
    visitorKey: string;
  }): Promise<Lead> {
    const source: LeadSource = input.kind === "whatsapp" ? "whatsapp" : "phone";
    const type: LeadActivityType = input.kind === "whatsapp" ? "whatsapp_clicked" : "call_clicked";
    const title =
      input.kind === "whatsapp" ? "WhatsApp click recorded" : "Call intent recorded";
    let lead = await this.findForVisitorVehicle(input.visitorKey, input.vehicleId);
    if (!lead) {
      lead = await this.create({
        vehicleId: input.vehicleId,
        vehicleName: input.vehicleName,
        vehicleSlug: input.vehicleSlug,
        pagePath: `/cars/${input.vehicleSlug}`,
        source,
        sourceDetail: input.kind === "whatsapp" ? "whatsapp_click" : "call_intent",
        visitorKey: input.visitorKey,
      });
    } else if (!lead.name && !lead.phone) {
      await this.enrichIdentity(lead.id, { visitorKey: input.visitorKey });
    }
    const db = getDb();
    const [recent] = await db
      .select({ createdAt: leadActivities.createdAt })
      .from(leadActivities)
      .where(and(eq(leadActivities.leadId, lead.id), eq(leadActivities.type, type)))
      .orderBy(desc(leadActivities.createdAt))
      .limit(1);
    if (recent?.createdAt && Date.now() - recent.createdAt.getTime() < CLICK_THROTTLE_MS) {
      return lead;
    }
    await insertActivity({
      leadId: lead.id,
      type,
      title,
      metadata: { pagePath: `/cars/${input.vehicleSlug}` },
    });
    return lead;
  },

  async resolveForBooking(input: {
    vehicleId: string;
    vehicleName: string;
    vehicleSlug: string;
    name: string;
    phone: string;
    email?: string;
    visitorKey?: string;
  }): Promise<Lead> {
    const byPhone = await this.findForPhoneVehicle(input.phone, input.vehicleId);
    const byVisitor =
      input.visitorKey && !byPhone
        ? await this.findForVisitorVehicle(input.visitorKey, input.vehicleId)
        : null;
    const existing = byPhone ?? byVisitor;
    if (existing) {
      await this.enrichIdentity(existing.id, {
        name: input.name,
        phone: input.phone,
        email: input.email,
        visitorKey: input.visitorKey,
      });
      return (await this.getById(existing.id)) ?? existing;
    }
    return this.create({
      vehicleId: input.vehicleId,
      vehicleName: input.vehicleName,
      vehicleSlug: input.vehicleSlug,
      pagePath: `/cars/${input.vehicleSlug}`,
      source: "website",
      sourceDetail: "book_viewing",
      visitorKey: input.visitorKey,
      name: input.name,
      phone: input.phone,
      email: input.email,
    });
  },
};
