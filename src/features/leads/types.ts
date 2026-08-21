export type LeadSource =
  | "vehicle_enquiry"
  | "whatsapp"
  | "book_viewing"
  | "test_drive"
  | "contact"
  | "register_interest";

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "viewing_booked"
  | "negotiating"
  | "won"
  | "lost";

export type Lead = {
  id: string;
  dealershipId?: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  pagePath: string;
  source: LeadSource;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: LeadStatus;
  createdAt: string;
};

export type CreateLeadInput = {
  dealershipId?: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  pagePath: string;
  source: LeadSource;
  name: string;
  phone: string;
  email?: string;
  message?: string;
};
