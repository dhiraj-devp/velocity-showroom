import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/features/admin/components/ActionForm";
import { updateBookingStatusAction } from "@/features/admin/actions/bookings";
import { bookingRepository } from "@/features/bookings/repository/bookingRepository";

export const metadata = { title: "Viewing | Desk" };

export default async function AdminViewingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewing = await bookingRepository.getById(id);
  if (!viewing) notFound();

  return (
    <main id="main" className="admin-page max-w-3xl">
      <Link href="/admin/viewings" className="text-[0.58rem] tracking-[0.24em] text-muted uppercase">
        ← Viewings
      </Link>
      <h1 className="font-display mt-4 text-4xl tracking-[-0.04em]">{viewing.name}</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Vehicle</dt>
          <dd className="mt-1">
            <Link href={`/cars/${viewing.vehicleSlug}`}>{viewing.vehicleName}</Link>
          </dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Requested</dt>
          <dd className="mt-1">
            {viewing.preferredDate} {viewing.preferredTime}
          </dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Phone</dt>
          <dd className="mt-1">{viewing.phone}</dd>
        </div>
        {viewing.leadId ? (
          <div>
            <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Lead</dt>
            <dd className="mt-1">
              <Link href={`/admin/leads/${viewing.leadId}`}>Open linked lead</Link>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Type</dt>
          <dd className="mt-1">{viewing.type.replace("_", " ")}</dd>
        </div>
      </dl>
      {viewing.message ? (
        <p className="mt-8 border border-border px-4 py-4 text-sm">{viewing.message}</p>
      ) : null}

      <p className="mt-10 text-[0.62rem] tracking-[0.24em] text-muted uppercase">
        Status: {viewing.status}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {viewing.status === "pending" ? (
          <ActionForm action={updateBookingStatusAction}>
            <input type="hidden" name="id" value={viewing.id} />
            <input type="hidden" name="status" value="confirmed" />
            <button type="submit" className="collection-apply">Confirm</button>
          </ActionForm>
        ) : null}
        {viewing.status === "pending" || viewing.status === "confirmed" ? (
          <>
            <ActionForm action={updateBookingStatusAction}>
              <input type="hidden" name="id" value={viewing.id} />
              <input type="hidden" name="status" value="completed" />
              <button type="submit" className="admin-ghost">Mark completed</button>
            </ActionForm>
            <ActionForm action={updateBookingStatusAction}>
              <input type="hidden" name="id" value={viewing.id} />
              <input type="hidden" name="status" value="cancelled" />
              <button type="submit" className="admin-ghost">Cancel</button>
            </ActionForm>
          </>
        ) : null}
      </div>
    </main>
  );
}
