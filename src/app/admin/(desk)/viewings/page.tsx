import Link from "next/link";
import { ActionForm } from "@/features/admin/components/ActionForm";
import { updateBookingStatusAction } from "@/features/admin/actions/bookings";
import { bookingRepository } from "@/features/bookings/repository/bookingRepository";
import { deskYmd } from "@/features/leads/lib/followUp";

export const metadata = { title: "Viewings | Desk" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function read(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function sortViewings<T extends { preferredDate: string; preferredTime: string; status: string }>(
  items: T[],
  today: string,
) {
  const upcoming = items.filter(
    (item) =>
      (item.status === "pending" || item.status === "confirmed") && item.preferredDate >= today,
  );
  const rest = items.filter((item) => !upcoming.includes(item));
  upcoming.sort(
    (a, b) => a.preferredDate.localeCompare(b.preferredDate) || a.preferredTime.localeCompare(b.preferredTime),
  );
  rest.sort((a, b) => b.preferredDate.localeCompare(a.preferredDate));
  return [...upcoming, ...rest];
}

export default async function AdminViewingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const vehicleId = read(params.vehicle);
  const today = deskYmd();
  const viewings = sortViewings(await bookingRepository.list({ vehicleId: vehicleId || undefined }), today);

  return (
    <main id="main" className="admin-page">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">Calendar</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">Viewings</h1>

      <div className="admin-table-wrap mt-8 hidden md:block">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Time</th>
              <th>Phone</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {viewings.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.vehicleName}</td>
                <td>{item.preferredDate}</td>
                <td>{item.preferredTime}</td>
                <td>{item.phone}</td>
                <td>{item.status}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/viewings/${item.id}`}>Open</Link>
                    {item.status === "pending" ? (
                      <ActionForm action={updateBookingStatusAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button type="submit" className="admin-ghost">Confirm</button>
                      </ActionForm>
                    ) : null}
                    {item.status === "pending" || item.status === "confirmed" ? (
                      <>
                        <ActionForm action={updateBookingStatusAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="status" value="completed" />
                          <button type="submit" className="admin-ghost">Done</button>
                        </ActionForm>
                        <ActionForm action={updateBookingStatusAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <button type="submit" className="admin-ghost">Cancel</button>
                        </ActionForm>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 grid gap-4 md:hidden">
        {viewings.map((item) => (
          <li key={item.id} className="border border-border p-4">
            <p className="font-display text-xl">{item.name}</p>
            <p className="mt-2 text-sm text-muted">
              {item.vehicleName} · {item.preferredDate} {item.preferredTime}
            </p>
            <StatusButtons id={item.id} status={item.status} />
            <Link href={`/admin/viewings/${item.id}`} className="mt-3 inline-block text-[0.62rem] tracking-[0.2em] uppercase">
              Open
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function StatusButtons({ id, status }: { id: string; status: string }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {status === "pending" ? (
        <ActionForm action={updateBookingStatusAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="confirmed" />
          <button type="submit" className="admin-ghost">Confirm</button>
        </ActionForm>
      ) : null}
      {status === "pending" || status === "confirmed" ? (
        <>
          <ActionForm action={updateBookingStatusAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="completed" />
            <button type="submit" className="admin-ghost">Complete</button>
          </ActionForm>
          <ActionForm action={updateBookingStatusAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="cancelled" />
            <button type="submit" className="admin-ghost">Cancel</button>
          </ActionForm>
        </>
      ) : null}
    </div>
  );
}
