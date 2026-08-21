import { notFound } from "next/navigation";
import Link from "next/link";
import { ActionForm } from "@/features/admin/components/ActionForm";
import { LeadActivityTimeline } from "@/features/admin/components/LeadActivityTimeline";
import { LeadDealSection } from "@/features/admin/components/LeadDealSection";
import { LeadFollowUpSection } from "@/features/admin/components/LeadFollowUpSection";
import { LeadOpsMenu } from "@/features/admin/components/LeadOpsMenu";
import { LeadPriorityBadge } from "@/features/admin/components/LeadPriorityBadge";
import { LeadStatusForm } from "@/features/admin/components/LeadStatusForm";
import { ReservationDesk } from "@/features/admin/components/ReservationDesk";
import { addLeadNoteAction } from "@/features/admin/actions/leads";
import { leadDisplayName, isIdentifiedLead } from "@/features/leads/lib/display";
import { formatDeskDateTime, getFollowUpState } from "@/features/leads/lib/followUp";
import { LEAD_SOURCE_LABELS } from "@/features/leads/lib/source";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import { reservationRepository } from "@/features/reservations/repository/reservationRepository";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export const metadata = { title: "Lead | Desk" };

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await leadRepository.getById(id);
  if (!lead) notFound();
  const [activities, reservation, vehicle] = await Promise.all([
    leadRepository.listActivities(id),
    reservationRepository.getActiveByLead(id),
    lead.vehicleId ? vehicleRepository.getVehicleById(lead.vehicleId) : Promise.resolve(null),
  ]);
  const followUp = getFollowUpState(lead.nextFollowUpAt);

  return (
    <main id="main" className="admin-page max-w-3xl">
      <Link href="/admin/leads" className="text-[0.58rem] tracking-[0.24em] text-muted uppercase">
        ← Leads
      </Link>
      <h1 className="font-display mt-4 text-4xl tracking-[-0.04em]">{leadDisplayName(lead)}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <LeadPriorityBadge priority={lead.priority ?? "normal"} />
        <span className="follow-up-state" data-state={followUp}>
          {followUp}
        </span>
        {!isIdentifiedLead(lead) ? (
          <span className="text-[0.58rem] tracking-[0.16em] text-muted uppercase">
            Identity unknown
          </span>
        ) : null}
        <LeadOpsMenu lead={lead} />
      </div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Phone</dt>
          <dd className="mt-1">{lead.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Email</dt>
          <dd className="mt-1">{lead.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Vehicle</dt>
          <dd className="mt-1">
            {lead.vehicleSlug ? (
              <Link href={`/cars/${lead.vehicleSlug}`}>{lead.vehicleName}</Link>
            ) : (
              lead.vehicleName || "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Created</dt>
          <dd className="mt-1">{formatDeskDateTime(lead.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Source</dt>
          <dd className="mt-1">
            {LEAD_SOURCE_LABELS[lead.source]}
            {lead.sourceDetail ? ` · ${lead.sourceDetail}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Page</dt>
          <dd className="mt-1">{lead.pagePath || "—"}</dd>
        </div>
        {lead.utmSource || lead.utmMedium || lead.utmCampaign ? (
          <div className="sm:col-span-2">
            <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Campaign</dt>
            <dd className="mt-1">
              {[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ")}
            </dd>
          </div>
        ) : null}
      </dl>
      {lead.message ? (
        <p className="mt-8 border border-border px-4 py-4 text-sm leading-relaxed">{lead.message}</p>
      ) : null}

      <LeadStatusForm lead={lead} />

      <LeadDealSection lead={lead} />

      {lead.vehicleId ? (
        <ReservationDesk
          vehicleId={lead.vehicleId}
          leads={[lead]}
          reservation={reservation}
          allowCreate={!reservation && vehicle?.vehicle.availability === "available"}
          defaultLeadId={lead.id}
        />
      ) : (
        <section className="mt-12">
          <h2 className="admin-heading">Reservation</h2>
          <p className="mt-4 text-sm text-muted">Link this lead to a vehicle before reserving stock.</p>
        </section>
      )}

      <LeadFollowUpSection lead={lead} />

      <section className="mt-12">
        <h2 className="admin-heading">Activity</h2>
        <LeadActivityTimeline activities={activities} />
      </section>

      <section className="mt-12">
        <h2 className="admin-heading">Internal notes</h2>
        <p className="mt-2 text-sm text-muted">Desk only. Notes also appear in the activity timeline.</p>
        <ActionForm action={addLeadNoteAction} className="mt-4" success="Note recorded.">
          <input type="hidden" name="leadId" value={lead.id} />
          <textarea className="collection-input min-h-24 py-3" name="body" required />
          <button type="submit" className="collection-apply mt-3">Add note</button>
        </ActionForm>
      </section>
    </main>
  );
}
