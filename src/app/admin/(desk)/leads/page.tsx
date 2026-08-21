import { LeadOpsMenu } from "@/features/admin/components/LeadOpsMenu";
import { LeadPriorityBadge } from "@/features/admin/components/LeadPriorityBadge";
import { RecordLeadForm } from "@/features/admin/components/RecordLeadForm";
import { leadDisplayName, isIdentifiedLead } from "@/features/leads/lib/display";
import {
  followUpStateLabel,
  formatDeskDateTime,
  getFollowUpState,
} from "@/features/leads/lib/followUp";
import { LEAD_SOURCE_LABELS } from "@/features/leads/lib/source";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import {
  FOLLOW_UP_STATES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type FollowUpState,
  type LeadPriority,
  type LeadSource,
  type LeadStatus,
} from "@/features/leads/types";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export const metadata = { title: "Leads | Desk" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function read(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFollowUp(value: string): FollowUpState | undefined {
  if (value === "none" || value === "unscheduled") return "unscheduled";
  return FOLLOW_UP_STATES.includes(value as FollowUpState) ? (value as FollowUpState) : undefined;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = read(params.q).trim();
  const status = read(params.status);
  const source = read(params.source);
  const vehicleId = read(params.vehicle);
  const followUp = read(params.followUp);
  const priority = read(params.priority);
  const [leads, catalog] = await Promise.all([
    leadRepository.list({
      q,
      status: LEAD_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : undefined,
      source: LEAD_SOURCES.includes(source as LeadSource) ? (source as LeadSource) : undefined,
      vehicleId: vehicleId || undefined,
      followUp: parseFollowUp(followUp),
      priority: LEAD_PRIORITIES.includes(priority as LeadPriority)
        ? (priority as LeadPriority)
        : undefined,
    }),
    vehicleRepository.getCatalog(),
  ]);

  return (
    <main id="main" className="admin-page">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">CRM</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">Leads</h1>

      <RecordLeadForm vehicles={catalog.vehicles} />

      <form className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input className="collection-input" name="q" defaultValue={q} placeholder="Search" />
        <select className="collection-select" name="status" defaultValue={status}>
          <option value="">Any status</option>
          {LEAD_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="collection-select" name="priority" defaultValue={priority}>
          <option value="">Any priority</option>
          {LEAD_PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="collection-select" name="source" defaultValue={source}>
          <option value="">Any source</option>
          {LEAD_SOURCES.map((item) => (
            <option key={item} value={item}>
              {LEAD_SOURCE_LABELS[item]}
            </option>
          ))}
        </select>
        <select className="collection-select" name="vehicle" defaultValue={vehicleId}>
          <option value="">Any vehicle</option>
          {catalog.vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </option>
          ))}
        </select>
        <select
          className="collection-select"
          name="followUp"
          defaultValue={followUp === "unscheduled" ? "none" : followUp}
        >
          <option value="">Any follow-up</option>
          <option value="overdue">Overdue</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="none">None</option>
        </select>
        <button type="submit" className="collection-apply">
          Filter
        </button>
      </form>

      <div className="admin-table-wrap mt-8 hidden md:block">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Vehicle</th>
              <th>Source</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Next follow-up</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const state = getFollowUpState(lead.nextFollowUpAt);
              return (
                <tr key={lead.id}>
                  <td>
                    {leadDisplayName(lead)}
                    <span className="mt-1 block text-[0.78rem] text-muted">
                      {isIdentifiedLead(lead) ? lead.phone : "Identity unknown"}
                    </span>
                  </td>
                  <td>{lead.vehicleName || "—"}</td>
                  <td>{LEAD_SOURCE_LABELS[lead.source]}</td>
                  <td>{lead.status}</td>
                  <td>
                    <LeadPriorityBadge priority={lead.priority ?? "normal"} />
                  </td>
                  <td>
                    <span className="follow-up-state" data-state={state}>
                      {state === "unscheduled" ? "—" : formatDeskDateTime(lead.nextFollowUpAt)}
                    </span>
                  </td>
                  <td>{lead.createdAt.slice(0, 10)}</td>
                  <td>
                    <LeadOpsMenu lead={lead} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 grid gap-4 md:hidden">
        {leads.map((lead) => {
          const state = getFollowUpState(lead.nextFollowUpAt);
          return (
            <li key={lead.id} className="border border-border p-4">
              <p className="font-display text-xl">{leadDisplayName(lead)}</p>
              <p className="mt-2 text-sm text-muted">
                {lead.vehicleName || "House"} · {LEAD_SOURCE_LABELS[lead.source]} · {lead.status}
              </p>
              <p className="mt-2 text-sm text-muted">
                <LeadPriorityBadge priority={lead.priority ?? "normal"} /> · Follow-up:{" "}
                {followUpStateLabel(state)}
              </p>
              <div className="mt-3">
                <LeadOpsMenu lead={lead} />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
