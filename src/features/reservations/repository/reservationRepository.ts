import { isDatabaseConfigured } from "@/db";
import { mysqlReservationRepository } from "@/features/reservations/repository/mysqlReservationRepository";
import type {
  CreateReservationInput,
  ReservationCounts,
  VehicleReservation,
} from "@/features/reservations/types";

const EMPTY_COUNTS: ReservationCounts = { active: 0, expiringSoon: 0 };

export const reservationRepository = {
  async getById(id: string): Promise<VehicleReservation | null> {
    if (!isDatabaseConfigured()) return null;
    return mysqlReservationRepository.getById(id);
  },

  async getActiveByVehicle(vehicleId: string): Promise<VehicleReservation | null> {
    if (!isDatabaseConfigured()) return null;
    return mysqlReservationRepository.getActiveByVehicle(vehicleId);
  },

  async getActiveByLead(leadId: string): Promise<VehicleReservation | null> {
    if (!isDatabaseConfigured()) return null;
    return mysqlReservationRepository.getActiveByLead(leadId);
  },

  async counts(): Promise<ReservationCounts> {
    if (!isDatabaseConfigured()) return { ...EMPTY_COUNTS };
    return mysqlReservationRepository.counts();
  },

  async create(input: CreateReservationInput) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to create reservations.");
    }
    return mysqlReservationRepository.create(input);
  },

  async cancel(id: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update reservations.");
    }
    return mysqlReservationRepository.cancel(id);
  },

  async completeSale(id: string, actor?: string) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to complete a sale.");
    }
    return mysqlReservationRepository.completeSale(id, actor);
  },
};
