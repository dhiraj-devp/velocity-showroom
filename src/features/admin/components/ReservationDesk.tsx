import Link from "next/link";
import { ActionForm } from "@/features/admin/components/ActionForm";
import {
  cancelReservationAction,
  completeReservationSaleAction,
  createReservationAction,
} from "@/features/admin/actions/reservations";
import { leadDisplayName } from "@/features/leads/lib/display";
import { formatDeskDateTime } from "@/features/leads/lib/followUp";
import type { Lead } from "@/features/leads/types";
import type { VehicleReservation } from "@/features/reservations/types";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";

export function ReservationDesk({
  vehicleId,
  leads,
  reservation,
  allowCreate,
  defaultLeadId,
}: {
  vehicleId: string;
  leads: Lead[];
  reservation: VehicleReservation | null;
  allowCreate: boolean;
  defaultLeadId?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className="admin-heading">Reservation</h2>
      {reservation ? (
        <div className="mt-4">
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Status</dt>
              <dd className="mt-1">{reservation.status}</dd>
            </div>
            <div>
              <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Lead</dt>
              <dd className="mt-1">
                {reservation.leadId ? (
                  <Link href={`/admin/leads/${reservation.leadId}`}>
                    {reservation.leadName || "Open lead"}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Hold amount</dt>
              <dd className="mt-1">
                {reservation.reservationAmount ? formatPrice(reservation.reservationAmount) : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Expires</dt>
              <dd className="mt-1">{formatDeskDateTime(reservation.expiresAt)}</dd>
            </div>
            {reservation.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Notes</dt>
                <dd className="mt-1">{reservation.notes}</dd>
              </div>
            ) : null}
          </dl>
          {reservation.status === "active" ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionForm action={completeReservationSaleAction} success="Sale completed.">
                <input type="hidden" name="id" value={reservation.id} />
                <button type="submit" className="collection-apply">
                  Complete sale
                </button>
              </ActionForm>
              <ActionForm action={cancelReservationAction} success="Reservation cancelled.">
                <input type="hidden" name="id" value={reservation.id} />
                <button type="submit" className="admin-ghost">
                  Cancel reservation
                </button>
              </ActionForm>
            </div>
          ) : null}
        </div>
      ) : allowCreate ? (
        <ActionForm action={createReservationAction} className="mt-4 grid gap-3 sm:grid-cols-2" success="Vehicle reserved.">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <label className="collection-field sm:col-span-2">
            <span className="collection-label">Lead</span>
            <select className="collection-select" name="leadId" defaultValue={defaultLeadId ?? ""}>
              <option value="">No linked lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {leadDisplayName(lead)}
                </option>
              ))}
            </select>
          </label>
          <label className="collection-field">
            <span className="collection-label">Hold amount (INR)</span>
            <input className="collection-input" name="reservationAmount" inputMode="numeric" placeholder="Optional" />
          </label>
          <label className="collection-field">
            <span className="collection-label">Expires</span>
            <input className="collection-input" type="date" name="expiresDate" />
          </label>
          <label className="collection-field">
            <span className="collection-label">Expiry time</span>
            <input className="collection-input" type="time" name="expiresTime" defaultValue="18:00" />
          </label>
          <label className="collection-field sm:col-span-2">
            <span className="collection-label">Notes</span>
            <textarea className="collection-input min-h-20 py-3" name="notes" />
          </label>
          <button type="submit" className="collection-apply sm:col-span-2">
            Reserve vehicle
          </button>
        </ActionForm>
      ) : (
        <p className="mt-4 text-sm text-muted">This vehicle cannot be reserved in its current state.</p>
      )}
    </section>
  );
}
