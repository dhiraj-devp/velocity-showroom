import Link from "next/link";
import { isDatabaseConfigured } from "@/db";
import { LeadPriorityBadge } from "@/features/admin/components/LeadPriorityBadge";
import { dashboardRepository } from "@/features/admin/repository/dashboardRepository";
import { leadDisplayName } from "@/features/leads/lib/display";
import {
  followUpStateLabel,
  formatDeskDateTime,
  getFollowUpState,
  overdueDurationLabel,
} from "@/features/leads/lib/followUp";
import { LEAD_SOURCE_LABELS } from "@/features/leads/lib/source";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/types";

export const metadata = { title: "Desk | VELOCITY" };

const PIPELINE_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

export default async function AdminPage() {
  const desk = await dashboardRepository.getSnapshot();
  const pipelineMax = Math.max(1, ...LEAD_STATUSES.map((status) => desk.pipeline[status]));

  return (
    <main id="main" className="admin-page">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">Overview</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">House desk</h1>
      <p className="mt-3 text-[0.62rem] tracking-[0.2em] text-muted uppercase">
        Persistence: {isDatabaseConfigured() ? "MySQL" : "Local fallback"}
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New leads today" value={desk.metrics.newLeadsToday} />
        <Stat label="Follow-ups due" value={desk.metrics.followUpsDue} />
        <Stat label="Upcoming viewings" value={desk.metrics.upcomingViewings} />
        <Stat label="Available vehicles" value={desk.metrics.availableVehicles} />
      </dl>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Leads this week" value={desk.metrics.leadsThisWeek} />
        <Stat label="Qualified leads" value={desk.metrics.qualifiedLeads} />
        <Stat label="Won leads" value={desk.metrics.wonLeads} />
        <Stat label="Sold vehicles" value={desk.metrics.soldVehicles} />
      </dl>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active reservations" value={desk.metrics.activeReservations} />
        <Stat label="Reservations expiring soon" value={desk.metrics.reservationsExpiringSoon} />
      </dl>

      <section className="mt-12">
        <h2 className="admin-heading">Sales pipeline</h2>
        <ol className="desk-pipeline mt-4">
          {LEAD_STATUSES.map((status) => (
            <li key={status}>
              <p className="text-[0.55rem] tracking-[0.2em] text-muted uppercase">
                {PIPELINE_LABELS[status]}
              </p>
              <p className="font-display mt-2 text-2xl">{desk.pipeline[status]}</p>
              <span
                className="desk-pipeline-bar"
                style={{ width: `${(desk.pipeline[status] / pipelineMax) * 100}%` }}
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="admin-heading">Deal pipeline</h2>
        <p className="mt-2 text-sm text-muted">
          Open value uses expected deal amounts. Won revenue only counts recorded final sale values.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Open pipeline" value={formatMoney(desk.dealPipeline.openPipelineValue)} />
          <Stat label="Qualified pipeline" value={formatMoney(desk.dealPipeline.qualifiedPipelineValue)} />
          <Stat label="Won revenue" value={formatMoney(desk.dealPipeline.wonRevenue)} />
          <Stat
            label="Average won deal"
            value={
              desk.dealPipeline.averageWonDeal
                ? formatPrice(desk.dealPipeline.averageWonDeal)
                : "—"
            }
          />
          <Stat label="Lost leads" value={desk.dealPipeline.lostLeads} />
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="admin-heading">Priority leads</h2>
        {desk.priorityLeads.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing needs attention yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {desk.priorityLeads.map((lead) => {
              const state = getFollowUpState(lead.nextFollowUpAt);
              return (
                <li key={lead.id} className="py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="text-sm">
                    {leadDisplayName(lead)}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-muted">
                    <span>{lead.vehicleName || "House"}</span>
                    <LeadPriorityBadge priority={lead.priority ?? "normal"} />
                    <span className="follow-up-state" data-state={state}>
                      {followUpStateLabel(state)}
                    </span>
                    <span>{LEAD_SOURCE_LABELS[lead.source]}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="admin-heading">Needs attention</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <AttentionList
            title="Overdue follow-ups"
            empty="No overdue follow-ups."
            items={desk.overdueFollowUps.map((lead) => ({
              id: lead.id,
              href: `/admin/leads/${lead.id}`,
              title: leadDisplayName(lead),
              detail: `${lead.vehicleName || "House"} · ${
                lead.nextFollowUpAt ? overdueDurationLabel(lead.nextFollowUpAt) : followUpStateLabel("overdue")
              }`,
            }))}
          />
          <AttentionList
            title="Follow-ups due today"
            empty="Nothing scheduled for today."
            items={desk.todayFollowUps.map((lead) => ({
              id: lead.id,
              href: `/admin/leads/${lead.id}`,
              title: leadDisplayName(lead),
              detail: `${lead.vehicleName || "House"} · ${formatDeskDateTime(lead.nextFollowUpAt)}`,
            }))}
          />
          <AttentionList
            title="Upcoming viewings"
            empty="No upcoming requests."
            items={desk.upcomingViewings.map((item) => ({
              id: item.id,
              href: `/admin/viewings/${item.id}`,
              title: item.name,
              detail: `${item.vehicleName} · ${item.preferredDate} ${item.preferredTime} · ${item.status}`,
            }))}
          />
          <AttentionList
            title="Recent new leads"
            empty="No enquiries yet."
            items={desk.recentLeads.map((lead) => ({
              id: lead.id,
              href: `/admin/leads/${lead.id}`,
              title: leadDisplayName(lead),
              detail: `${lead.vehicleName || "House"} · ${LEAD_SOURCE_LABELS[lead.source]} · ${lead.status}`,
            }))}
          />
        </div>
      </section>
    </main>
  );
}

function formatMoney(value: number) {
  return value > 0 ? formatPrice(value) : "₹0";
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border px-4 py-5">
      <dt className="text-[0.55rem] tracking-[0.22em] text-muted uppercase">{label}</dt>
      <dd className="font-display mt-2 text-3xl tracking-[-0.04em]">{value}</dd>
    </div>
  );
}

function AttentionList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: string; href: string; title: string; detail: string }[];
}) {
  return (
    <div>
      <h3 className="text-[0.58rem] tracking-[0.24em] text-muted uppercase">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              <Link href={item.href} className="text-sm">
                {item.title}
              </Link>
              <p className="mt-1 text-[0.78rem] text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
