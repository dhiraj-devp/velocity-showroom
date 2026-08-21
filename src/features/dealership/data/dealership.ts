import type { Dealership } from "@/features/dealership/types";

/**
 * Demo house configuration. Replace this object later with MySQL/admin settings.
 * Visual brand (VELOCITY) stays; contact details must not be hardcoded in UI.
 */
export const dealership: Dealership = {
  id: "velocity",
  name: "VELOCITY",
  legalName: "Velocity Atelier Private Limited",
  phone: "+91 22 6120 4500",
  whatsapp: "+91 22 6120 4500",
  email: "concierge@velocity.example",
  address: "12 Nariman Point",
  city: "Mumbai",
  country: "India",
  currency: "INR",
  primaryContactName: "Ayesha Mehta",
  openingHours: "Monday–Saturday, 10:00–19:00",
  mapsUrl: "https://maps.google.com/?q=Nariman+Point+Mumbai",
  social: {
    instagram: "https://instagram.com",
  },
};
