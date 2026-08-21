import { and, count, desc, eq, gte, inArray, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { mapBooking, toCreateBookingValues } from "@/db/mapToDomain";
import { bookings } from "@/db/schema/bookings";
import { vehicles } from "@/db/schema/vehicles";
import type {
  BookingStatus,
  CreateBookingInput,
  ViewingBooking,
} from "@/features/bookings/types";

const OPEN_STATUSES = ["pending", "confirmed"] as const;

async function listJoined(where?: SQL, limit?: number) {
  const db = getDb();
  const query = db
    .select({
      booking: bookings,
      vehicleTitle: vehicles.title,
      vehicleSlug: vehicles.slug,
    })
    .from(bookings)
    .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .where(where)
    .orderBy(desc(bookings.bookingDate), desc(bookings.createdAt));
  const rows = limit ? await query.limit(limit) : await query;
  return rows.map((row) =>
    mapBooking(
      row.booking,
      row.vehicleTitle ? { name: row.vehicleTitle, slug: row.vehicleSlug ?? "" } : undefined,
    ),
  );
}

export const mysqlBookingRepository = {
  async create(input: CreateBookingInput): Promise<ViewingBooking> {
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(bookings).values(toCreateBookingValues(input, id));
    const [booking] = await listJoined(eq(bookings.id, id), 1);
    if (!booking) throw new Error("Booking was not persisted.");
    return booking;
  },

  async countByStatus(status: ViewingBooking["status"]): Promise<number> {
    const db = getDb();
    const [row] = await db
      .select({ n: count() })
      .from(bookings)
      .where(eq(bookings.status, status));
    return Number(row?.n ?? 0);
  },

  async countUpcoming(today: string): Promise<number> {
    const db = getDb();
    const [row] = await db
      .select({ n: count() })
      .from(bookings)
      .where(
        and(
          inArray(bookings.status, [...OPEN_STATUSES]),
          gte(bookings.bookingDate, today),
        ),
      );
    return Number(row?.n ?? 0);
  },

  async list(filters: { vehicleId?: string } = {}): Promise<ViewingBooking[]> {
    return listJoined(filters.vehicleId ? eq(bookings.vehicleId, filters.vehicleId) : undefined);
  },

  async listUpcoming(today: string, limit = 8): Promise<ViewingBooking[]> {
    const db = getDb();
    const rows = await db
      .select({
        booking: bookings,
        vehicleTitle: vehicles.title,
        vehicleSlug: vehicles.slug,
      })
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .where(
        and(
          inArray(bookings.status, [...OPEN_STATUSES]),
          gte(bookings.bookingDate, today),
        ),
      )
      .orderBy(bookings.bookingDate, bookings.bookingTime)
      .limit(limit);
    return rows.map((row) =>
      mapBooking(
        row.booking,
        row.vehicleTitle ? { name: row.vehicleTitle, slug: row.vehicleSlug ?? "" } : undefined,
      ),
    );
  },

  async getById(id: string): Promise<ViewingBooking | null> {
    const [booking] = await listJoined(eq(bookings.id, id), 1);
    return booking ?? null;
  },

  async updateStatus(id: string, status: BookingStatus) {
    const db = getDb();
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  },
};
