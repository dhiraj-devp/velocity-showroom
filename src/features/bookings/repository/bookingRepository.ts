import { isDatabaseConfigured } from "@/db";
import { localBookingRepository } from "@/features/bookings/repository/localBookingRepository";
import { mysqlBookingRepository } from "@/features/bookings/repository/mysqlBookingRepository";
import type { CreateBookingInput, ViewingBooking, BookingStatus } from "@/features/bookings/types";

export const bookingRepository = {
  async create(input: CreateBookingInput): Promise<ViewingBooking> {
    if (isDatabaseConfigured()) {
      return mysqlBookingRepository.create(input);
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "DATABASE_URL is required to capture bookings in production.",
      );
    }
    return localBookingRepository.create(input);
  },

  async countPending(): Promise<number> {
    if (isDatabaseConfigured()) {
      return mysqlBookingRepository.countByStatus("pending");
    }
    return 0;
  },

  async countUpcoming(today: string): Promise<number> {
    if (!isDatabaseConfigured()) return 0;
    return mysqlBookingRepository.countUpcoming(today);
  },

  async list(filters: { vehicleId?: string } = {}): Promise<ViewingBooking[]> {
    if (!isDatabaseConfigured()) return [];
    return mysqlBookingRepository.list(filters);
  },

  async listUpcoming(today: string, limit = 8): Promise<ViewingBooking[]> {
    if (!isDatabaseConfigured()) return [];
    return mysqlBookingRepository.listUpcoming(today, limit);
  },

  async getById(id: string): Promise<ViewingBooking | null> {
    if (!isDatabaseConfigured()) return null;
    return mysqlBookingRepository.getById(id);
  },

  async updateStatus(id: string, status: BookingStatus) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update viewings.");
    }
    return mysqlBookingRepository.updateStatus(id, status);
  },
};
