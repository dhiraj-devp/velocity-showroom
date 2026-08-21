export const RESERVATION_STATUSES = [
  "active",
  "completed",
  "cancelled",
  "expired",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type VehicleReservation = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  leadId?: string;
  leadName?: string;
  reservationAmount?: number;
  status: ReservationStatus;
  expiresAt?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
};

export type CreateReservationInput = {
  vehicleId: string;
  leadId?: string;
  reservationAmount?: number;
  expiresAt?: Date | null;
  notes?: string;
  createdBy?: string;
};

export type ReservationCounts = {
  active: number;
  expiringSoon: number;
};
