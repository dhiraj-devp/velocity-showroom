import Link from "next/link";
import { LeadOpsMenu } from "@/features/admin/components/LeadOpsMenu";
import { LeadPriorityBadge } from "@/features/admin/components/LeadPriorityBadge";
import { leadDisplayName, isIdentifiedLead } from "@/features/leads/lib/display";
import {
  followUpStateLabel,
  formatDeskDateTime,
  getFollowUpState,
} from "@/features/leads/lib/followUp";
import { LEAD_SOURCE_LABELS } from "@/features/leads/lib/source";
import type { Lead } from "@/features/leads/types";

export function LeadWorkList({ leads, empty }: { leads: Lead[]; empty: string }) {
  if (leads.length === 0) {
    return <p className="mt-4 text-sm text-muted">{empty}</p>;
  }

  return (
    <>
      <div className="admin-table-wrap mt-4 hidden md:block">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Vehicle</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Source</th>
              <th>Next follow-up</th>
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
                  <td>
                    <LeadPriorityBadge priority={lead.priority ?? "normal"} />
                  </td>
                  <td>{lead.status}</td>
                  <td>{LEAD_SOURCE_LABELS[lead.source]}</td>
                  <td>
                    <span className="follow-up-state" data-state={state}>
                      {state === "unscheduled" ? "—" : formatDeskDateTime(lead.nextFollowUpAt)}
                    </span>
                  </td>
                  <td>
                    <LeadOpsMenu lead={lead} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 grid gap-4 md:hidden">
        {leads.map((lead) => {
          const state = getFollowUpState(lead.nextFollowUpAt);
          return (
            <li key={lead.id} className="border border-border p-4">
              <p className="font-display text-xl">{leadDisplayName(lead)}</p>
              <p className="mt-2 text-sm text-muted">
                {lead.vehicleName || "House"} · {LEAD_SOURCE_LABELS[lead.source]} · {lead.status}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                <LeadPriorityBadge priority={lead.priority ?? "normal"} />
                <span className="follow-up-state" data-state={state}>
                  {followUpStateLabel(state)}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="text-[0.62rem] tracking-[0.2em] uppercase"
                >
                  Open
                </Link>
                <LeadOpsMenu lead={lead} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
