"use server";

import { requireAdmin, unauthorizedResult } from "@/features/admin/lib/requireAdmin";
import { revalidateAdmin } from "@/features/admin/lib/revalidate";
import { bookingRepository } from "@/features/bookings/repository/bookingRepository";
import type { BookingStatus } from "@/features/bookings/types";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import type { LeadActivityType } from "@/features/leads/types";
import type { AdminResult } from "@/features/admin/actions/vehicles";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const ACTIVITY_BY_STATUS: Partial<
  Record<BookingStatus, { type: LeadActivityType; title: string }>
> = {
  confirmed: { type: "viewing_confirmed", title: "Viewing confirmed" },
  completed: { type: "viewing_completed", title: "Viewing completed" },
  cancelled: { type: "viewing_cancelled", title: "Viewing cancelled" },
};

export async function updateBookingStatusAction(formData: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return unauthorizedResult();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!id || id.length > 64 || !STATUSES.includes(status)) {
    return { ok: false, error: "Choose a valid status." };
  }
  try {
    const viewing = await bookingRepository.getById(id);
    if (!viewing) return { ok: false, error: "Viewing not found." };
    await bookingRepository.updateStatus(id, status);
    const activity = ACTIVITY_BY_STATUS[status];
    if (activity && viewing.leadId) {
      await leadRepository.addActivity({
        leadId: viewing.leadId,
        type: activity.type,
        title: activity.title,
        metadata: { bookingId: viewing.id },
      });
    }
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update viewing." };
  }
}
