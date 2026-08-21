export type BookingType = "viewing" | "test_drive";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type ViewingBooking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  leadId?: string;
  name: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  type: BookingType;
  status: BookingStatus;
  createdAt: string;
};

export type CreateBookingInput = {
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  leadId?: string;
  name: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  type: BookingType;
};
