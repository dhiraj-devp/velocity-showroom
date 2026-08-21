import type { CreateBookingInput, ViewingBooking } from "@/features/bookings/types";

const STORAGE_KEY = "velocity-bookings";

function readBookings(): ViewingBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ViewingBooking[];
  } catch {
    return [];
  }
}

function writeBookings(bookings: ViewingBooking[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Private browsing may block sessionStorage; the in-memory return still works.
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Local viewing/test-drive capture. Replace with API → MySQL later.
 */
export const localBookingRepository = {
  async create(input: CreateBookingInput): Promise<ViewingBooking> {
    await wait(450);

    const booking: ViewingBooking = {
      id: crypto.randomUUID(),
      vehicleId: input.vehicleId,
      vehicleName: input.vehicleName,
      vehicleSlug: input.vehicleSlug,
      leadId: input.leadId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      message: input.message?.trim() || undefined,
      type: input.type,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const bookings = readBookings();
    bookings.unshift(booking);
    writeBookings(bookings);
    return booking;
  },
};
